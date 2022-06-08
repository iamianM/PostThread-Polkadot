import React from 'react'

export default function Message({ message }) {
    return (
        <div>
            <h1>{message.title}</h1>
            <p>{message.body}</p>
            {/* <Link href={`/posts/${encodeURIComponent(message.id)}`}>
                <a>Comments</a>
            </Link> */}
        </div>
    )
}
