import React, { useState } from 'react'
import {
    web3Accounts,
    web3Enable,
    web3FromSource,
} from '@polkadot/extension-dapp';
import { stringToHex } from "@polkadot/util";
import PolkadotSVG from './Buttons/PolkadotSVG';
import { useAppContext } from '../context/AppContext';

export default function TxComponent() {

    const [selectedAccount, setSelectedAccount] = useState(null);
    const [accounts, setAccounts] = useState([]);
    const [connected, setConnected] = useState(false)
    const context = useAppContext();
    const id = context.id;

    const connect = async () => {
        if (typeof window !== "undefined") {
            try {
                const allInjected = await web3Enable('PostThread');
                console.log(allInjected);
                const allAccounts = await web3Accounts();
                console.log(allAccounts);
                setAccounts(allAccounts);
                setConnected(true);
            } catch (e) {
                console.log(e);
            }
        }
    }

    async function connectAccount(signature) {

        addToast(`Linking ${selectedAccount} account`, {
            appearance: 'info',
            autoDismiss: true,
        })

        const response = await fetch(`/api/user/link?` + new URLSearchParams({
            account_type: "wallet",
            account_value: selectedAccount,
            user_msa_id: id,
            signed_message: signature,
            wait_for_inclusion: true
        }), {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        })
        const data = await response.json()
        console.log(data)

        addToast(`${selectedAccount} account successfully linked`, {
            appearance: 'success',
            autoDismiss: true,
        })

        return data
    }


    const signMessage = async () => {
        // returns an array of { address, meta: { name, source } }
        // meta.source contains the name of the extension that provides this account
        // const allInjected = await web3Enable('my cool dapp');
        // `account` is of type InjectedAccountWithMeta 
        // We arbitrarily select the first account returned from the above snippet
        // to be able to retrieve the signer interface from this account
        // we can use web3FromSource which will return an InjectedExtension type
        try {
            const injector = await web3FromSource(selectedAccount.meta.source);
            // // this injector object has a signer and a signRaw method
            // // to be able to sign raw bytes
            const signRaw = injector?.signer?.signRaw;
            if (!!signRaw) {
                // after making sure that signRaw is defined
                // we can use it to sign our message
                const { signature } = await signRaw({
                    address: selectedAccount.address,
                    data: stringToHex('Confirm your wallet address'),
                    type: 'bytes'
                });
                console.log("Signature: " + signature)
                await connectAccount(signature);
            }
        } catch (e) {
            console.log(e);
        }
    }

    return (
        <div className='container'>
            {connected ?
                <>
                    <p className='mt-4'>Select an account:</p>
                    <select className="w-full focus:outline-none h-7 rounded-sm px-2 border-sm bg-primary"
                        onChange={(e) => {
                            setSelectedAccount(accounts[e.target.value]);
                        }}>
                        {accounts.map((account, index) => {
                            return <option key={index} value={index}>{account.meta.name}</option>
                        })
                        }
                    </select>
                </>
                :
                <>
                    <p className='mt-4'>Verify your wallet:</p>
                    <button className="w-full bg-primary py-1 px-2 rounded flex" onClick={connect}>
                        <PolkadotSVG className="flex items-center" />
                    </button>
                </>
            }
            {selectedAccount ?
                <>
                    <p className='mt-4'>Sign a message:</p>
                    <button className="w-full bg-primary py-1 px-2 rounded text-inherit font-semibold text-sm gap-3 flex" onClick={signMessage}>
                        Sign
                    </button>
                </> : <></>}
        </div>
    )
}
