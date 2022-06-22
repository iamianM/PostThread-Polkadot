import React from 'react'
import Post from './Post'

export default function DisplayPosts({ posts }) {
    return (
        <>
            {posts?.map((post) =>
                (<Post key={post.data.id} post={post} />))}
        </>
    )
}
