
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


def add_comment(_data, _dict, _is_vote, block_number):
    '''
    Helper function for adding comments or votes to nested comments
    '''
    for hsh in _dict.keys():
        if hsh == _data[2]:
            if is_vote:
                if '-' in _data[3]:
                    # downvote
                    _dict['data']['downvotes'] += _data[3]
                else:
                    # upvote
                    _dict['data']['upvotes'] += _data[3]
            else:
                _dict[data[3]] = {
                    'data': json.loads(client.cat(_data[3]).decode()), 
                    'comments': {}
                }
                
                _dict['data'].update({"upvotes": 0, "downvotes": 0})
                _dict['data']['block_number'] = block_number
            return True
        result = add_comment(_data, _dict['comments'], _is_vote, block_number)
        if result:
            return True
    return False

def get_posts(category=None, post_hash=None, num_blocks=None, starting_block=None):
    # This is current pattern I'm using to store posts where the first two values are the 
    # category (subreddit) and post hash
    if category is None:
        category = '.*'
    if post_hash is None:
        post_hash = '.*'
    post_pattern = re.compile(f"{category},{post_hash},parent_hash,data_hash")

    schema_count = substrate.query(
        module='Schemas',
        storage_function='SchemaCount',
        params=[]
    ).value

    # Loop through all schemas and save ones that match format
    post_schemas = {}
    for i in range(1, schema_count+1):
        schemaTemp = substrate.query(
            module='Schemas',
            storage_function='Schemas',
            params=[i]
        )
        if post_pattern.match(schemaTemp.value):
            post_schemas[schemaTemp.value] = i

    # get all announcements from specified period
    current_block = substrate.get_block()['header']['number']

    if num_blocks is None and starting_block is None:
        end_block = current_block
        starting_block = max(current_block + 1 - 10000, 0)
    if num_blocks is None:
        end_block = min(starting_block + 10000, current_block + 1 - starting_block)
    if starting_block is None:
        end_block = current_block
        starting_block = max(current_block + 1 - num_blocks,0)
        
    start = time.time()
    content_jsons = {}
    for schema, schemaId in post_schemas.items():
        params = [
            schemaId,
            {
                "page_size": 10000,
                "from_block": starting_block,
                "to_block": end_block,
                "from_index": 0,
            }
        ]

        content = substrate.rpc_request(
            method='messages_getBySchema',
            params=params,
        )
        if len(content['result']['content']) > 0:
            content_jsons[schema] = content['result']['content']
    end = time.time()
    print("Querying content: ", end-start)

    start = time.time()
    posts = {}
    for schema, contents in content_jsons.items():
        schema_items = schema.split(',')
        category = schema_items[0]
        post_hash = schema_items[1]
        posts[post_hash] = {'data': {"upvotes": 0, "downvotes": 0}, 'comments': {}}
        
        for content in contents:
            data = bytes.fromhex(content['data'][2:]).decode().split(',')
            # votes had numeric numbers instead of hashes
            is_vote = data[3].strip('-').isnumeric() 
            if is_vote:
                data[3] = int(data[3])
                
            if data[2] == '': 
                # empty means its post data
                posts[post_hash]['data'].update(json.loads(client.cat(data[3]).decode()))
                posts[post_hash]['data']['block_number'] = content['block_number']
            elif data[2] == post_hash: 
                # post_hash means its comment
                result = add_comment(data, posts[post_hash], is_vote, content['block_number'])
            else: 
                # neither means its comment of comment
                result = add_comment(data, posts[post_hash]['comments'], is_vote, content['block_number'])
                # if not result:
                #     print('couldnt find', data[2], json.loads(client.cat(data[3]).decode()))
    end = time.time()
    print("Formatting: ", end-start)

    return OrderedDict(sorted(posts.items(), key=lambda t: t[1]['data']['upvotes'], reverse=True))


    
@app.route('/post/<string:post_hash>/<int:page_number>/<int:num_posts>', methods = ['GET'])
def post(post_hash, page_number, num_posts):
    posts_dict = post(post_hash=post_hash, num_blocks=None, starting_block=None)
    posts_list = []
    i_range = list(range((page_number - 1) * num_posts, page_number * num_posts))
    for i, (k, v) in enumerate(posts_dict.items()):
        if i in i_range:
            v['id'] = k
            posts_list.append(v)

    response = jsonify({'results': posts_list})
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response

@app.route('/posts/<int:page_number>/<int:num_posts>/<string:category>', methods = ['GET'])
@app.route('/posts/<int:page_number>/<int:num_posts>', methods = ['GET'], defaults={'category': None})
def posts(page_number, num_posts, category):
    posts_dict = get_posts(category=category, post_hash=None, num_blocks=None, starting_block=None)
    posts_list = []
    i_range = list(range((page_number - 1) * num_posts, page_number * num_posts))
    for i, (k, v) in enumerate(posts_dict.items()):
        if i in i_range:
            v['id'] = k
            posts_list.append(v)

    response = jsonify({'results': posts_list})
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