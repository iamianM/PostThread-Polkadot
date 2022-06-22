import React from 'react'
import Post from './Post'

export default function DisplayPosts({ posts }) {
    return (
        <>
            {posts?.map((post) =>
                (<Post key={post.ipfs_hash} post={post} />))}
        </>
    )
}
