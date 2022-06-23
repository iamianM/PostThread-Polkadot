import React from 'react'
import Login from './components/LoginForm'
import Modal from './components/Modal'

export default function Test() {

    const postToMint =
    {
        category: "none",
        username: "Charlie",
        profile_pic: "string",
        title: "title",
        body: "string",
        url: "http://www.google.com",
        is_nsfw: true
    }

    const mintPost = async () => {
        const response = await fetch('/api/submit?' + new URLSearchParams({
            user_msa_id: 1,
            wait_for_inclusion: false,
            wait_for_finalization: false
        }), {
            method: 'POST',
            body: JSON.stringify({ postToMint }),
            headers: {
                'Content-Type': 'application/json'
            }
        })
        const data = await response.json()
        console.log(data)
    }


    return (
        <>
            {/* <button onClick={mintPost}>Mint Post</button> */}

            <Modal />
        </>
    )
}
