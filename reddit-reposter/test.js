
import { stringToU8a, u8aToHex } from '@polkadot/util';
import { Keyring } from '@polkadot/api';
import { ApiPromise, WsProvider } from '@polkadot/api';

// Construct
const wsProvider = new WsProvider('ws://35.80.10.26:11946');
// Create the instance
const api = new ApiPromise({ provider: wsProvider, Address: 'MultiAddress', LookupSource: 'MultiAddress' });

// Wait until we are ready and connected
await api.isReadyOrError;

const keyring = new Keyring({ type: 'sr25519' });
const bob = keyring.addFromUri('//Alice', { name: 'Alice default' });
// Convert message, sign and then verify
const message = stringToU8a('this is our message');
const signature = bob.sign(message);
const isValid = bob.verify(message, signature, bob.publicKey);

// Log info
console.log(`The signature ${u8aToHex(signature)}, is ${isValid ? '' : 'in'}valid`);
console.log(signature)