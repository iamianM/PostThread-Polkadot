
# Using flask to make an api
# import necessary libraries and functions
from flask import Flask, jsonify, request
import re
from substrateinterface import SubstrateInterface, Keypair
import json
import ipfshttpclient
from collections import OrderedDict
import time
from flask_cors import CORS

substrate = SubstrateInterface(
    url="ws://127.0.0.1:11946",
    ss58_format=42,
    type_registry_preset='kusama'
)
client = ipfshttpclient.connect()
  
# creating a Flask app
app = Flask(__name__)
app.config['JSON_SORT_KEYS'] = False
CORS(app)

# specify schemas to be used
post_schemaId, postcomment_schemaId, commentcomment_schemaId, postvote_schemaId, commentvote_schemaId = 147, 150, 151, 154, 153


def get_top_posts(page_number, num_posts, category=None, post_hash=None, num_blocks=None, starting_block=5496):
    # get all announcements from specified period
    current_block = substrate.get_block()['header']['number']

    if num_blocks is None and starting_block is None:
        end_block = current_block
        starting_block = max(current_block + 1 - 10000, 0)
    if num_blocks is None:
        end_block = min(starting_block + 10000, current_block + 1)
    if starting_block is None:
        end_block = current_block
        starting_block = max(current_block + 1 - num_blocks,0)
        
    start = time.time()
    content_jsons = {}
    content_json = {}
    print(starting_block, end_block)
    for schemaId in [post_schemaId, postvote_schemaId]:
        params = [
            schemaId,
            {
                "page_size": 10000,
                "from_block": starting_block,
                "to_block": end_block,
                "from_index": 0,
            }
        ]

        content_json[schemaId] = substrate.rpc_request(
            method='messages_getBySchema',
            params=params,
        )['result']['content']
    end = time.time()
    print("Querying content: ", end-start)

    start = time.time()
    posts = {}
    for content in content_json[postvote_schemaId]:
        data = bytes.fromhex(content['data'][2:]).decode().split(',')
        if category is not None and data[1] != category:
            continue
        if data[2] not in posts:
            posts[data[2]] = {'upvotes': 0, 'downvotes': 0, 'score': 0}
        if data[2] in posts:
            num_votes = int(data[3])
            posts[data[2]]['score'] += num_votes 
            if num_votes > 0:
                posts[data[2]]['upvotes'] += num_votes
            else:
                posts[data[2]]['downvotes'] += -1*num_votes  
                
    posts = OrderedDict(sorted(posts.items(), key=lambda t: t[1]['score'], reverse=True))
    i_range = list(range((page_number - 1) * num_posts, page_number * num_posts))
    posts = {k: v for i, (k,v) in enumerate(posts.items()) if i in i_range}

    i = 0
    for content in reversed(content_json[post_schemaId]):
        if i == len(posts):
            break
            
        data = bytes.fromhex(content['data'][2:]).decode().split(',')
        if data[2] not in posts:
            continue
            
        i += 1
        posts[data[2]].update(json.loads(client.cat(data[2]).decode()))
        posts[data[2]]['block_number'] = content['block_number']
        
    posts_list = []
    for i, (k,v) in enumerate(posts.items()):
        v['id'] = k
        posts_list.append(v)
    end = time.time()
    print("Formatting: ", end-start)

    print(len(posts_list))
    return {"results": posts_list}


    
@app.route('/post/<string:post_hash>/<int:page_number>/<int:num_posts>', methods = ['GET'])
def post(post_hash, page_number, num_posts):
    results = get_top_posts(post_hash=post_hash)

    response = jsonify(results)
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response

@app.route('/posts/<int:page_number>/<int:num_posts>/<string:category>', methods = ['GET'])
@app.route('/posts/<int:page_number>/<int:num_posts>', methods = ['GET'], defaults={'category': None})
def posts(page_number, num_posts, category):
    results = get_top_posts(page_number, num_posts,category=category)

    response = jsonify(results)
    response.headers.add('Access-Control-Allow-Origin', '*')
    # response.headers.add('Access-Control-Allow-Private-Network', True)
    return response
  
# on the terminal type: curl http://127.0.0.1:5000/
# returns hello world when we use GET.
# returns the data that we send when we use POST.
@app.route('/', methods = ['GET', 'POST'])
def home():
    if(request.method == 'GET'):
  
        data = "hello world"
        return jsonify({'data': data})
  
  
# A simple function to calculate the square of a number
# the number to be squared is sent in the URL when we use GET
# on the terminal type: curl http://127.0.0.1:5000 / home / 10
# this returns 100 (square of 10)
@app.route('/home/<int:num>', methods = ['GET'])
def disp(num):
  
    return jsonify({'data': num**2})
  
  
# driver function
if __name__ == '__main__':
  
    app.run(debug = True, host='0.0.0.0')