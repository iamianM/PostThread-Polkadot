import React from 'react'
import Image from 'next/image'

export default function ThumbsDown() {
    return (
        <div>
            <button className="bg-grey-light hover:bg-grey text-grey-darkest font-bold py-2 px-4 rounded inline-flex items-center space-x-2">
                <Image className="w-4 h-4 mr-2" src="/thumbs-down.svg" height={20} width={20} />
                <span>Downvote</span>
            </button>
        </div>
    )
}
