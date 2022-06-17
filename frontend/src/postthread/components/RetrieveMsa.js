import React, { useEffect, useState } from 'react'
import { TxButton } from '../../substrate-lib/components'
import { useSubstrateState } from '../../substrate-lib'

export default function RetrieveMsa() {

    const { api, currentAccount } = useSubstrateState()
    const [status, setStatus] = useState(null)

    async function getMsa() {
        const data = await api.query.msa.keyInfoOf(currentAccount["address"])
        console.log(`Current account msa id is ${data}`);
    }

    useEffect(() => {
        getMsa()
    }, [currentAccount])

    return (
        <div>
            <TxButton
                label="Retrieve Msa Id"
                type="QUERY"
                setStatus={setStatus}
                attrs={{
                    palletRpc: 'msa',
                    callable: 'keyInfoOf',
                    inputParams: [currentAccount["address"]],
                    paramFields: [true],
                }}
            />
            <div></div>
            <div style={{ overflowWrap: 'break-word' }}>{status}</div>
        </div>
    )
}