import re
import json
import substrateinterface
from substrateinterface import SubstrateInterface, Keypair
from substrateinterface.exceptions import SubstrateRequestException
import ipfshttpclient
from os import listdir
from os.path import isfile, join

substrate = SubstrateInterface(
    url="ws://127.0.0.1:9944",
    ss58_format=42,
    type_registry_preset='kusama'
)

delegate = Keypair.create_from_uri('//Bob')
client = ipfshttpclient.connect()

schemas = json.load(open("schemas.json"))

def make_call(call_module, call_function, call_params, keypair, wait_for_inclusion=True, wait_for_finalization=False):
    call = substrate.compose_call(
        call_module=call_module,  
        call_function=call_function,
        call_params=call_params
    )

    extrinsic = substrate.create_signed_extrinsic(call=call, keypair=keypair)

    try:
        receipt = substrate.submit_extrinsic(extrinsic, wait_for_inclusion=wait_for_inclusion, wait_for_finalization=wait_for_finalization)
        return receipt

    except SubstrateRequestException as e:
        print("Failed to send: {}".format(e))
        return None

def addSchema(schema, check=True, create=True, wait_for_inclusion=True, wait_for_finalization=False):
    schemaId = None
    if check:
        schema_count = substrate.query(
            module='Schemas',
            storage_function='SchemaCount',
            params=[]
        ).value

        for i in range(1, schema_count+1):
            schemaTemp = substrate.query(
                module='Schemas',
                storage_function='Schemas',
                params=[i]
            )
            if schemaTemp == schema:
                schemaId = i
                return schemaId

    if schemaId is None and create:
        receipt = make_call("Schemas", "register_schema", {"schema": schema}, delegate, 
                            wait_for_inclusion=wait_for_inclusion, wait_for_finalization=wait_for_finalization)
        
    if wait_for_inclusion or wait_for_finalization:
        for event in receipt.triggered_events:
            event = event.decode()
            if event['event']['module_id'] == 'SchemaRegistered':
                schemaId = event['event']['attributes'][1]
                return schemaId
       
        # didn't find schemaId in events so call function to check for schemaId
        while (schemaId is None):
            schemaId = addSchema(schema, check=True, create=False)
            
    return schemaId

def get_msa_id(wallet, create=False):
    msa_id = substrate.query(
        module='Msa',
        storage_function='KeyInfoOf',
        params=[wallet.ss58_address]
    ).value
    
    if not create:
        if msa_id is None:
            return None
        else:
            return msa_id['msa_id']

    if msa_id == None:
        receipt = make_call("Msa", "create", {}, wallet)
        for event in receipt.triggered_events:
            event = event.decode()
            if event['event']['module_id'] == 'MsaCreated':
                msa_id = event['event']['attributes'][1]
                return msa_id
       
        # didn't find msa in events so call function to check for msa
        while (msa_id is None):
            msa_id = get_msa_id(wallet, create=False)
    else:
        msa_id = msa_id['msa_id']
        
    return msa_id

def get_signature(payload, signer):
    # encode payload using SCALE
    # I found scale_info from "substrate.metadata_decoder"
    payload_encoded = substrate.encode_scale(type_string='scale_info::8', value=payload['authorized_msa_id']) + \
                            substrate.encode_scale(type_string='scale_info::2', value=payload['permission'])

    # Payload must be wrapped in theses Bytes objects
    payload_encoded = "<Bytes>".encode() + payload_encoded.data + "</Bytes>".encode()

    # The provider address signs the payload, so in this case alice
    return signer.sign(payload_encoded)

def add_delegate(msa_id, user_wallet):
    payload_raw = { "authorized_msa_id": msa_id, "permission": 0 }
    signature = get_signature(payload_raw, delegate)
    call_params = {
        "provider_key": delegate.ss58_address,
        "proof": {"Sr25519": "0x" + signature.hex()},
        "add_provider_payload": payload_raw
    }

    receipt = make_call("Msa", "add_provider_to_msa", call_params, user_wallet, wait_for_inclusion=False, wait_for_finalization=False)
    return receipt

def create_msa_with_delegator(provider_wallet, delegator_wallet, wait_for_inclusion=True, wait_for_finalization=False):
    msa_id = get_msa_id(delegator_wallet, create=False)
    if msa_id is not None:
        return msa_id
            
    provider_msa_id = get_msa_id(provider_wallet, create=False)

    payload_raw = { "authorized_msa_id": provider_msa_id, "permission": 0 }

    signature = get_signature(payload_raw, delegator_wallet)

    call_params = {
        "delegator_key": delegator_wallet.ss58_address,
        "proof": {"Sr25519": "0x" + signature.hex()},
        "add_provider_payload": payload_raw
    }

    # provider signs this
    receipt = make_call("Msa", "create_sponsored_account_with_delegation", call_params, provider_wallet, 
                                wait_for_inclusion=wait_for_inclusion, wait_for_finalization=wait_for_finalization)
    
    if wait_for_inclusion or wait_for_finalization:
        for event in receipt.triggered_events:
            event = event.decode()
            if event['event']['module_id'] == 'Msa':
                msa_id = event['event']['attributes'][0]
                return msa_id
            
        return msa_id
    else:
        return None

def mint_votes(user_msa_id, num_votes, parent_hash, post_data_hash, parent_type, wait_for_inclusion=False, wait_for_finalization=False):
    message = '{' + f'"post_hash": "{post_data_hash}", "parent_hash": "{parent_hash}","parent_type": "{parent_type}","num_votes": {num_votes}' + '}'
    _, receipt = mint_data(message, user_msa_id, schemas['vote'], path=None, 
                           wait_for_inclusion=wait_for_inclusion, wait_for_finalization=wait_for_finalization)

    return receipt

def get_schemas_from_pattern(pattern):
    schema_count = substrate.query(
        module='Schemas',
        storage_function='SchemaCount',
        params=[]
    ).value

    schemas = {}
    for i in range(1, schema_count+1):
        schemaTemp = substrate.query(
            module='Schemas',
            storage_function='Schemas',
            params=[i]
        )
        if pattern.match(schemaTemp.value):
            schemas[schemaTemp.value] = i
    
    return schemas

def get_content_from_schemas(schemas, starting_block=None, num_blocks=None):
    current_block = substrate.get_block()['header']['number']

    if num_blocks is None and starting_block is None:
        end_block = current_block
        starting_block = max(current_block + 1 - 10000, 0)
    if num_blocks is None:
        end_block = min(starting_block + 10000, current_block + 1)
    if starting_block is None:
        end_block = current_block
        starting_block = max(current_block + 1 - num_blocks,0)

    content_jsons = {}
    for schema, schemaId in schemas.items():
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
    return content_jsons

def mint_user(user_msa_id, username, password, profile_pic, user_wallet, wait_for_inclusion=False, wait_for_finalization=False): 
    user_data = '{' + f'"msa_id": {user_msa_id},"username": "{username}","password": "{password}","profile_pic": "{profile_pic}","wallet_ss58_address": "{user_wallet.ss58_address}"' + '}'
    user_data_hash, receipt_user = mint_data(user_data, user_msa_id, schemas['user'],
                                             wait_for_inclusion=wait_for_inclusion, wait_for_finalization=wait_for_finalization)
    return receipt_user

def get_user(username=None, user_msa_id=None):
    user_pattern = re.compile(f"username,password,profile_pic")
    user_schemas = get_schemas_from_pattern(user_pattern)
    content_jsons = get_content_from_schemas(user_schemas)

    for schema, contents in content_jsons.items():
        keys = schema.split(',')
        for content in contents:
            data = bytes.fromhex(content['data'][2:]).decode().split(',')
            if username == data[0] or user_msa_id == content['msa_id']:
                result = {s: d for s, d in zip(keys, data)}
                result['user_msa_id'] = content['msa_id']
                return result

    return {"Error": "username or user_msa_id does not exist"}

def mint_data(data, user_msa_id, schemaId, path=None, wait_for_inclusion=True, wait_for_finalization=False):
    if path is not None:
        # write to temp file first to get hash from ipfs
        json.dump(data, open(f"temp.json", "w"))
        data_hash = client.add('temp.json', only_hash=True)["Hash"]
        
        # use hash to check if we already added this post to the blockchain
        # if so then skip
        data_files = [f for f in listdir(path) if isfile(join(path, f))]
        file = f"{path}{data_hash}.json"
        if file in data_files:
            return data_hash, None

        json.dump(data, open(file, "w"))
        res_post = client.add(file)
        message = res_post["Hash"]
    else:
        message = data

    call_params = {
        "on_behalf_of": user_msa_id,
        "schema_id": schemaId,
        "payload": f"{message}",
    }
    receipt_post = make_call("Messages", "add", call_params, delegate, 
                        wait_for_inclusion=wait_for_inclusion, wait_for_finalization=wait_for_finalization)

    return message, receipt_post
    

def follow_user(protagonist_msa_id, antagonist_msa_id, is_follow=True, wait_for_inclusion=False, wait_for_finalization=False):
    follow = "follow" if is_follow else "unfollow"
    message = '{' + f'"protagonist_msa_id": {protagonist_msa_id},"antagonist_msa_id": "{antagonist_msa_id}","event": "{follow}"' + '}'
    _, receipt_follow = mint_data(message, protagonist_msa_id, schemas['follow'], path=None, wait_for_inclusion=wait_for_inclusion, wait_for_finalization=wait_for_finalization)
    return receipt_follow