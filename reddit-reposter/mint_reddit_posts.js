// This file is taken from the tutorial here
// https://polkadot.js.org/docs/api/start/api.tx.subs

// While we are using the await naked in all examples (this removes boilerplate and allows us to focus on the actual libraries), 
// and unless your environment supports top-level await, it will need to be wrapped in an async block. So basically to make in
// run-able we should wrap all samples inside a async function main () { ... } and then just call 
// main().then(() => console.log('completed')).


// Import
import { ApiPromise, WsProvider } from '@polkadot/api';
// Import the keyring as required
import { Keyring } from '@polkadot/api';
// Some helper functions used here
import { stringToU8a, u8aToHex, hexToString } from '@polkadot/util';
import fs from 'fs';
import readline from 'readline';

async function main() {
  // Construct
  const wsProvider = new WsProvider('ws://44.234.87.204:11946');
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
  const bob = keyring.addFromUri('//Alice', { name: 'Alice default' });
  // Convert message, sign and then verify
  const message = stringToU8a('this is our message');
  const signature = bob.sign(message);
  const isValid = bob.verify(message, signature, alice.publicKey);

  // Log info
  console.log(`The signature ${u8aToHex(signature)}, is ${isValid ? '' : 'in'}valid`);

  if (schemaId == -1) {
    schemaId = await api.tx.schemas.registerSchema(schema)
      .signAndSend(bob)
    console.log("scheme");
    console.log(schemaId);
  }

  // console.log("here");
  // console.log(lines.length);

  var finalized = false
  const setStatus = ({ status }) =>
    finalized = status

  const txResHandler = ({ status }) =>
    status.isFinalized
      ? setStatus(true)
      : setStatus(false)

  const txErrHandler = err =>
    setStatus(true)

  // for (let i = 0; i < lines.length; i++) {
  //     console.log("message");
  //     const messageReturn = await api.tx.messages.add(schemaId, encodeURIComponent(lines[i])).then(
  //         signAndSend(bob, txResHandler))
  //         .catch(txErrHandler);
  //     // while (!finalized) {};
  //     console.log(messageReturn);
  // }

  const FILTERED_EVENTS = [
    'system:ExtrinsicSuccess::(phase={"applyExtrinsic":0})',
  ]

  for (let i = 0; i < lines.length; i++) {
    console.log("message");
    const unsub = await api.tx.messages
      .add(schemaId, encodeURIComponent(lines[i])).signAndSend(bob)
    // .signAndSend(bob, ({ events = [], status, txHash }) => {
    //   console.log(`Current status is ${status.type}`);

    //   if (status.isFinalized) {
    //     console.log(`Transaction included at blockHash ${status.asFinalized}`);
    //     console.log(`Transaction hash ${txHash.toHex()}`);

    //     // Loop through Vec<EventRecord> to display all events
    //     events.forEach(({ phase, event: { data, method, section } }) => {
    //       console.log(`\t' ${phase}: ${section}.${method}:: ${data}`);
    //     });

    //     unsub();
    //   }
    // });
    let unsub2 = null
    const allEvents = async () => {
      unsub2 = await api.query.system.events(events => {
        // loop through the Vec<EventRecord>
        events.forEach(record => {
          // extract the phase, event and the event types
          const { event, phase } = record

          // show what we are busy with
          const evHuman = event.toHuman()
          const evName = eventName(evHuman)
          const evParams = eventParams(evHuman)
          const evNamePhase = `${evName}::(phase=${phase.toString()})`

          if (FILTERED_EVENTS.includes(evNamePhase)) { return true }
        })
        return false
      })
    }

    let t = await allEvents();
    while (!t) { t = await allEvents(); }
    console.log(t)
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
}

main().then(() => console.log('completed'))



