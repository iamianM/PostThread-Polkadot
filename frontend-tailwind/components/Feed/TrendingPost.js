import Link from 'next/link'
import React from 'react'

export default function TrendingPost() {
    return (
        <div className="flex w-full py-4 border-b border-gray-300">
            <span className="flex-shrink-0 w-10 h-10 bg-base-300 rounded-full"></span>
            <div className="flex flex-col flex-grow ml-2">
                <div className="flex text-sm">
                    <span className="font-semibold">Username</span>
                    <span className="ml-1">@username</span>
                </div>
                <p className="mt-1 text-sm">Lorem ipsum dolor sit amet, consectetur adipiscing elit, et dolore magna aliqua.</p>
            </div>
        </div>
    )
}
