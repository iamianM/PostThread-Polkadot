import React, { useState } from 'react'
import { TxButton } from '../../substrate-lib/components'
import { useSubstrateState } from '../../substrate-lib'

export default function RetrieveMsa() {

    const { currentAccount } = useSubstrateState()
    const [status, setStatus] = useState(null)

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
