import React, { useState } from 'react'
import Comments from '../Buttons/Comments'
import ThumbsDown from '../Buttons/ThumbsDown'
import ThumbsUp from '../Buttons/ThumbsUp'

export default function MockPost() {

    return (
        <div className="flex w-full p-8 border-b border-gray-300">
            <span className="flex-shrink-0 w-12 h-12 bg-primary-400 rounded-full">
                <img alt="profil" src="/postthreadicon.png"
                    className="mx-auto object-cover rounded-full" />
            </span>
            <div className="flex flex-col flex-grow ml-4">
                <div className="flex">
                    <span className="font-semibold">@Username</span>
                    <span className="ml-auto text-sm">Today</span>
                </div>
                <p className="font-bold">Title</p>
                <p className="mt-1">This is a mock post</p>
                {/* <div className="flex items-center justify-center h-64 mt-2 bg-primary-200">
                    <img alt="image-not-found" src="./not-found.png" className="flex items-center justify-center h-64 " />
                </div> */}
                <div className="flex mt-2 items-center justify-between">
                    <ThumbsUp upvotes={10} />
                    <ThumbsDown downvotes={10} />
                    <Comments numberOfComments={10} />
                    <p className="font-bold">#mock</p>
                </div>
            </div>
        </div>
    )
}
