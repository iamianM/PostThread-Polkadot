import { useState } from 'react'

function MintMessage(schemaId, l) {
    const [unsub, setUnsub] = useState(null);
    const [status, setStatus] = useState(null)

    const txResHandler = ({ status }) =>
        status.isFinalized
        ? setStatus(`😉 Finalized. Block hash: ${status.asFinalized.toString()}`)
        : setStatus(`Current transaction status: ${status.type}`)

    const txErrHandler = err =>
        setStatus(`😞 Transaction Failed: ${err.toString()}`)

    const signedTx = async () => {
        const unsub = await api.tx.messages.add(schemaId, encodeURIComponent(l))
            .signAndSend(bob, txResHandler)
            .catch(txErrHandler);
        setUnsub(() => unsub)
        }

    const transaction = async () => {
        if (typeof unsub === 'function') {
        unsub()
        setUnsub(null)
        }

        setStatus('Sending...')

        const asyncFunc = signedTx

        await asyncFunc()

        return txOnClickHandler && typeof txOnClickHandler === 'function'
        ? txOnClickHandler(unsub)
        : null
    }

    return transaction
}

  
export { MintMessage }