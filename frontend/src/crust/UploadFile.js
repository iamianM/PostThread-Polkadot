import React from 'react'
import { create } from 'ipfs-http-client'
import { ethers } from 'ethers';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { typesBundleForPolkadot } from '@crustio/type-definitions';
import { Keyring } from '@polkadot/keyring';


export default function UploadFile() {

    // Create global chain instance
    const crustChainEndpoint = 'wss://rpc.crust.network';
    const api = new ApiPromise({
        provider: new WsProvider(crustChainEndpoint),
        typesBundle: typesBundleForPolkadot,
    });

    async function placeStorageOrder() {
        // 1. Construct place-storage-order tx
        const fileCid = 'Qm123'; // IPFS CID, take `Qm123` as example
        const fileSize = 2 * 1024 * 1024 * 1024; // Let's say 2 gb(in byte)
        const tips = 0;
        const memo = '';
        const tx = api.tx.market.placeStorageOrder(fileCid, fileSize, tips, memo);

        // 2. Load seeds(account)
        const seeds = 'xxx xxx xxx xxx xxx xxx xxx xxx xxx xxx xxx xxx';
        const kr = new Keyring({ type: 'sr25519' });
        const krp = kr.addFromUri(seeds);

        // 3. Send transaction
        await api.isReadyOrError;
        return new Promise((resolve, reject) => {
            tx.signAndSend(krp, ({ events = [], status }) => {
                console.log(`💸  Tx status: ${status.type}, nonce: ${tx.nonce}`);

                if (status.isInBlock) {
                    events.forEach(({ event: { method, section } }) => {
                        if (method === 'ExtrinsicSuccess') {
                            console.log(`✅  Place storage order success!`);
                            resolve(true);
                        }
                    });
                } else {
                    // Pass it
                }
            }).catch(e => {
                reject(e);
            })
        });
    }

    async function addFile(ipfs, fileContent) {
        // 0. Construct web3 authed header
        // Now support: ethereum-series, polkadot-series, solana, elrond, flow, near, ...
        // Let's take ethereum as example
        const pair = ethers.Wallet.createRandom();
        const sig = await pair.signMessage(pair.address);
        const authHeaderRaw = `eth-${pair.address}:${sig}`;
        const authHeader = Buffer.from(authHeaderRaw).toString('base64');
        const ipfsW3GW = 'https://crustipfs.xyz';

        // 1. Create IPFS instant
        const ipfs = create({
            url: `${ipfsW3GW}/api/v0`,
            headers: {
                authorization: `Basic ${authHeader}`
            }
        });

        // 2. Add file to ipfs
        const { cid } = await ipfs.add(fileContent);

        // 3. Get file status from ipfs
        const fileStat = await ipfs.files.stat("/ipfs/" + cid.path);

        return {
            cid: cid.path,
            size: fileStat.cumulativeSize
        };
    }

    return (
        <div>UploadFile</div>
    )
}

