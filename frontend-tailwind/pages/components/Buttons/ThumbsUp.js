import React from 'react'
import Image from 'next/image'

export default function ThumbsUp({ upvotes }) {
    return (
        <div>
            <button className="text-grey-darkest font-bold py-2 px-4 rounded inline-flex items-center space-x-2">
                <Image className="w-4 h-4 mr-2" src="/thumbs-up.svg" height={20} width={20} />
                <span>{upvotes}</span>
            </button>
        </div>
    )
}
