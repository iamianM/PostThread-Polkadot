import React from 'react'

export default function CreatePost() {
    return (
        <div className="flex w-full p-8 border-b-4 border-gray-300">
            <span className="flex-shrink-0 w-12 h-12 bg-base-300 rounded-full"></span>
            <div className="flex flex-col flex-grow ml-4">
                <textarea className="p-3 bg-transparent border border-gray-500 rounded-sm" name="" id="" rows="3" placeholder="What's happening?"></textarea>
                <div className="flex justify-between mt-2">
                    <button className="flex items-center h-8 px-3 text-xs rounded-xl hover:text-base-100 hover:bg-secondary">Attach</button>
                    <button className="flex items-center h-8 px-3 text-xs text-base-100 rounded-xl bg-secondary hover:bg-secondary-focus">Post</button>
                </div>
            </div>
        </div>
    )
}
