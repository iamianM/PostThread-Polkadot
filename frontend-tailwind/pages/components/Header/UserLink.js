import React from 'react'

export default function UserLink() {

    const username = localStorage.getItem("username")
    const profile_pic = localStorage.getItem("profile_pic")

    return (
        <a className="flex px-3 py-2 mt-2 mt-auto hover:text-base-100 text-lg rounded-lg font-medium hover:bg-secondary" href="/profile">
            <span className="flex-shrink-0 w-10 h-10 bg-base-300 rounded-full">{profile_pic}</span>
            <div className="flex flex-col ml-2">
                <span className="mt-1 text-sm font-semibold leading-none">{username}</span>
                <span className="mt-1 text-xs leading-none">@{username}</span>
            </div>
        </a>
    )
}
