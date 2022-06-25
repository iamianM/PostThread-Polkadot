import datetime
import ipfshttpclient
import time
import json
import pandas as pd

from substrateinterface import SubstrateInterface, Keypair
from substrateinterface.exceptions import SubstrateRequestException
from substrate_helpers import post_schemaId, comment_schemaId, vote_schemaId, user_schemaId, follow_schemaId, link_schemaId

substrate = SubstrateInterface(
    url="ws://127.0.0.1:9944",
    ss58_format=42,
    type_registry_preset='kusama'
)

client = ipfshttpclient.connect()

post_schemas = {}
for i in [post_schemaId, comment_schemaId, vote_schemaId, user_schemaId, follow_schemaId]:
    schemaTemp = substrate.query(
        module='Schemas',
        storage_function='Schemas',
        params=[i]
    )
    post_schemas[schemaTemp.value] = i
    
extrinsics = {}

con, cur = None, None

def set_connection(_con, _cur):
    global con, cur
    con = _con
    cur = _cur

def get_posts():
    return pd.read_sql_query("SELECT * FROM post", con)

def update_db(start_block=0, backfill=True, schemaToUpdate=None, query_start=False):        
    current_block = substrate.get_block()['header']['number']
    schemas = {
        "post": post_schemaId, "comment": comment_schemaId, "vote": vote_schemaId, 
        "user": user_schemaId, "follow": follow_schemaId}
    date_format = "%Y-%m-%d %H:%M:%S"

    for schemaName, schemaId in schemas.items():
        if query_start:
            query = f"""SELECT block_number FROM {schemaName} ORDER BY date_minted DESC LIMIT 1"""
            start_block = int(pd.read_sql_query(query, con)['block_number'].iloc[0]) + 1
            
        if schemaToUpdate is not None and schemaName != schemaToUpdate:
            continue
        
        schemaValue = substrate.query(
            module='Schemas',
            storage_function='Schemas',
            params=[schemaId]
        ).value

        extraValues = "block_number INTEGER,msa_id_from_query INTEGER,provider_key STRING,date_minted DATE"
        is_ipfs_hash = schemaName not in ['vote', 'user', "follow"]
        if is_ipfs_hash:
            extraValues += ",ipfs_hash STRING"

        if backfill:
            # Delete table if exists and then create it
            cur.execute(f"DROP TABLE IF EXISTS {schemaName}")
            
            names = ','.join([v.split(' ')[0] for v in schemaValue.split(',') + extraValues.split(',')])
            create_table = f"CREATE TABLE {schemaName} ({schemaValue}, {extraValues}, UNIQUE({names}))"
            cur.execute(create_table)

        params = [
            schemaId,
            {
                "page_size": 10000,
                "from_block": start_block,
                "to_block": current_block,
                "from_index": 0,
            }
        ]

        request = substrate.rpc_request(
            method='messages_getBySchema',
            params=params,
        )
        
        if len(request['result']['content']) > 0:
            print(schemaName, len(request['result']['content']))

        table_values = []
        total_time = 0
        for content in request['result']['content']:
            date_str = "null"
            if content['block_number'] not in extrinsics:
                extrinsics[content['block_number']] = substrate.get_block(substrate.get_block_hash(content['block_number']))['extrinsics']
            for extrinsic in extrinsics[content['block_number']]:
                if "Timestamp" == extrinsic.value['call']['call_module']:
                    timestamp = extrinsic.value['call']['call_args'][0]['value']
                    date_time = datetime.datetime.fromtimestamp(timestamp/1000)
                    date_str = "'" + date_time.strftime(date_format) + "'"
                    break
            
            if date_str is None:
                print('Failed to get timestamp from block ', )

            row_raw = bytes.fromhex(content['payload'][2:]).decode()
            ipfs_hash = None
            if is_ipfs_hash:
                ipfs_hash = row_raw
                try:
                    row_raw = client.cat(ipfs_hash).decode()
                except:
                    print("Failed to get ipfs hash ", ipfs_hash)
                    continue
            try:
                row = json.loads(row_raw)
            except:
                print("Failed to parse json", row_raw)
                continue

            row_values = []
            for scheme in schemaValue.split(','):
                scheme_list = scheme.split(' ')
                data = row.get(scheme_list[0], None)
                if data is None or data == 'None':
                    print('Failed to get data from row ', row)
                    row_values = []
                    break
                data_type = scheme_list[1]
                if 'string' in data_type.lower():
                    data = data.replace("'", "❜")
                if type(data) == bool:
                    data = int(data)
                    
                row_values.append(data)

            if len(row_values) == 0:
                continue
                
            row_values.extend([content['block_number'], content['msa_id'], f"{content['provider_key']}", date_str])
            if is_ipfs_hash:
                row_values.append(ipfs_hash)
                
            table_values.append(tuple(row_values))
            
        if len(table_values) == 0:
            continue
        value_holders = ','.join(['?' for _ in table_values[0]])
        cur.executemany(f"INSERT OR IGNORE INTO {schemaName} VALUES ({value_holders})", table_values)
        
    con.commit()
    return current_block