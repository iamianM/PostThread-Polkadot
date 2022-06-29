import React, { useEffect, useState } from 'react'
import { isImage } from '../../utils/Utils'
import { randomIntFromInterval } from '../../utils/Utils'
import Link from 'next/link'
import Vote from '../Buttons/Vote'

export default function Post({ post, fullImage }) {

    const [showImage, setShowImage] = useState(true)
    const [showPic, setShowPic] = useState(true)
    const user = {
        username: post.username,
        profilePic: post.profile_pic,
        id: post.msa_id
    }

    const fullImageClass = fullImage ? "flex items-center justify-center h-auto" : "flex items-center justify-center h-64"
    const fullImageClassDiv = fullImage ? "flex items-center justify-center h-auto mt-2 bg-primary-200" : "flex items-center justify-center h-64 mt-2 bg-primary-200"

    const body = post.body ? post.body.length > 500 ? post.body.substring(0, 500) + '...' : post.body : ""
    const randomImageNumber = randomIntFromInterval(1, 6)
    const imageSrc = `https://www.tailwind-kit.com/images/blog/${randomImageNumber}.jpg`
    const image = post.url ? post.url : imageSrc

    const onError = () => {
        setShowImage(false);
    }

    const onErrorPic = () => {
        setShowPic(false);
    }

    return (
        <div className="flex w-auto p-8 border-b border-primary ">
            <div className="flex flex-col w-12 h-12 justify-center ">
                <Vote type="up" post={post} />
                {post.total_votes}
                <Vote type="down" post={post} />
            </div>
            <span className="flex-shrink-0 w-12 h-12 bg-primary-400 rounded-full">
                {showPic ?
                    <img alt="profil" onError={onErrorPic} src={post.profile_pic}
                        className="mx-auto object-cover rounded-full" /> :
                    <img alt="profil" src="/postthreadicon.png"
                        className="mx-auto object-cover rounded-full" />}
            </span>
            <Link href={{
                pathname: `/post/${encodeURIComponent(post.ipfs_hash)}`,
                query: post
            }}>
                <div className="flex flex-col w-1/2 flex-grow ml-4" style={{ cursor: 'pointer' }}>
                    <div className="flex">
                        {/* <span className="font-semibold">@{username}</span> */}
                        <Link href={{
                            pathname: `/profile/${encodeURIComponent(user.id)}`,
                            query: user
                        }}><span className="font-semibold hover:text-primary-focus" style={{ cursor: 'pointer' }}>@{user.username}</span></Link>
                        <span className="ml-auto text-sm">{post.date_minted}</span>
                    </div>
                    <p className="font-bold">{post.title}</p>
                    <p className="flex mt-1 flex-wrap">{body}</p>
                    {isImage(image) ?
                        <div className={fullImageClassDiv}>
                            {(showImage ?
                                <img alt="image" onError={onError} src={image} className={fullImageClass} />
                                : <img alt="image-not-found" src="./not-found.png" className={fullImageClass} />
                            )
                            }
                        </div> : <></>}
                    <Link href={{
                        pathname: `/category/${(post.category)}`
                    }}>
                        <div className="flex mt-2 justify-end">
                            <p className="font-bold hover:text-primary-focus" style={{ cursor: 'pointer' }}>#{post.category}</p>
                        </div>
                    </Link>
                </div>
            </Link>

        </div>
    )
}
