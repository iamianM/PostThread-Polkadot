import React, { useState } from 'react'
import Login from '../components/LoginForm'
import Modal from '../components/Modal'
import MockPost from '../components/Mocks/MockPost'

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

    const commentToMint =
    {
        post_hash: "QmUY2PmpYNSnon8RBzwJhxd8DCXMH1PCbhnFMu5TgZskPP",
        parent_comment_hash: "string",
        depth: 0,
        body: "a comment",
        is_nsfw: true
    }

    const mintPost = async () => {
        const response = await fetch('/api/submit/post?' + new URLSearchParams({
            user_msa_id: 1337,
            wait_for_inclusion: false,
            wait_for_finalization: false
        }), {
            method: 'POST',
            body: JSON.stringify(postToMint),
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        })
        const data = await response.json()
        console.log(data)
    }


    const mintComment = async () => {
        const response = await fetch('/api/submit/comment?' + new URLSearchParams({
            user_msa_id: 382,
            wait_for_inclusion: false,
            wait_for_finalization: false
        }), {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(commentToMint),
        })
        const data = await response.json()
        console.log(data)
    }

    const follow = async () => {
        const response = await fetch('/api/user/interact/follow?' + new URLSearchParams({
            user_msa_id: 382,
            user_msa_id_to_interact_with: 694
        }), {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
        })
        const data = await response.json()
        console.log(data)
    }

    const unfollow = async () => {
        const response = await fetch('/api/user/interact/unfollow?' + new URLSearchParams({
            user_msa_id: 382,
            user_msa_id_to_interact_with: 694
        }), {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
        })
        const data = await response.json()
        console.log(data)
    }

    const mintUser = async () => {
        const response = await fetch('/api/user/mint?' + new URLSearchParams({
            username: "Pules",
            password: "password",
            profile_pic: "https://img.wattpad.com/cover/61392930-288-k852540.jpg"
        }), {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
        })
        const data = await response.json()
        console.log(data)
    }

    const link = async () => {
        const response = await fetch('/api/user/link?' + new URLSearchParams({
            account_type: "gmail",
            account_value: "test@gmail.com",
            user_msa_id: "11715"
        }), {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
        })
        const data = await response.json()
        console.log(data)
    }

    const claim = async () => {
        const response = await fetch(`/api/airdrop/claim/hughjassjess?` + new URLSearchParams({
            postthread_username: "hughjassjess",
        }), {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
        })
        const data = await response.json()
        console.log(data)
    }

    const getCategories = async () => {
        const response = await fetch('/api/categories')
        const data = await response.json()
        console.log(data)
    }

    const handleSubmit = async (event) => {
        // Stop the form from submitting and refreshing the page.
        event.preventDefault()
        //get input values

        const postHash = event.target.postHash.value
        console.log("Hash: " + postHash)
        const response = await fetch(`/api/post/${postHash}`)
        const data = await response.json()
        console.log(data)
    }

    const getComments = async () => {
        const response = await fetch('/api/comments/QmUY2PmpYNSnon8RBzwJhxd8DCXMH1PCbhnFMu5TgZskPP/1/10')
        const data = await response.json()
        console.log(data)
    }

    const getFollowers = async () => {
        const response = await fetch('/api/user/followers?user_msa_id=382')
        const data = await response.json()
        console.log(data)
    }

    const getFollowings = async () => {
        const response = await fetch('/api/user/following?user_msa_id=382')
        const data = await response.json()
        console.log(data)
    }

    const getSocialScore = async () => {
        const response = await fetch('/api/socialgraph/score?user_msa_id=382')
        const data = await response.json()
        console.log(data)
    }

    const getSocialDict = async () => {
        const response = await fetch('/api/socialgraph/dict_of_dicts?user_msa_id=382')
        const data = await response.json()
        console.log(data)
    }

    const checkAirdrop = async () => {
        const response = await fetch('/api/airdrop/check/hughjassjess')
        const data = await response.json()
        console.log(data)
    }


    return (
        <>
            <button className="bg-secondary ml-2 px-4 py-2 rounded-xl text-inherit hover:bg-secondary-focus focus:ring focus:ring-purple-500 focus:ring-opacity-25 outline-none" onClick={getCategories}>Get Categories</button>
            <div>
                <form onSubmit={handleSubmit}>
                    <input type="text" id="postHash" placeholder="post hash"
                        className="w-auto px-4 ml-2  py-2 mr-4 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600" />
                    <button className="bg-secondary px-4 py-2 rounded-xl text-inherit hover:bg-secondary-focus focus:ring focus:ring-purple-500 focus:ring-opacity-25 outline-none" type="submit">Get Post</button>
                </form>
            </div>
            <div>
                <button className="bg-secondary ml-2 mt-5 px-4 py-2 rounded-xl text-inherit hover:bg-secondary-focus focus:ring focus:ring-purple-500 focus:ring-opacity-25 outline-none" onClick={getComments}>Get Comments</button>
            </div>
            <div>
                <button className="bg-secondary ml-2  mt-5 px-4 py-2 rounded-xl text-inherit hover:bg-secondary-focus focus:ring focus:ring-purple-500 focus:ring-opacity-25 outline-none" onClick={getFollowers}>Get Followers</button>
            </div>
            <div>
                <button className="bg-secondary ml-2 mt-5 px-4 py-2 rounded-xl text-inherit hover:bg-secondary-focus focus:ring focus:ring-purple-500 focus:ring-opacity-25 outline-none" onClick={getFollowings}>Get Followings</button>
            </div>
            <div>
                <button className="bg-secondary ml-2 mt-5 px-4 py-2 rounded-xl text-inherit hover:bg-secondary-focus focus:ring focus:ring-purple-500 focus:ring-opacity-25 outline-none" onClick={checkAirdrop}>Check airdrop</button>
            </div>
            <div>
                <button className="bg-secondary ml-2 mt-5 px-4 py-2 rounded-xl text-inherit hover:bg-secondary-focus focus:ring focus:ring-purple-500 focus:ring-opacity-25 outline-none" onClick={getSocialScore}>Get Social Score</button>
            </div>
            <div>
                <button className="bg-secondary ml-2 mt-5 px-4 py-2 rounded-xl text-inherit hover:bg-secondary-focus focus:ring focus:ring-purple-500 focus:ring-opacity-25 outline-none" onClick={mintComment}>Mint comment</button>
            </div>
            <div>
                <button className="bg-secondary ml-2 mt-5 px-4 py-2 rounded-xl text-inherit hover:bg-secondary-focus focus:ring focus:ring-purple-500 focus:ring-opacity-25 outline-none" onClick={mintPost}>Mint post</button>
            </div>
            <div>
                <button className="bg-secondary ml-2 mt-5 px-4 py-2 rounded-xl text-inherit hover:bg-secondary-focus focus:ring focus:ring-purple-500 focus:ring-opacity-25 outline-none" onClick={follow}>Follow</button>
            </div>
            <div>
                <button className="bg-secondary ml-2 mt-5 px-4 py-2 rounded-xl text-inherit hover:bg-secondary-focus focus:ring focus:ring-purple-500 focus:ring-opacity-25 outline-none" onClick={unfollow}>Unfollow</button>
            </div>
            <div>
                <button className="bg-secondary ml-2 mt-5 px-4 py-2 rounded-xl text-inherit hover:bg-secondary-focus focus:ring focus:ring-purple-500 focus:ring-opacity-25 outline-none" onClick={mintUser}>Mint user</button>
            </div>
            <div>
                <button className="bg-secondary ml-2 mt-5 px-4 py-2 rounded-xl text-inherit hover:bg-secondary-focus focus:ring focus:ring-purple-500 focus:ring-opacity-25 outline-none" onClick={link}>Link</button>
            </div>
            <div>
                <button className="bg-secondary ml-2 mt-5 px-4 py-2 rounded-xl text-inherit hover:bg-secondary-focus focus:ring focus:ring-purple-500 focus:ring-opacity-25 outline-none" onClick={claim}>Claim</button>
            </div>
            <div>
                <button className="bg-secondary ml-2 mt-5 px-4 py-2 rounded-xl text-inherit hover:bg-secondary-focus focus:ring focus:ring-purple-500 focus:ring-opacity-25 outline-none" onClick={getSocialDict}>Get Social Dict</button>
            </div>
            <div>
                <MockPost />
            </div>
        </>
    )
}
