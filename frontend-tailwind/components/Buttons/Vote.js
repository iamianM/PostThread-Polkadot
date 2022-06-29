import React from 'react'
import Image from 'next/image'
import { useAppContext } from '../../context/AppContext'

export default function Vote({ type, post }) {

    const context = useAppContext()
    const id = context.id;

    async function submitVote(value) {
        console.log("click")
        const response = await fetch('/api/submit/vote?' +
            new URLSearchParams({
                post_hash: post.ipfs_hash,
                parent_hash: post.ipfs_hash,
                parent_type: "post",
                num_votes: value,
                user_msa_id: id,
                wait_for_inclusion: true
            }), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        })

        const data = await response.json()
        console.log(data)
    }


    return (
        <>
            {type === "up" ?
                <button onClick={() => submitVote(1)}>
                    <svg className="fill-none hover:fill-green-500 stroke-black stroke-1 hover:stroke-2"
                        width="24px" height="24px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M7.08409 10.6629L10.3393 3.23907C10.79 2.21121 11.9999 1.68012 12.9811 2.2056C14.5081 3.0234 14.2018 3.78995 14.2018 8.60158H19.9659C21.2123 8.60158 22.1654 9.72766 21.9759 10.9763L20.568 20.2521C20.4154 21.2577 19.5618 22 18.558 22H7.08409M7.08409 10.6629V22M7.08409 10.6629H4.03364C2.91049 10.6629 2 11.5857 2 12.7242V19.9387C2 21.0771 2.91049 22 4.03364 22L7.08409 22" />
                    </svg>
                </button>
                :
                <button onClick={() => submitVote(-1)}>
                    <svg className="fill-none hover:fill-red-500 stroke-black stroke-1 hover:stroke-2"
                        xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M10 15v4a3 3 0 003 3l4-9V2H5.72a2 2 0 00-2 1.7l-1.38 9a2 2 0 002 2.3zm7-13h2.67A2.31 2.31 0 0122 4v7a2.31 2.31 0 01-2.33 2H17" />
                    </svg>
                </button>}
        </>
    )
}
