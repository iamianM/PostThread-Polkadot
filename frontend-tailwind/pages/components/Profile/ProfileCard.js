import React, { useState, useEffect } from 'react'
import ProgressBar from './ProgressBar'

export default function ProfileCard({ id }) {

    const [percentage, setPercentage] = useState(0)
    const [level, setLevel] = useState(0)

    useEffect(() => {

        async function getExpInfo() {
            const response = await fetch(`/api/user/level/${id}`)
            const data = await response.json()
            return data
        }

        const expData = getExpInfo()
        const percentageToNextLevel = (expData.exp * 100) / expData.exp_to_next_level
        setPercentage(percentageToNextLevel)
        setLevel(expData.level)

    }, [])

    return (
        <div className="w-full md:w-3/12 md:mx-2">
            <div className="bg-base-200 p-3 border-t-4 border-primary">
                <div className="image overflow-hidden">
                    <img className="h-auto w-full mx-auto"
                        src="https://lavinephotography.com.au/wp-content/uploads/2017/01/PROFILE-Photography-112.jpg"
                        alt="" />
                </div>
                <h1 className="text-inherit font-bold text-xl leading-8 my-1">Jane Doe</h1>
                <h3 className="text-inherit font-lg text-semibold leading-6">Owner at Her Company Inc.</h3>
                <p className="text-sm text-inherit leading-6">Lorem ipsum dolor sit amet
                    consectetur adipisicing elit.
                    Reprehenderit, eligendi dolorum sequi illum qui unde aspernatur non deserunt</p>
                <ul
                    className="bg-base-300 text-inherit py-2 px-3 mt-3 rounded shadow-sm">
                    <li className="flex items-center py-3">
                        <span>Status</span>
                        <span className="ml-auto">
                            <span
                                className="bg-primary py-1 px-2 rounded text-white text-sm">Active</span></span>
                    </li>
                    <li>
                        <ProgressBar percentage={60} level={10} />
                    </li>
                    <li className="flex items-center py-3">
                        <span>Member since</span>
                        <span className="ml-auto">Nov 07, 2016</span>
                    </li>
                </ul>
            </div>
        </div>
    )
}
