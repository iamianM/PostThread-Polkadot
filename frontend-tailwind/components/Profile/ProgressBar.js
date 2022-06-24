import React from 'react'

export default function ProgressBar({ percentage, level }) {
    return (
        <>
            <div className="flex justify-between mb-1">
                <span className="text-base font-medium text-inherit">Level</span>
                <span className="text-sm font-medium text-inherit">{level}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 text-center">
                <div className="bg-primary h-4 rounded-full text-xs font-medium text-white-100 text-center p-0.5 leading-none" style={{ "width": `${percentage}%` }}>{percentage}%</div>
            </div>
        </>
    )
}
