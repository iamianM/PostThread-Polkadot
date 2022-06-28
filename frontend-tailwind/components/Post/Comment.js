import React from 'react'

export default function Comment({ comment }) {
    return (
        <div className="flex w-auto p-8 border-b border-gray-300">
            <span className="flex-shrink-0 w-12 h-12 bg-primary-400 rounded-full">
                <img alt="profil" src={comment.profile_pic}
                    className="mx-auto object-cover rounded-full" />
            </span>
            <div className="flex flex-col flex-grow ml-4">
                <div className="flex">
                    {/* <span className="font-semibold">@{username}</span> */}
                    <span className="font-semibold">@{comment.username}</span>
                    <span className="ml-auto text-sm">{comment.date_minted}</span>
                </div>
                <p className="mt-1">{comment.body}</p>
            </div>
        </div>
    )
}
