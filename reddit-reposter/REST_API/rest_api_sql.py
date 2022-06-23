import os, sys; sys.path.append('..')

import uvicorn
from fastapi.middleware.cors import CORSMiddleware

from enum import Enum
from typing import Union
from flask import jsonify
from fastapi import FastAPI, Query, Path, HTTPException
from pydantic import BaseModel, HttpUrl

import math
import re, praw, json, ipfshttpclient, time, datetime
import pandas as pd
import sqlite3
from substrate_helpers import set_substrate, set_delegate, make_call, addSchema, get_msa_id, \
            get_signature, create_msa_with_delegator, mint_votes, mint_user, get_schemas_from_pattern, \
            get_content_from_schemas, mint_data, follow_user, \
            post_schemaId, comment_schemaId, vote_schemaId, user_schemaId, follow_schemaId
from substrateinterface import SubstrateInterface, Keypair

con = sqlite3.connect('../test1.db', check_same_thread=False)
cur = con.cursor()

substrate = SubstrateInterface(
    url="ws://127.0.0.1:11946",
    ss58_format=42,
    type_registry_preset='kusama'
)
bob = Keypair.create_from_uri('//Bob')
set_delegate(bob)
set_substrate(substrate)

reddit_creds = json.load(open("../.reddit_creds.json", "r"))
reddit = praw.Reddit(
    client_id=reddit_creds["client_id"],
    client_secret=reddit_creds["client_secret"],
    password=reddit_creds["password"],
    user_agent=reddit_creds["user_agent"],
    username=reddit_creds["username"],
)

client = ipfshttpclient.connect()

accounts = {'Alice': 1335, 'Charlie': 1337, 'Dave': 1339, 'Eve': 1341, 'Ferdie': 1343}
path = "/home/chia/polkadot_projects/PostThread-Polkadot/reddit-reposter/"

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
def post_get(post_hash: str):
    query = f'''
    SELECT * FROM post 
    JOIN (
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
    username: str = "Charlie"
    profile_pic: str
    title: str
    body: str
    url: HttpUrl = "http://www.google.com"
    is_nsfw: bool 
    
@app.post('/submit', tags=["submitpage"], summary="Submit data to mint a post.")
def submit_post(postInput: PostInput, user_msa_id: Union[int, None]=None, 
            wait_for_inclusion: Union[bool, None]=None, wait_for_finalization: Union[bool, None]=None):
    if wait_for_inclusion is None:
        wait_for_inclusion = False
    if wait_for_finalization is None:
        wait_for_finalization = False

    if user_msa_id is None:
        df = get_user(username=postInput.username)
        if df.size == 0:
            return HTTPException(status_code=404, detail="User not found")
        user_msa_id = df['msa_id'].iloc[0]

    receipt = mint_data(postInput.__dict__, user_msa_id, post_schemaId, path+'posts/', wait_for_inclusion, wait_for_finalization)
    if wait_for_inclusion and not receipt.error_message:
        return {"Error": receipt.error_message}, 402

    return {"Success": "Post was created and will finalize on the blockchain soon."}

class SortOptions(str, Enum):
    top = "top"
    new = "new"

@app.get('/posts/{page_number}/{num_posts}', tags=["frontpage"], summary="Get list of posts to display on frontpage",
         description="""
         Used to get posts to populate the frontpage. page_number will shift results for subsequent calls (i.e. as when a user is scrolling)
         Ex: page_number = 3 and num_posts equals 10 => you will get the top 21-30th posts.
         Input a category to limit posts to that category. sort_by top or new posts. 
         minutes_filter is used to filter posts that were created within the last X minutes.
         """)
def posts_get(
            page_number: int = Path(default=1, example=1, description='how many num_posts to shift output by'), 
            num_posts: int = Path(default=10, example=10, description='How many posts to return'), 
            category: Union[str, None] = Query(default=None, description='Category to filter with'), 
            sort_by: Union[SortOptions, None] = Query(default=None, example="top", description='Sort by (top or new)'), 
            minutes_filter: Union[int, None] = Query(default=None, example=60*24, description='Number of minutes from now to filter by. Post older will be dropped'), 
        ):
    if minutes_filter is None:
        minutes_filter = 60*24

    category_where = ""
    if category:
        category_where = f"AND post.category = '{category}'"

    order_by = ""
    if sort_by is None or sort_by == 'top':
        order_by = "ORDER BY total_votes DESC"
    if sort_by == 'new':
        order_by = "ORDER BY date_minted DESC"

    lower_bound = (page_number - 1) * num_posts
    upper_bound = page_number * num_posts

    date_format = "%m-%d-%Y %H:%M:%S"
    date_time = datetime.datetime.now() - datetime.timedelta(minutes=minutes_filter)
    date_str = date_time.strftime(date_format)

    query = f'''
    SELECT * FROM post 
    JOIN (
        SELECT parent_hash, SUM(num_votes) AS total_votes 
        FROM vote GROUP BY parent_hash
    ) votes ON votes.parent_hash = post.ipfs_hash
    WHERE post.date_minted >= '{date_str}' {category_where}
    {order_by}
    LIMIT {lower_bound}, {upper_bound}
    '''
    df = pd.read_sql_query(query, con)
    response = df.to_dict(orient='records')
    
    return response

@app.get('/comments/{post_hash}/{page_number}/{num_comments}', tags=["postpage"], summary="Get list of comments to display on post page.")
def comments(
            post_hash: str, 
            page_number: int = Path(default=1, example=1, description='how many num_comments to shift output by'),
            num_comments: int = Path(default=10, example=10, description='How many comments to return'),  
            sort_by: Union[str, None] = Query(default=None, example="top", description='Sort by (top or new)'), 
            minutes_filter: Union[int, None] = Query(default=None, example=24*60, description='Number of minutes from now to filter by. Post older will be dropped'), 
        ):
    if minutes_filter is None:
        minutes_filter = 60*24

    order_by = ""
    if sort_by == 'top':
        order_by = "ORDER BY total_votes DESC"

    lower_bound = (page_number - 1) * num_comments
    upper_bound = page_number * num_comments

    date_format = "%m-%d-%Y %H:%M:%S"
    date_time = datetime.datetime.now() - datetime.timedelta(minutes=minutes_filter)
    date_str = "'" + date_time.strftime(date_format) + "'"

    query = f'''
    SELECT * FROM comment 
    JOIN (
        SELECT parent_hash, SUM(num_votes) AS total_votes 
        FROM vote GROUP BY parent_hash
    ) votes ON votes.parent_hash = comment.ipfs_hash
    WHERE comment.post_hash = '{post_hash}'
    {order_by}
    LIMIT {lower_bound}, {upper_bound}
    '''
    df = pd.read_sql_query(query, con)

    response = df.to_dict(orient='records')
    return response

def get_user(username=None, user_msa_id=None):
    where = None
    if username is not None:
        where = f"WHERE user.username = '{username}'"
    if user_msa_id is not None:
        where = f"WHERE user.msa_id = '{user_msa_id}'"

    query = f'''
    SELECT * FROM user 
    {where}
    ORDER BY user.date_minted DESC
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
        username: Union[str, None] = Query(default=None, example="Charlie", description='username to get data for'), 
        user_msa_id: Union[str, None] = Query(default=None, description="user's msa_id to get data for"),
    ):
    if username is None and user_msa_id is None:
        return HTTPException(status_code=405, detail="Please enter a username or msa_id")

    df = get_user(username, user_msa_id)

    if df.size == 0:
        return HTTPException(status_code=404, detail="User not found")
    
    response = df.to_dict(orient='records')[0]
    if username is not None and user_msa_id is not None:
        if response['username'] != response['msa_id']:
            return HTTPException(status_code=406, detail="Given username and msa_id do not match")
        
    return response

rewards = {"post": 100, "comment": 10, "vote": 1, "user": 1000, "follow": 5, "link": 400}
def xp_to_level(xp):
    return math.ceil(math.log(xp/368599, 1.101141)) + 61

def level_to_xp(level): 
    return 368599 * 1.101141**(level-61)

class UserLevel(BaseModel):
    exp: int = 0
    level: int = 0
    exp_to_next_level: int = level_to_xp(1)

@app.get('/user/level', tags=["userpage"], summary="Get user exp and level from msa_id", response_model=UserLevel)
def user_level_get(
        user_msa_id: str = Query(default=accounts['Charlie'], example=accounts['Charlie'], description="user's msa_id to get data for"),
    ):    
    query = f'''
    SELECT user.*, posts.count AS post_count, comments.count AS comment_count, votes.count AS vote_count, 
            follows.count AS follow_count
    FROM user
    LEFT JOIN (
        SELECT COUNT(*) AS count, msa_id_from_query 
        FROM post
        WHERE msa_id_from_query = {user_msa_id}
    ) posts ON user.msa_id_from_query = posts.msa_id_from_query 
    LEFT JOIN (
        SELECT COUNT(*) AS count, msa_id_from_query 
        FROM comment
        WHERE msa_id_from_query = {user_msa_id}
    ) comments ON user.msa_id_from_query = comments.msa_id_from_query
    LEFT JOIN (
        SELECT COUNT(*) AS count, msa_id_from_query 
        FROM vote
        WHERE msa_id_from_query = {user_msa_id}
    ) votes ON user.msa_id_from_query = votes.msa_id_from_query
    LEFT JOIN (
        SELECT COUNT(*) AS count, msa_id_from_query 
        FROM follow
        WHERE msa_id_from_query = {user_msa_id}
    ) follows ON user.msa_id_from_query = follows.msa_id_from_query
    WHERE user.msa_id_from_query = {user_msa_id} 
    '''
    df = pd.read_sql_query(query, con).fillna(0)
    
    userLevel = UserLevel()
    userLevel.exp = 0
    for k, v in rewards.items():
        if k == 'user':
            userLevel.exp += df.shape[0] * v
            continue
        if k == 'link':
            continue
        userLevel.exp += df[f'{k}_count'] * v
    
    userLevel.level = xp_to_level(userLevel.exp)
    userLevel.exp_to_next_level = level_to_xp(userLevel.level + 1)
    
    return userLevel
    
class FollowersOptions(str, Enum):
    followers = "followers"
    followering = "following"
    
@app.get('/user/{followers}', tags=["userpage"], summary="Get a users followers or following")
def user_followers_get(
        followers: FollowersOptions = Path(default="followers", example="followers", description='Whether to get followers or following'),
        user_msa_id: str = Query(default=accounts['Charlie'], example=accounts['Charlie'], description="user's msa_id to get followers or following of"),
    ):
    if followers == "followers":
        where_var = "protagonist_msa_id"
        select_var = "antagonist_msa_id"
    else:
        where_var = "antagonist_msa_id"
        select_var = "protagonist_msa_id"
        
    query = f'''
    SELECT followers.{followers}_msa_id, date_followed, username, password, profile_pic, wallet_ss58_address, date_minted
    FROM user
    INNER JOIN (
        SELECT follow.{where_var}, follow.{select_var} AS {followers}_msa_id, follow.date_minted AS date_followed
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
    response = df.to_dict(orient='records')
    return response


class FollowOptions(str, Enum):
    follow = "follow"
    unfollow = "unfollow"
    
@app.post('/user/interact/{follow}', tags=["userpage"], summary="Follow a user")
def user_follow(
        follow: FollowOptions = Path(default="follow", example="follow", description='Whether to follow or unfollow'), 
        user_msa_id: str = Query(default=accounts['Charlie'], example=accounts['Charlie'], description="user's msa_id that wants to follow or unfollow"),
        user_msa_id_to_interact_with: str = Query(default=accounts['Dave'], example=accounts['Dave'], description="user's msa_id to follow or unfollow"),
    ):
    if follow == "follow":
        reciept_follow = follow_user(user_msa_id, user_msa_id_to_interact_with)
    else:
        reciept_follow = follow_user(user_msa_id, user_msa_id_to_interact_with, is_follow=False)
    
    
    return {f"Success": f"You have successfully {follow}ed a user"}

@app.post('/user/mint', tags=["userpage"], summary="Mint a new user")
def user_mint(
        username: str = Query(default="test", example="Charlie", description='username to mint'),
        password: str = Query(default="password", example="password", description="user's password"), 
        profile_pic: HttpUrl = Query(default=None, example="https://www.redditstatic.com/avatars/defaults/v2/avatar_default_7.png", 
                                     description="user's profile picture"),
    ):
    df = get_user(username, None)
    if df.size > 0:
        return HTTPException(status_code=406, detail="Username already exists")
    # override password for testing
    password = "password"
    user_wallet = Keypair.create_from_uri('//' + username + password)
    user_msa_id, _ = mint_user(username, password, profile_pic, user_wallet)
    return {"user_msa_id": user_msa_id}

@app.post('/user/link', tags=["userpage"], summary="Link an already verified account (email, social, etc)")
def user_post(
            account_type: str = Query(example='gmail', description='Type of linked account (E.g: facebook, gmail, reddit, etc'),
            account_value: str = Query(example='example@gmail.com', description='Value of linked account (E.g: example@gamil.com, redditorusername, etc'),
        ):
    return 200

@app.get('/airdrop/check/{username}', tags=["airdroppage"], summary="Check a Reddit user to see how much their airdrop will be as well as get an example post a user can make on Reddit to claim the airdrop.")
def airdrop_get(page_number: str = Path(description='Username of redditor to check karma of.')):
    return 200

@app.post('/airdrop/submit', tags=["airdroppage"], summary="Submit URL where Reddit user submitted a post claiming the airdrop. This will verify and transfer tokens.")
def airdrop(reddit_url_of_post: str):
    return 200
  
if __name__ == '__main__':
    uvicorn.run(app, port=5000, host='0.0.0.0', reload=True)