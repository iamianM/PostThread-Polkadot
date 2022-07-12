import datetime
import ipfshttpclient
import time
import json
import pandas as pd
import sqlite3

from substrateinterface import SubstrateInterface, Keypair
from substrateinterface.exceptions import SubstrateRequestException

schemas = json.load(open("schemas.json", "r"))

substrate = SubstrateInterface(
    url="ws://127.0.0.1:9944",
    ss58_format=42,
    type_registry_preset='kusama'
)

client = ipfshttpclient.connect()
    
extrinsics = {}

con = sqlite3.connect('postthreadV1_write.db')
cur = con.cursor()

def get_posts():
    return pd.read_sql_query("SELECT * FROM post", con)

def update_db(start_block=0, backfill=True, schemaToUpdate=None, query_start=False):        
    current_block = substrate.get_block()['header']['number']
    date_format = "%Y-%m-%d %H:%M:%S"
    was_updated = False

    for schemaName, schemaId in schemas.items():
        if query_start:
            query = f"""SELECT block_number FROM {schemaName} ORDER BY date_minted DESC LIMIT 1"""
            temp = pd.read_sql_query(query, con)['block_number']
            if temp.size == 0:
                start_block = 0
            else:
                start_block = int(temp.iloc[0]) + 1
            
        if schemaToUpdate is not None and schemaName != schemaToUpdate:
            print(f"Skipping {schemaName}")
            continue
        
        schemaValue = substrate.query(
            module='Schemas',
            storage_function='Schemas',
            params=[schemaId]
        ).value

        extraValues = "block_number INTEGER,msa_id_from_query INTEGER,provider_key STRING,date_minted DATE"
        is_ipfs_hash = schemaName in ["post", "comment"]
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
        contents = request['result']['content']
        while len(request['result']['content']) == 10000:
            params = [
                schemaId,
                {
                    "page_size": 10000,
                    "from_block": contents[-1]['block_number'],
                    "to_block": current_block,
                    "from_index": 0,
                }
            ]
            request = substrate.rpc_request(
                method='messages_getBySchema',
                params=params,
            )
            contents += request['result']['content']
        
        if len(contents) > 0:
            print(schemaName, len(contents))
            was_updated = True
            

        table_values = []
        total_time = 0
        for content in contents:
            date_str = "null"
            if content['block_number'] not in extrinsics:
                extrinsics[content['block_number']] = substrate.get_block(substrate.get_block_hash(content['block_number']))['extrinsics']
            for extrinsic in extrinsics[content['block_number']]:
                if "Timestamp" == extrinsic.value['call']['call_module']:
                    timestamp = extrinsic.value['call']['call_args'][0]['value']
                    date_time = datetime.datetime.fromtimestamp(timestamp/1000)
                    date_str = date_time.strftime(date_format)
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
    return current_block, was_updated