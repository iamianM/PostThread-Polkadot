import React from 'react'

export default function ProgressBar({ percentage }) {
    return (
        <>
            <div className="flex justify-between mb-1">
                <span className="text-base font-medium text-inherit">Level</span>
                <span className="text-sm font-medium text-inherit">{percentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-primary h-2.5 rounded-full" style={{ "width": `${percentage}%` }} />
            </div>
        </>
    )
}
