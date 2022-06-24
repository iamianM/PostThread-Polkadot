import React from 'react'
import MockPost from './MockPost'
import { v4 as uuidv4 } from 'uuid';

export default function MockDisplayPosts({ numPosts }) {

    const posts = Array.apply(null, Array(numPosts)).map(function () { })

    return (
        <>
            {posts?.map(() =>
                (<MockPost key={uuidv4()} />))}
        </>
    )
}
