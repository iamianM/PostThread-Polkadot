import time, re, json
import ipfshttpclient
from collections import OrderedDict
from substrateinterface import SubstrateInterface, Keypair
from substrate_helpers import set_substrate, set_delegate, make_call, addSchema, get_msa_id, \
            get_signature, create_msa_with_delegator, mint_votes, mint_user, get_schemas_from_pattern, \
            get_content_from_schemas, get_user, make_post


substrate = SubstrateInterface(
    url="ws://127.0.0.1:11946",
    ss58_format=42,
    type_registry_preset='kusama'
)
set_substrate(substrate)

client = ipfshttpclient.connect()

DELEGATE = Keypair.create_from_uri('//Bob')
set_delegate(DELEGATE)

def make_call(call_module, call_function, call_params, keypair, wait_for_inclusion=True, wait_for_finalization=False):
    call = substrate.compose_call(
        call_module=call_module,  
        call_function=call_function,
        call_params=call_params
    )

    extrinsic = substrate.create_signed_extrinsic(call=call, keypair=keypair)

    try:
        receipt = substrate.submit_extrinsic(extrinsic, wait_for_inclusion=wait_for_inclusion, wait_for_finalization=wait_for_finalization)
        print("Extrinsic '{}' sent and included in block '{}'".format(receipt.extrinsic_hash, receipt.block_hash))

    except SubstrateRequestException as e:
        print("Failed to send: {}".format(e))
    return receipt

def add_comment(_data, _dict, _is_vote):
    for hsh in _dict.keys():
        # if hash equal parent
        if hsh == _data[3]:
            if _is_vote:
                if '-' in _data[4]:
                    _dict[_data[3]]['data']['downvotes'] += int(_data[4])
                else:
                    _dict[_data[3]]['data']['upvotes'] += int(_data[4])
            else:
                _dict[_data[4]] = {
                    'data': json.loads(client.cat(_data[4]).decode()), 
                    'comments': {}
                }
                _dict['data'].update({"upvotes": 0, "downvotes": 0})
            return True
        if len(_dict[hsh]['comments']) > 0:
            result = add_comment(_data, _dict[hsh]['comments'], _is_vote)
            if result:
                return True
    return False

def get_posts_list(_posts, post_hash, page_number, num_posts):
    _posts = OrderedDict(sorted(_posts.items(), key=lambda t: t[1]['data']['upvotes'], reverse=True))
    posts_list = []
    i_range = range((page_number - 1) * num_posts, page_number*num_posts)
    for i, (k, v) in enumerate(_posts.items()):
        if i not in i_range:
            continue

        if post_hash is not None and len(v['comments']) > 0:
            v['comments'] = get_posts_list(v['comments'], post_hash, page_number, num_posts)
        v['data']['num_comments'] = len(v['comments'])
        v['data']['id'] = k
        posts_list.append(v)
    return posts_list

def get_top_posts(page_number, num_posts, category=None, post_hash=None, num_blocks=None, starting_block=None):
    start_time = time.time()

    if post_hash is None:
        post_hash = '.*'
    if category is None:
        category = '.*'

    post_pattern = re.compile(f"{post_hash},{category},type,parent,data")
    post_schemas = get_schemas_from_pattern(post_pattern)
    content_jsons = get_content_from_schemas(post_schemas, starting_block=starting_block, num_blocks=num_blocks)

    posts = {}
    for schema, contents in content_jsons.items():
        schema_items = schema.split(',')
        post_hash = schema_items[0]
        posts[post_hash] = {'data': {"upvotes": 0, "downvotes": 0}, 'comments': {}}
        
        for content in contents:
            data = bytes.fromhex(content['data'][2:]).decode().split(',')
            category = data[1]
            announcement_type = data[2]
                
            if announcement_type == 'post': 
                posts[post_hash]['data'].update(json.loads(client.cat(data[4]).decode()))
            elif announcement_type == "postcomment": 
                posts[post_hash]['comments'][data[4]] = {
                    'data': json.loads(client.cat(data[4]).decode()), 
                    'comments': {},
                    'block_number': content['block_number']
                }
                posts[post_hash]['comments'][data[4]]['data'].update({"upvotes": 0, "downvotes": 0})
            elif announcement_type == "commentcomment": 
                result = add_comment(data, posts[post_hash]['comments'], False)
            elif announcement_type == "postcommentvote": 
                result = add_comment(data, posts[post_hash]['comments'], True)
            elif announcement_type == "commentcommentvote": 
                result = add_comment(data, posts[post_hash]['comments'], True)
            else:
                # likely a wrong schema
                pass

    posts_list = get_posts_list(posts, post_hash, page_number, num_posts)

    print('Elapsed time: ', time.time()-start_time)
    return {"results": posts_list}