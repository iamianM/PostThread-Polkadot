import React, { useState, useEffect } from 'react'
import { useAppContext } from '../../context/AppContext'
import ProgressBar from './ProgressBar'

export default function ProfileCard({ id, username, profilePic }) {

    const [percentage, setPercentage] = useState(0)
    const [level, setLevel] = useState(0)
    const [isFollowing, setIsFollowing] = useState(false)

    const context = useAppContext()
    const loggedUser = context.username
    const loggedId = context.id

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

        async function getFollowing() {
            const response = await fetch('/api/user/following?' + new URLSearchParams({ user_msa_id: loggedId }))
            const data = await response.json()
            console.log(data)
            setIsFollowing(checkIfFollowing((data)))
        }

        getFollowing()
        getExpInfo()
    }, [id])

    const checkIfFollowing = (data) => {
        data?.filter(item => { item.following_msa_id === loggedId })
        return data.length > 0
    }

    const handleClick = async () => {
        let method = isFollowing ? 'unfollow' : 'follow'
        const response = await fetch(`/api/user/interact/${method}?` + new URLSearchParams({
            user_msa_id: loggedId,
            user_msa_id_to_interact_with: id
        }))
        const data = await response.json()
        console.log(data)
    }

    return (
        <div className="w-1/5 md:w-1/5 md:mx-2">
            <div className="bg-base-200 p-3 border-t-4 border-primary">
                <div className="image overflow-hidden">
                    <img className="h-auto w-full mx-auto"
                        src={profilePic}
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
                        {(loggedUser === username) ? <></> :
                            <button className="w-full bg-primary py-1 px-2 rounded text-inherit font-semibold text-md" onClick={handleClick}>
                                {isFollowing ? "Unfollow" : "Follow"}
                            </button >}
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
