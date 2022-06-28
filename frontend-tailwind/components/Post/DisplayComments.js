import React from 'react'
import Comment from './Comment'
import { v4 as uuidv4 } from 'uuid';

export default function DisplayComments({ comments }) {
    return (
        <div>
            {comments?.map((comment) =>
                (<Comment key={uuidv4()} comment={comment} />))}
        </div>
    )
}
