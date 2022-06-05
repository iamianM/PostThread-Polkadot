// This file is taken from the tutorial here
// https://polkadot.js.org/docs/api/start/api.tx.subs

// Import
import { ApiPromise, WsProvider } from '@polkadot/api';
// Import the keyring as required
import { Keyring } from '@polkadot/api';
// Some helper functions used here
import { stringToU8a, u8aToHex, hexToString } from '@polkadot/util';
import FileReader from 'filereader';
import fs from 'fs';
import readline from 'readline';
import { useState } from 'react'


// Construct
const wsProvider = new WsProvider('ws://35.81.83.41:11946');
// Create the instance
const api = new ApiPromise({ provider: wsProvider, Address: 'MultiAddress', LookupSource: 'MultiAddress' });

// Wait until we are ready and connected
await api.isReadyOrError;

// Do something
console.log(await api.genesisHash.toHex());
console.log(await api.query.schemas.schemaCount())


async function processLineByLine() {
    const fileStream = fs.createReadStream("reddit_posts.txt");
  
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity
    });
    // Note: we use the crlfDelay option to recognize all instances of CR LF
    // ('\r\n') in input.txt as a single line break.
  
    var lines = [];
    for await (const line of rl) {
      // Each line in input.txt will be successively available here as `line`.
      lines.push(line);
    }
    // console.log(lines.length);
    return lines;
  }

function hex2a(hexx) {
    var hex = hexx.toString();//force conversion
    var str = '';
    for (var i = 0; i < hex.length; i += 2)
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    return str;
}

const lines = await processLineByLine();
const schema = lines[0];

const schemaCount = await api.query.schemas.schemaCount();
let schemaId = -1;
for (let i = 0; i < schemaCount; i++) {
    let schemeTemp = await api.query.schemas.schemas(i);
    schemeTemp = hexToString(schemeTemp.toString());
    if (schema === schemeTemp) {
        console.log(i);
        schemaId = i;
    }
}
  
const keyring = new Keyring({ type: 'sr25519' });
const bob = keyring.addFromUri('//Alice', { name: 'Bob default' });

if (schemaId == -1) {
    schemaId = await api.tx.schemas.registerSchema(schema)
        .signAndSend(bob)
    console.log("scheme");
    console.log(schemaId);
}

// console.log("here");
// console.log(lines.length);


const [unsub, setUnsub] = useState(null)
const signedTx = async () => {
    const unsub = await api.tx.messages.add(schemaId, encodeURIComponent(lines[i]))
        .signAndSend(bob, txResHandler)
        .catch(txErrHandler);
    setUnsub(() => unsub)
  }

for (let i = 0; i < lines.length; i++) {
    console.log("message");
    var messageReturn = await api.tx.messages.add(schemaId, encodeURIComponent(lines[i]))
        .signAndSend(bob, (result) => {
            console.log(`Current status is ${result.status}`);
        
            if (result.status.isInBlock) {
              console.log(`Transaction included at blockHash ${result.status.asInBlock}`);
            } else if (result.status.isFinalized) {
              console.log(`Transaction finalized at blockHash ${result.status.asFinalized}`);
              unsub();
            }
        }).then(console.log("done"));
    console.log(messageReturn);
}





// const [time, message] = await Promise.all([
//     api.query.timestamp.now(),
//     api.query.messages.messages(156, 1)
//   ]);
// time.then(function(result) {
//     console.log(result)
// })
// message.then(function(result) {
//     console.log(result)
// })