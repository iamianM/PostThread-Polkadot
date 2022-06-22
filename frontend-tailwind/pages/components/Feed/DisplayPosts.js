import React from 'react'
import Post from './Post'
import { v4 as uuidv4 } from 'uuid';

export default function DisplayPosts({ posts }) {
    return (
        <>
            {posts?.map((post) =>
                (<Post key={uuidv4()} post={post} />))}
        </>
    )
}
