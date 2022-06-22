import os, sys; sys.path.append('..')

import uvicorn
from fastapi.middleware.cors import CORSMiddleware

from enum import Enum
from typing import Union
from flask import jsonify
from fastapi import FastAPI, Query, Path
from pydantic import BaseModel, HttpUrl

import re, praw, json, ipfshttpclient, time, datetime
import pandas as pd
import sqlite3
from substrate_helpers import set_substrate, set_delegate, make_call, addSchema, get_msa_id, \
            get_signature, create_msa_with_delegator, mint_votes, mint_user, get_schemas_from_pattern, \
            get_content_from_schemas, get_user, make_post
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
        return 400

    response = df.to_dict(orient='records')[0]
    return response

class PostInput(BaseModel):
    category: str
    username: str = "test1"
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
            return 401
        user_msa_id = df['msa_id'].iloc[0]

    receipt = make_post(postInput.__dict__, user_msa_id, wait_for_inclusion, wait_for_finalization)
    if wait_for_inclusion and not receipt.error_message:
        return {"Error": receipt.error_message}, 402

    return {"Success": "Post was created and will finalize on the blockchain soon."}

class SortOptions(str, Enum):
    top = "top"
    new = "new"

@app.get('/posts/{page_number}/{num_posts}', tags=["frontpage"], summary="Get list of posts to display on frontpage")
def posts_get(
            page_number: int = Path(default=1, description='how many num_posts to shift output by'), 
            num_posts: int = Path(default=10, description='How many posts to return'), 
            category: Union[str, None] = Query(default=None, description='Category to filter with'), 
            sort_by: Union[SortOptions, None] = Query(default=None, description='Sort by (top or new)'), 
            minutes_filter: Union[int, None] = Query(default=None, description='Number of minutes from now to filter by. Post older will be dropped'), 
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
    # response = jsonify(df.to_dict(orient='records'))
    # response.headers.add('Access-Control-Allow-Origin', '*')
    
    return response

@app.get('/comments/{post_hash}/{page_number}/{num_comments}', tags=["postpage"], summary="Get list of comments to display on post page.")
def comments(
            post_hash: str, 
            page_number: int = Path(default=1, description='how many num_comments to shift output by'),
            num_comments: int = Path(default=10, description='How many comments to return'),  
            sort_by: Union[str, None] = Query(default=None, description='Sort by (top or new)'), 
            minutes_filter: Union[int, None] = Query(default=None, description='Number of minutes from now to filter by. Post older will be dropped'), 
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
    if where is None:
        return pd.DatFrame([])

    query = f'''
    SELECT * FROM user 
    {where}
    ORDER BY user.date_minted DESC
    '''
    df = pd.read_sql_query(query, con)
    return df

@app.get('/user/data', tags=["userpage"], summary="Get user data (including exp and level) from msa_id or username")
def user_get(username: Union[str, None] = None, user_msa_id: Union[str, None] = None):
    if username is None and user_msa_id is None:
        return 400

    df = get_user(username, user_msa_id)

    if df.size == 0:
        return 401
    
    response = df.to_dict(orient='records')[0]
    return response

@app.post('/user/mint', tags=["userpage"], summary="Mint a new user")
def user_post(username: str, password: str, profile_pic: HttpUrl):
    df = get_user(username, None)
    if df.size > 0:
        return 400
    # override password for testing
    password = "password"
    user_wallet = Keypair.create_from_uri('//' + username + password)
    user_msa_id, _ = mint_user(username, password, profile_pic, user_wallet)
    return {"user_msa_id": user_msa_id}

@app.post('/user/link', tags=["userpage"], summary="Link an already verified account (email, social, etc)")
def user_post(
            account_type: str = Query(description='Type of linked account (E.g: facebook, gmail, reddit, etc'),
            account_value: str = Query(description='Value of linked account (E.g: example@gamil.com, redditorusername, etc'),
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