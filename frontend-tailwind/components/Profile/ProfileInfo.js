import React from 'react'
import MockDisplayPosts from '../Mocks/MockDisplayPosts'

export default function ProfileInfo({ type }) {

    return (
        <div className="w-6/12 md:w-6/12 mx-2 min-h-screen overflow-auto">
            <div className="bg-base-200 p-3 border-t-4 border-primary">
                <h1 className="text-inherit font-bold text-xl leading-8 my-1 sticky">{type}</h1>
                <MockDisplayPosts numPosts={100} />
            </div>
        </div>
    )
}
