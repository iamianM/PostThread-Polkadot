import os, sys; sys.path.append('..')

from flask import Flask, jsonify, request

import re
import praw
import json
import ipfshttpclient
from collections import OrderedDict
import time
from flask_cors import CORS
from queries import make_call, add_comment, get_posts_list, get_top_posts
from substrateinterface import SubstrateInterface, Keypair
from substrate_helpers import set_substrate, set_delegate, make_call, addSchema, get_msa_id, \
            get_signature, create_msa_with_delegator, mint_votes, mint_user, get_schemas_from_pattern, \
            get_content_from_schemas, get_user, make_post

reddit_creds = json.load(open("../.reddit_creds.json", "r"))
reddit = praw.Reddit(
    client_id=reddit_creds["client_id"],
    client_secret=reddit_creds["client_secret"],
    password=reddit_creds["password"],
    user_agent=reddit_creds["user_agent"],
    username=reddit_creds["username"],
)

client = ipfshttpclient.connect()
  
# creating a Flask app
app = Flask(__name__)
app.config['JSON_SORT_KEYS'] = False
CORS(app)

@app.route('/post/<string:post_hash>/<int:page_number>/<int:num_posts>', methods = ['GET'])
@app.route('/post', methods = ['POST'], defaults={'post_hash': None, 'page_number': None, 'num_posts': None})
def post(post_hash, page_number, num_posts):
    if(request.method == 'GET'):
        results = get_top_posts(page_number, num_posts, post_hash=post_hash)

        response = jsonify(results)
        response.headers.add('Access-Control-Allow-Origin', '*')
        return response, 200
    
    if(request.method == 'POST'):
        data = request.get_json(force=True)
        keys = ["category", "username", "profile_pic", "title", "body", "url", "is_nsfw"]
        for k in keys:
            if k not in data:
                return {"Error": ", ".join(keys) + " required to create a post"}, 400

        wait_for_inclusion = data.get('wait_for_inclusion', False)
        wait_for_finalization = data.get('wait_for_finalization', False)
        user_msa_id = data.get('user_msa_id', None)
        if not user_msa_id:
            user_data = get_user(username=data['username'])
            if "Error" in user_data:
                return user_data, 401
            user_msa_id = user_data['user_msa_id']

        receipt = make_post(data, user_msa_id, wait_for_inclusion, wait_for_finalization)
        if wait_for_inclusion and not receipt.error_message:
            return {"Error": receipt.error_message}

        return {"Success": "Post was created and will finalize on the blockchain soon."}, 200

@app.route('/posts/<int:page_number>/<int:num_posts>/<string:category>', methods = ['GET'])
@app.route('/posts/<int:page_number>/<int:num_posts>', methods = ['GET'], defaults={'category': None})
def posts(page_number, num_posts, category):
    results = get_top_posts(page_number, num_posts,category=category)

    response = jsonify(results)
    response.headers.add('Access-Control-Allow-Origin', '*')
    # response.headers.add('Access-Control-Allow-Private-Network', True)
    return response


@app.route('/user/<int:user_msa_id>', methods = ['GET'])
@app.route('/user/<string:username>', methods = ['GET'])
@app.route('/user', methods = ['POST'])
def user(username=None, user_msa_id=None):
    if(request.method == 'GET'):
        results = get_user(username, user_msa_id)
        return results

    if(request.method == 'POST'):
        data = request.get_json(force=True)
        username = data.get('username', '')
        password = data.get('password', '')
        if username == '' or password == '':
            return {"Error": "Please give username and password"}
        # override password for testing
        password = "password"
        profile_pic = request.args.get('profile_pic', "https://www.redditstatic.com/avatars/defaults/v2/avatar_default_7.png")
        user_msa_id, _ = mint_user(username, password, profile_pic)
        return {"user_msa_id": user_msa_id}


@app.route('/airdrop/<int:user_msa_id>', methods = ['GET'])
@app.route('/airdrop/<string:username>', methods = ['GET'])
@app.route('/airdrop', methods = ['POST'])
def airdrop(username=None, user_msa_id=None):
    if(request.method == 'GET'):
        results = get_user(username, user_msa_id)

        return results

    if(request.method == 'POST'):
        data = request.get_json(force=True)
        username = data.get('username', '')
        password = data.get('password', '')
        if username == '' or password == '':
            return {"Error": "Please give username and password"}
        # override password for testing
        password = "password"
        profile_pic = request.args.get('profile_pic', "https://www.redditstatic.com/avatars/defaults/v2/avatar_default_7.png")
        user_msa_id, _ = mint_user(username, password, profile_pic)
        return {"user_msa_id": user_msa_id}
  
# driver function
if __name__ == '__main__':
  
    app.run(debug = True, host='0.0.0.0', threaded=True)