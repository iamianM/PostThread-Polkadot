import React, { useState, useEffect } from 'react'
import ProgressBar from './ProgressBar'
import { isImage } from '../../utils/Utils'

export default function ProfileCard({ id, username, profilePic }) {

    const [percentage, setPercentage] = useState(0)
    const [level, setLevel] = useState(0)
    const imageSrc = "/postthreadicon.png";
    const image = isImage(profilePic) ? profilePic : imageSrc

    useEffect(() => {

        async function getExpInfo() {
            if (id > 0) {
                const response = await fetch(`/api/user/level/${id}`)
                const data = await response.json()
                const percentageToNextLevel = (data.exp * 100) / data.exp_to_next_level
                setPercentage(Math.floor(percentageToNextLevel))
                setLevel(data.level)
            }
        }

        getExpInfo()
    }, [id])

    return (
        <div className="w-1/5 md:w-1/5 md:mx-2">
            <div className="bg-base-200 p-3 border-t-4 border-primary">
                <div className="image overflow-hidden">
                    <img className="h-auto w-full mx-auto"
                        src={image}
                        alt="" />
                </div>
                <h1 className="text-inherit font-bold text-xl leading-8 my-1">{username}</h1>
                <h3 className="text-inherit font-lg text-semibold leading-6">Owner at Her Company Inc.</h3>
                <p className="text-sm text-inherit leading-6">Lorem ipsum dolor sit amet
                    consectetur adipisicing elit.
                    Reprehenderit, eligendi dolorum sequi illum qui unde aspernatur non deserunt</p>
                <ul
                    className="bg-base-300 text-inherit py-2 px-3 mt-3 rounded shadow-sm">
                    <li className="flex items-center py-3">
                        <button className="w-full bg-primary py-1 px-2 rounded text-inherit font-semibold text-md">Follow</button>
                    </li>
                    <li>
                        <ProgressBar percentage={percentage} level={level} />
                    </li>
                    {/* <li className="flex items-center py-3">
                        <span>Member since</span>
                        <span className="ml-auto">Nov 07, 2016</span>
                    </li> */}
                </ul>
            </div>
        </div>
    )
}
