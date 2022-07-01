import os, sys; sys.path.append('..')

import uvicorn
import asyncio
from fastapi.middleware.cors import CORSMiddleware

from enum import Enum
from typing import Union
from flask import jsonify
from fastapi import FastAPI, Query, Path, HTTPException
from pydantic import BaseModel, HttpUrl
import networkx as nx

import math
import re, praw, json, ipfshttpclient, time, datetime
import pandas as pd
import sqlite3
from substrate_helpers import make_call, addSchema, get_msa_id, \
            get_signature, create_msa_with_delegator, mint_votes, mint_user, get_schemas_from_pattern, \
            get_content_from_schemas, mint_data, follow_user
from substrateinterface import SubstrateInterface, Keypair

con = sqlite3.connect('postthreadV1_write.db', check_same_thread=False)
cur = con.cursor()

substrate = SubstrateInterface(
    url="ws://127.0.0.1:9944",
    ss58_format=42,
    type_registry_preset='kusama'
)
bob = Keypair.create_from_uri('//Bob')


reddit_creds = json.load(open(".reddit_creds.json", "r"))
reddit = praw.Reddit(
    client_id=reddit_creds["client_id"],
    client_secret=reddit_creds["client_secret"],
    password=reddit_creds["password"],
    user_agent=reddit_creds["user_agent"],
    username=reddit_creds["username"],
)

client = ipfshttpclient.connect()

user_starting_level = 10
daily_token_rewards = 100000
accounts = json.load(open("accounts.json", "r"))
schemas = json.load(open("schemas.json", "r"))
example_post = pd.read_sql_query(f"SELECT ipfs_hash FROM post WHERE msa_id_from_query = {accounts['Charlie']} LIMIT 1", con)['ipfs_hash'].iloc[0]
path = "/tmp/"
date_format = "%Y-%m-%d %H:%M:%S"

tags_metadata = [
    {
        "name": "frontpage",
        "description": "Methods to be used on the frontpage",
    },
    {
        "name": "postpage",
        "description": "Methods to be used on the submit page (where a post is created)",
    },
    {
        "name": "submitpage",
        "description": "Methods to be used on the submit page (where a post is created)",
    },
    {
        "name": "userpage",
        "description": "Methods to be used on the user's profile page",
    },
    {
        "name": "airdroppage",
        "description": "Methods to be used on the airdrop page",
    },
]
app = FastAPI(title="PostThreadAPI", openapi_tags=tags_metadata, root_path_in_servers=False)

origins = [
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get('/post/{post_hash}', tags=["postpage"], summary="Get post data from IPFS hash")
def post_get(
            post_hash: str = Path(default=example_post, example=example_post, description='IPFS hash of post to get data for'),  
        ):
    query = f'''
    SELECT * FROM post 
    LEFT JOIN (
        SELECT parent_hash, SUM(num_votes) AS total_votes 
        FROM vote GROUP BY parent_hash
    ) votes ON votes.parent_hash = post.ipfs_hash
    WHERE post.ipfs_hash = '{post_hash}'
    ORDER BY post.date_minted DESC
    '''
    df = pd.read_sql_query(query, con)
    if df.size == 0:
        return HTTPException(status_code=404, detail="Post not found")

    response = df.to_dict(orient='records')[0]
    return response

class PostInput(BaseModel):
    category: str
    title: str
    body: str
    url: HttpUrl = "http://www.google.com"
    is_nsfw: bool 
    
@app.post('/submit/post', tags=["submitpage"], summary="Submit data to mint a post.")
async def submit_post(
            postInput: PostInput, 
            user_msa_id: int = Query(default=None, example=accounts['Charlie'], description='msa_id of user to submit post for'), 
            wait_for_inclusion: Union[bool, None]=None, wait_for_finalization: Union[bool, None]=None
        ):

    if user_msa_id is None:
        df = get_user(user_msa_id=user_msa_id)
        if df.size == 0:
            return HTTPException(status_code=404, detail="User not found")
        user_msa_id = df['msa_id'].iloc[0]

    _, receipt = mint_data(postInput.__dict__, user_msa_id, schemas['post'], path+'posts/', 
                           wait_for_inclusion=wait_for_inclusion, wait_for_finalization=wait_for_finalization)
    if wait_for_inclusion and not receipt.error_message:
        return HTTPException(status_code=402, detail=receipt.error_message)

    return {"Success": "Post was created and will finalize on the blockchain soon."}
    
@app.post('/submit/vote', tags=["postpage"], summary="Submit an upvote or downvote")
async def submit_vote(
            post_hash: str = Query(default=example_post, example=example_post, description='Post we interacting with'), 
            parent_hash: str = Query(default=example_post, example=example_post, 
                                    description='Parent to vote on. same as post_hash if voting on a post'), 
            parent_type: str = Query(default="post", example="post", description='Whether parent is a post or comment'), 
            num_votes: int = Query(default=1, example=1, description='1 for upvote, -1 for downvote'), 
            user_msa_id: int = Query(default=None, example=accounts['Charlie'], description='msa_id of user to submit post for'), 
            wait_for_inclusion: Union[bool, None]=None, wait_for_finalization: Union[bool, None]=None
        ):

    if user_msa_id is None:
        df = get_user(user_msa_id=user_msa_id)
        if df.size == 0:
            return HTTPException(status_code=404, detail="User not found")
        user_msa_id = df['msa_id'].iloc[0]

    data = '{' + f'"post_hash": {post_hash},"parent_hash": {parent_hash},"parent_type": {parent_type},"num_votes": {num_votes}' + '}'
    _, receipt = mint_data(data, user_msa_id, schemas['vote'], 
                        wait_for_inclusion=wait_for_inclusion, wait_for_finalization=wait_for_finalization)
    
    
    if wait_for_inclusion:
        if receipt.error_message:
            return HTTPException(status_code=402, detail=receipt.error_message)
        return {"Success": "Vote was created and posted to the blockchain."} 

    return {"Success": "Vote was created and will finalize on the blockchain soon."}
    
class CommentInput(BaseModel):
    post_hash: str = Query(default=example_post, example=example_post, description='Hash of the post to comment on.')
    parent_comment_hash: Union[str, None] = Query(default=example_post, example=example_post, description='Hash of the parent comment to comment on.')
    depth: int = Query(default=0, example=0, description='How many levels of comments to go down. (comment on a post is 0 depth)')
    body: str
    is_nsfw: bool 
    
@app.post('/submit/comment', tags=["postpage"], summary="Submit data to mint a comment.")
async def submit_comment(
            commentInput: CommentInput, 
            user_msa_id: int = Query(default=None, example=accounts['Charlie'], description='msa_id of user to submit post for'), 
            wait_for_inclusion: Union[bool, None]=None, wait_for_finalization: Union[bool, None]=None
        ):

    if user_msa_id is None:
        df = get_user(user_msa_id=user_msa_id)
        if df.size == 0:
            return HTTPException(status_code=404, detail="User not found")
        user_msa_id = df['msa_id'].iloc[0]

    _, receipt = mint_data(commentInput.__dict__, user_msa_id, schemas['post'], path+'comments/', 
                        wait_for_inclusion=wait_for_inclusion, wait_for_finalization=wait_for_finalization)
    if wait_for_inclusion and not receipt.error_message:
            return HTTPException(status_code=402, detail=receipt.error_message)

    return {"Success": "Comment was created and will finalize on the blockchain soon."}

class SortOptions(str, Enum):
    top = "top"
    new = "new"

@app.get('/categories', tags=["frontpage"], summary="Get all categories")
def categories_get(
            category_name: Union[str, None] = Query(default=None, example="dogeco", 
                            description='If searching for a category, specify the name. Leave empty to get all categories'), 
            sort_by: Union[SortOptions, None] = Query(default=None, example="top", description='Sort by (top or new)'),
            minutes_filter: Union[int, None] = Query(default=None, example=60*24, description='Number of minutes from now to filter by. Post older will be dropped'),
            multiple: Union[bool, None] = Query(default=None, example=False, description="whether to return multiple categories"),
        ): 
    date_where = ""
    if minutes_filter is not None:
        date_time = datetime.datetime.now() - datetime.timedelta(minutes=minutes_filter)
        date_str = date_time.strftime(date_format)
        date_where = f"post.date_minted >= '{date_str}'"
        
    category_where = ""
    if category_name:
        category_where = f"post.category LIKE '%{category_name}%'"
        
    where_statement = ""
    for where in [date_where, category_where]:
        if where:
            if where_statement == "":
                where_statement += "WHERE "
            else:
                where_statement += " AND "
            where_statement += where

    order_by = ""
    if sort_by is None or sort_by == 'top':
        order_by = "ORDER BY total_votes DESC"
    if sort_by == 'new':
        order_by = "ORDER BY date_minted DESC"

    query = f'''
    SELECT * FROM post
    LEFT JOIN (
        SELECT parent_hash, SUM(num_votes) AS total_votes 
        FROM vote GROUP BY parent_hash
    ) votes ON votes.parent_hash = post.ipfs_hash
    LEFT JOIN (
        SELECT msa_id, username, password, profile_pic, wallet_ss58_address, block_number AS user_block_number, provider_key AS user_provider_key, date_minted AS user_date_minted
        FROM user u1
        WHERE date_minted = (SELECT max(date_minted) 
            FROM user u2
             WHERE u1.msa_id = u2.msa_id)
    ) users ON users.msa_id = post.msa_id_from_query
    {where_statement}
    {order_by}
    '''
    df = pd.read_sql_query(query, con).drop_duplicates()
    
    if df.size > 1:
        df_user = df[df['category'] == category_name]
        if df_user.size > 0:
            idxs = df_user.index
            df = pd.concat([df.iloc[idxs,:], df.drop(idxs, axis=0)], axis=0)
    
    return list(df.groupby('category')['total_votes'].count().sort_values(ascending=False).index)

class AnnouncementTypeOptions(str, Enum):
    posts = "posts"
    comments = "comments"
    
@app.get('/announcement/{announcement_type}/{page_number}/{num_posts}', tags=["postpage"], summary="Get posts or comments",
            description="""
         Used to get posts to populate the frontpage or comments to populate the posts page. 
         A user msa id can also be provided to get only posts or comments by that user.
         page_number will shift results for subsequent calls (i.e. as when a user is scrolling)
         Ex: page_number = 3 and num_posts equals 10 => you will get the top 21-30th posts.
         Input a category to limit posts to that category. sort_by top or new posts. 
         minutes_filter is used to filter posts that were created within the last X minutes.
         """)
def announcements_get(
            announcement_type: AnnouncementTypeOptions = Path(default="comments", example="comments", description='Whether to get posts or comments'),
            page_number: int = Path(default=1, example=1, description='how many num_posts to shift output by'), 
            num_posts: int = Path(default=10, example=10, description='How many posts to return'), 
            category: Union[str, None] = Query(default=None, description='Category to filter with'), 
            sort_by: Union[SortOptions, None] = Query(default=None, example="top", description='Sort by (top or new)'), 
            minutes_filter: Union[int, None] = Query(default=None, example=60*24, description='Number of minutes from now to filter by. Post older will be dropped'),
            user_msa_id: Union[int, None] = Query(default=None, example=accounts['Charlie'], description='Include this to get posts for a specific user'),
            post_hash: str = Query(default=None, example=example_post, description='IPFS hash of post to get comments for'),  
        ):
    # if announcement_type == 'comments' and post_hash is None:
    #     return HTTPException(status_code=409, detail="You need to provide a post_hash when asking for comments")
    
    announcement_type_singular = announcement_type[:-1]
    
    date_where = ""
    if minutes_filter is not None:
        date_time = datetime.datetime.now() - datetime.timedelta(minutes=minutes_filter)
        date_str = date_time.strftime(date_format)
        date_where = f"{announcement_type_singular}.date_minted >= '{date_str}'"

    category_where = ""
    if category and announcement_type == 'posts':
        category_where = f"{announcement_type_singular}.category = '{category}'"

    user_where = ""
    if user_msa_id:
        user_where = f"{announcement_type_singular}.msa_id_from_query = {user_msa_id}"

    post_hash_where = ""
    if post_hash:
        if announcement_type_singular == "post":
            post_hash_where = f"{announcement_type_singular}.ipfs_hash = '{post_hash}'"
        else:
            post_hash_where = f"{announcement_type_singular}.post_hash = '{post_hash}'"
        
    where_statement = ""
    for where in [date_where, category_where, user_where, post_hash_where]:
        if where:
            if where_statement == "":
                where_statement += "WHERE "
            else:
                where_statement += " AND "
            where_statement += where

    order_by = ""
    if sort_by is None or sort_by == 'top':
        order_by = "ORDER BY total_votes DESC"
    if sort_by == 'new':
        order_by = "ORDER BY date_minted DESC"

    lower_bound = (page_number - 1) * num_posts
    upper_bound = page_number * num_posts

    query = f'''
    SELECT * FROM {announcement_type_singular} 
    LEFT JOIN (
        SELECT parent_hash, SUM(num_votes) AS total_votes 
        FROM vote GROUP BY parent_hash
    ) votes ON votes.parent_hash = {announcement_type_singular}.ipfs_hash
    LEFT JOIN (
        SELECT msa_id, username, password, profile_pic, wallet_ss58_address, block_number AS user_block_number, provider_key AS user_provider_key, date_minted AS user_date_minted
        FROM user u1
        WHERE date_minted = (SELECT max(date_minted) 
            FROM user u2
             WHERE u1.msa_id = u2.msa_id)
    ) users ON users.msa_id = {announcement_type_singular}.msa_id_from_query
    {where_statement}
    {order_by}
    LIMIT {lower_bound}, {upper_bound}
    '''
    df = pd.read_sql_query(query, con).drop_duplicates()
    response = df.to_dict(orient='records')
    return response

def get_user(username=None, user_msa_id=None):
    where = ""
    if username is not None:
        where = f"u1.username LIKE '%{username}%' AND"
    if user_msa_id is not None:
        where = f"u1.msa_id = '{user_msa_id}' AND"

    query = f'''
    SELECT * FROM user u1
    WHERE {where} date_minted = (
        SELECT max(date_minted) 
        FROM user u2
        WHERE u1.msa_id = u2.msa_id
    )
    ORDER BY u1.date_minted DESC
    '''
    df = pd.read_sql_query(query, con)
    return df

class User(BaseModel):
    name: str
    description: Union[str, None] = None
    price: float
    tax: float = 10.5

@app.get('/user/data', tags=["userpage"], summary="Get user data from msa_id or username")
def user_data_get(
        username: Union[str, None] = Query(default=None, example="Charl", description='username to get data for'), 
        user_msa_id: Union[int, None] = Query(default=None, description="user's msa_id to get data for"), 
        multiple: Union[bool, None] = Query(default=None, example=False, description="whether to return multiple users"),
    ):
    if username is None and user_msa_id is None:
        return HTTPException(status_code=405, detail="Please enter a username or msa_id")

    df = get_user(username, user_msa_id)
    if df.size == 0:
        return HTTPException(status_code=404, detail="User not found")
    
    if df.size > 1:
        df_user = df[df['username'] == username]
        if df_user.size > 0:
            idxs = df_user.index
            df = pd.concat([df.iloc[idxs,:], df.drop(idxs, axis=0)], axis=0)
    
    response = df.to_dict(orient='records')
    if username is not None and user_msa_id is not None:
        if response['username'] != response['msa_id']:
            return HTTPException(status_code=406, detail="Given username and msa_id do not match")
        
    if not multiple:
        response = response[0]
    return response

rewards = {"post": 100, "comment": 10, "vote": 1, "user": 1000, "follow": 5, "link": 400}
def xp_to_level(xp):
    if xp == 0:
        return 0 
    result = math.ceil(math.log(xp/368599, 1.101141)) + 61
    if result > 0:
        return result 
    return 0 

def level_to_xp(level): 
    return 368599 * 1.101141**(level-61)

def get_user_level_df(user_msa_id=None):
    if user_msa_id is None:
        where_msa = ""
    else:
        where_msa = f"WHERE msa_id_from_query = {user_msa_id}"
        
    query = f'''
    SELECT u1.*, posts.count AS post_count, comments.count AS comment_count, votes.count AS vote_count, 
            follows.count AS follow_count
    FROM user u1
    LEFT JOIN (
        SELECT COUNT(*) AS count, msa_id_from_query 
        FROM post
        {where_msa}
        GROUP BY msa_id_from_query
    ) posts ON u1.msa_id_from_query = posts.msa_id_from_query 
    LEFT JOIN (
        SELECT COUNT(*) AS count, msa_id_from_query 
        FROM comment
        {where_msa}
        GROUP BY msa_id_from_query
    ) comments ON u1.msa_id_from_query = comments.msa_id_from_query
    LEFT JOIN (
        SELECT COUNT(*) AS count, msa_id_from_query 
        FROM vote
        {where_msa}
        GROUP BY msa_id_from_query
    ) votes ON u1.msa_id_from_query = votes.msa_id_from_query
    LEFT JOIN (
        SELECT COUNT(*) AS count, msa_id_from_query 
        FROM follow
        {where_msa}
        GROUP BY msa_id_from_query
    ) follows ON u1.msa_id_from_query = follows.msa_id_from_query
    WHERE {"" if where_msa == "" else 'u1.' + where_msa.split('WHERE ')[1] + ' AND'} date_minted = (
        SELECT max(date_minted) 
        FROM user u2
        WHERE u1.msa_id = u2.msa_id
    )
    '''
    df = pd.read_sql_query(query, con).fillna(0)
    return df

def get_user_exp(count_dict, user_msa_id):
    exp = 0
    for k, v in rewards.items():
        if k == 'user' or k == 'link' or k == 'payout':
            continue
        
        exp += count_dict[f'{k}_count'] * v
    return exp

class UserLevel(BaseModel):
    exp: float = level_to_xp(user_starting_level)
    level: int = user_starting_level
    exp_to_next_level: float = level_to_xp(user_starting_level + 1)

@app.get('/user/level', tags=["userpage"], summary="Get user exp and level from msa_id", response_model=UserLevel)
def user_level_get(
        user_msa_id: int = Query(default=accounts['Charlie'], example=accounts['Charlie'], description="user's msa_id to get data for"),
    ):        
    count_dict = get_user_level_df(user_msa_id)
    if count_dict.size == 0:
        return HTTPException(status_code=404, detail="User not found")
        
    count_dict = count_dict.iloc[0].to_dict()
    
    userLevel = UserLevel()
    userLevel.exp = get_user_exp(count_dict, user_msa_id)
    userLevel.level = int(xp_to_level(userLevel.exp))
    userLevel.exp_to_next_level = level_to_xp(userLevel.level + 1)
    
    return userLevel

@app.get('/user/dailypayout', tags=["userpage"], summary="Calculates user's daily rewards")
def user_dailypayout_get(
        user_msa_id: int = Query(default=accounts['Charlie'], example=accounts['Charlie'], description="user's msa_id to get data for"),
    ):     
    user_msa_id = int(user_msa_id)
    now = datetime.datetime.now()
    today = now.replace(hour=0, minute=0, second=0, microsecond=0).strftime(date_format)
    tomorrow_time = (now + datetime.timedelta(days=1)).replace(hour=0, minute=0, second=0, microsecond=0)
    seconds_till_next_payout = (tomorrow_time - now).seconds
    
    last_payout_date = pd.read_sql_query(f"""
        SELECT date_minted FROM payout 
        WHERE msa_id_from_query = {user_msa_id} AND date_minted > '{today}'
        ORDER BY date_minted DESC LIMIT 1
    """, con)['date_minted']
    
    if last_payout_date.shape[0] > 0 and last_payout_date[0] < datetime.datetime.now().strftime('%Y-%m-%d'):
        return {
            "details": "Users already claimed their payout today",
            "payout_amount_left_to_claim": 0, "seconds_till_next_payout": seconds_till_next_payout
        }
    
    df = get_user_level_df(None)
    df['msa_id_from_query'] = df['msa_id_from_query'].astype(int)
    if user_msa_id not in df['msa_id_from_query'].values:
        return {
            "details": "Users has a social score of 0",
            "payout_amount_left_to_claim": 0, "seconds_till_next_payout": seconds_till_next_payout
        }
       
    centralities = get_centralities()
    weighted_avgs = {}
    users_level = {}  
    users_score = {}  
    for index, row in df.iterrows():
        count_dict = row.to_dict()
        msa_id = row['msa_id_from_query']
        users_level[msa_id] = xp_to_level(get_user_exp(count_dict, msa_id)) + user_starting_level
        weighted_avgs[msa_id] = get_user_weighted_social_score(centralities, msa_id)
        users_score[msa_id] = users_level[msa_id] * weighted_avgs[msa_id]
        
    user_score = users_score[user_msa_id] / max(users_score.values())
    
    return {
        "user_level": users_level[user_msa_id], "user_social_score": weighted_avgs[user_msa_id]/6,
        "user_score": user_score, "payout_amount_left_to_claim": daily_token_rewards * user_score, 
        "seconds_till_next_payout": seconds_till_next_payout, 
        "wallet_ss58_address": df[df['msa_id_from_query'] == user_msa_id]['wallet_ss58_address'].iloc[0]
    }

@app.post('/user/dailypayout', tags=["userpage"], summary="Pays a user their daily rewards")
async def user_dailypayout_post(
        user_msa_id: int = Query(default=accounts['Charlie'], example=accounts['Charlie'], description="user's msa_id to get data for"),
        wait_for_inclusion: Union[bool, None]=None, wait_for_finalization: Union[bool, None]=None
    ):        
        
    response = user_dailypayout_get(user_msa_id)
    if response['payout_amount_left_to_claim'] == 0:
        return response
    
    payout_amount = response['payout_amount_left_to_claim']
    receipt = make_call("Balances", "transfer", {"dest": response['wallet_ss58_address'], "value": payout_amount}, bob, 
                        wait_for_inclusion=wait_for_inclusion, wait_for_finalization=wait_for_finalization)
    data = '{' + f'"payout_amount": {payout_amount}' + '}'
    _, receipt = mint_data(data, user_msa_id, schemas['payout'], 
                        wait_for_inclusion=wait_for_inclusion, wait_for_finalization=wait_for_finalization)
    return response
    
def get_follow_df(followers, user_msa_id):
    if followers == "following":
        where_var = "protagonist_msa_id"
        select_var = "antagonist_msa_id"
    else:
        where_var = "antagonist_msa_id"
        select_var = "protagonist_msa_id"
        
    query = f'''
    SELECT followers.{followers}_msa_id, date_followed, user.*
    FROM user
    INNER JOIN (
        SELECT follow.{select_var} AS {followers}_msa_id, follow.date_minted AS date_followed
        FROM follow,
            (SELECT protagonist_msa_id, antagonist_msa_id, MAX(date_minted) AS date_minted
                FROM follow
                WHERE {where_var} == {user_msa_id}
                GROUP BY protagonist_msa_id, antagonist_msa_id) f2
        WHERE follow.protagonist_msa_id=f2.protagonist_msa_id 
        AND follow.antagonist_msa_id=f2.antagonist_msa_id
        AND follow.date_minted=f2.date_minted
        AND follow.event = 'follow'
        AND follow.{where_var} == {user_msa_id}
    ) followers
    ON user.msa_id_from_query = followers.{followers}_msa_id
    '''
    df = pd.read_sql_query(query, con)
    return df
    
class FollowersOptions(str, Enum):
    followers = "followers"
    followering = "following"
    
@app.get('/user/get/{followers}', tags=["userpage"], summary="Get a users followers or following")
def user_followers_get(
        user_msa_id: int = Query(default=accounts['Charlie'], example=accounts['Charlie'], description="user's msa_id to get followers or following of"),
        followers: FollowersOptions = Path(default="followers", example="followers", description='Whether to get followers or following'),
        user_msa_id_to_check: int = Query(default=None, example=accounts['Dave'], description="user's msa_id to check if other user is following or being followed by"),
    ):
    df = get_follow_df(followers, user_msa_id)
    # Drop where user follows themselves
    df = df[df[f'{followers}_msa_id'] != user_msa_id]
    
    if user_msa_id_to_check:
        df = df[df[f'{followers}_msa_id'] == user_msa_id_to_check]
        if df.size == 0:
            return False
        else:
            return True
    
    response = df.to_dict(orient='records')
    return response

class FollowOptions(str, Enum):
    follow = "follow"
    unfollow = "unfollow"
    
@app.post('/user/interact/{follow}', tags=["userpage"], summary="Follow a user")
async def user_follow(
        follow: FollowOptions = Path(default="follow", example="follow", description='Whether to follow or unfollow'), 
        user_msa_id: int = Query(default=accounts['Charlie'], example=accounts['Charlie'], description="user's msa_id that wants to follow or unfollow"),
        user_msa_id_to_interact_with: int = Query(default=accounts['Dave'], example=accounts['Dave'], description="user's msa_id to follow or unfollow"), 
        wait_for_inclusion: Union[bool, None]=None, wait_for_finalization: Union[bool, None]=None
    ):
    following = get_follow_df("following", user_msa_id)
    if follow == "follow":
        if user_msa_id_to_interact_with in following['following_msa_id'].values:
            return {"message": "User is already following"}
        is_follow = True
    else:
        if user_msa_id_to_interact_with not in following['following_msa_id'].values:
            return {"message": "User is not following"}
        is_follow = False
        
    reciept_follow = follow_user(user_msa_id, user_msa_id_to_interact_with, is_follow=is_follow,
                                    wait_for_inclusion=wait_for_inclusion, wait_for_finalization=wait_for_finalization)
    
    
    return {f"Success": f"You have successfully {follow}ed a user"}

@app.post('/user/mint', tags=["userpage"], summary="Mint a new user")
async def user_mint(
        username: str = Query(default="test", example="Charlie", description='username to mint'),
        password: str = Query(default="password", example="password", description="user's password"), 
        profile_pic: HttpUrl = Query(default=None, example="https://www.redditstatic.com/avatars/defaults/v2/avatar_default_7.png", 
                                     description="user's profile picture"),
        wait_for_inclusion: Union[bool, None]=None, wait_for_finalization: Union[bool, None]=None
    ):
    df = get_user(username, None)
    if df.size > 0:
        return HTTPException(status_code=406, detail="Username already exists")
    # override password for testing
    password = "password"
    user_wallet = Keypair.create_from_uri('//' + username + password)
    user_msa_id = create_msa_with_delegator(bob, user_wallet, 
                                            wait_for_inclusion=True, wait_for_finalization=wait_for_finalization)
    mint_user(user_msa_id, username, password, profile_pic, user_wallet, 
                wait_for_inclusion=wait_for_inclusion, wait_for_finalization=wait_for_finalization)
    return {"user_msa_id": user_msa_id}

@app.post('/user/link', tags=["userpage"], summary="Link an already verified account (email, social, etc)")
async def user_post(
            account_type: str = Query(example='gmail', description='Type of linked account (E.g: facebook, gmail, reddit, etc'),
            account_value: str = Query(example='example@gmail.com', description='Value of linked account (E.g: example@gamil.com, redditorusername, etc'),
            user_msa_id: int = Query(default=accounts['Charlie'], example=accounts['Charlie'], description="user's msa_id to link account to"),
            wait_for_inclusion: Union[bool, None]=None, wait_for_finalization: Union[bool, None]=None
        ):
    data = '{' + f'"account_type": "{account_type}","account_value": "{account_value}"' + '}'
    _, receipt = mint_data(data, user_msa_id, schemas['link'], 
                wait_for_inclusion=wait_for_inclusion, wait_for_finalization=wait_for_finalization)
    return {"Success": "Link was created and will finalize on the blockchain soon."}

@app.get('/airdrop/check/{reddit_username}', tags=["airdroppage"], summary="Check a Reddit user to see how much their airdrop will be as well as get an example post a user can make on Reddit to claim the airdrop.")
def airdrop_get(
            reddit_username: str = Path(default="hughjassjess", example="hughjassjess", description='Username of redditor to check karma of.'),
            postthread_username: str = Query(default="hughjassjess", example="hughjassjess", description='Username they have on PostThread'),
        ):
    user = reddit.redditor(reddit_username)
    try:
        airdrop_value = user.total_karma
    except:
        HTTPException(status_code=406, detail="No Redditor by that username exists")
        
    df = get_user(postthread_username, None)
    if df.size == 0:
        return HTTPException(status_code=404, detail="User not found")
    user_wallet = df['wallet_ss58_address'].iloc[0]
    
    title = f"I just received an airdrop of {airdrop_value} thread tokens just by signing up to www.PostThread.com"
    body = f"""My reward was based on the karma I earned on Reddit. Now I can level up my account and earn more tokens by posting.
    Come join me on www.PostThread.com/referral/{postthread_username} and claim your airdrop too! Using my referral will also 
    earn us both 5000 experience! 
    {user_wallet}
    """
    return {"title": title, "body": body, "airdrop_value": airdrop_value, "user_wallet": user_wallet}

@app.post('/airdrop/claim/{reddit_username}', tags=["airdroppage"], summary="Submit URL where Reddit user submitted a post claiming the airdrop. This will verify and transfer tokens.")
async def airdrop_claim(
            reddit_username: str = Path(default="hughjassjess", example="hughjassjess", description='Username of redditor to check karma of.'),
            postthread_username: str = Query(default="hughjassjess", example="hughjassjess", description='Username they have on PostThread'), 
            wait_for_inclusion: Union[bool, None]=None, wait_for_finalization: Union[bool, None]=None
        ):
    response = airdrop_get(reddit_username, postthread_username)
    if type(response) == HTTPException:
        return response
        
    for i, post in enumerate(user.new()):
        if i > 10:
            break
        if type(post) == praw.models.reddit.submission.Submission:
            if response["user_wallet"] in post.selftext:
                receipt = make_call("Balances", "transfer", {"dest": response["user_wallet"], "value": response["airdrop_value"]}, bob, 
                            wait_for_inclusion=wait_for_inclusion, wait_for_finalization=wait_for_finalization)
                return {"message": "Successfully claimed airdrop. Your reward is being transferred to your account."}
                
    details = "We could not match any of your recent posts with the message we provided for you. Please post again and make sure you are using the exact message we provide you."
    return HTTPException(status_code=407, detail=details)

def get_centralities():
    df = pd.read_sql_query("""SELECT * FROM follow""", con)
    
    G = nx.Graph()
    G.add_edges_from(df[['protagonist_msa_id', 'antagonist_msa_id']].values.tolist())
    degree_scores = nx.degree_centrality(G)
    closeness_scores = nx.closeness_centrality(G)
    betweeness_scores = nx.betweenness_centrality(G, k=20)
    
    return [degree_scores, closeness_scores, betweeness_scores]

def get_user_weighted_social_score(centralities, user_msa_id):
    user_centralities = []
    for centrality in centralities:
        if user_msa_id not in centrality.keys():
            user_centralities.append(0)
        else:
            centrality_max = max(centrality.values())
            user_centralities.append(0 if centrality_max == 0 else centrality[user_msa_id] / centrality_max)
    
    user_centralities.sort(reverse=True)
    weighted_avg = 0
    for i, score in enumerate(user_centralities):
        weighted_avg += score * i
        
    return weighted_avg / 6

@app.get('/socialgraph/score/', tags=["socialgraph"], summary="Calculate social graph score of PostThread user.")
def socialgraph_score(
            user_msa_id: int = Query(default=accounts['Charlie'], example=accounts['Charlie'], description="user's msa_id to get social score of"),
        ):
    if user_msa_id not in df['protagonist_msa_id'] and user_msa_id not in df['antagonist_msa_id']:
        return HTTPException(status_code=404, detail="User not following or being followed")
    
    centralities = get_centralities()
    weighted_avg = get_user_weighted_social_score(centralities, user_msa_id)
    
    return {"social_score": weighted_avg}

@app.get('/socialgraph/dict_of_dicts/', tags=["socialgraph"], summary="Get social graph of PostThread user as a dict of dicts")
def socialgraph_graph(
            user_msa_id: int = Query(default=accounts['Charlie'], example=accounts['Charlie'], description="user's msa_id to get social score of"),
        ):
    df = pd.read_sql_query("""SELECT * FROM follow""", con)
    if user_msa_id not in df['protagonist_msa_id'] and user_msa_id not in df['antagonist_msa_id']:
        return HTTPException(status_code=404, detail="User not following or being followed")
    
    G = nx.Graph()
    G.add_edges_from(df[['protagonist_msa_id', 'antagonist_msa_id']].values.tolist())
    return nx.to_dict_of_dicts(nx.bfs_tree(G, user_msa_id, reverse=False))
  
if __name__ == '__main__':
    uvicorn.run(app, port=5000, host='0.0.0.0', reload=True)