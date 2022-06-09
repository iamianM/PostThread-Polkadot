import React, { useState } from 'react'
import { TxButton } from '../../substrate-lib/components'


export default function CreateMsa() {

    const [status, setStatus] = useState(null)

    return (
        <div>
            <TxButton
                label="Create Msa"
                type="SIGNED-TX"
                setStatus={setStatus}
                attrs={{
                    palletRpc: 'msa',
                    callable: 'create',
                    inputParams: [],
                    paramFields: [],
                }}
            />
            <div></div>
            <div style={{ overflowWrap: 'break-word' }}>{status}</div>
        </div>
    )
}
