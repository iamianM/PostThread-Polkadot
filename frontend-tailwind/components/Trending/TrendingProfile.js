import React, { useState } from 'react'
import Link from 'next/link'

export default function TrendingProfile({ profile }) {

    const user = {
        id: profile.msa_id,
        username: profile.username,
        profilePic: profile.profile_pic
    }

    const [showPic, setShowPic] = useState(true)

    const onErrorPic = () => {
        setShowPic(false);
    }

    return (
        <div className="flex w-full py-4 border-b border-primary">
            <span className="flex-shrink-0 w-10 h-10 bg-base-300 rounded-full">
                {showPic ?
                    <img alt="profil" onError={onErrorPic} src={user.profilePic}
                        className="mx-auto object-cover rounded-full" /> :
                    <img alt="profil" src="/postthreadicon.png"
                        className="mx-auto object-cover rounded-full" />}
            </span>
            <div className="flex flex-col flex-grow ml-2">
                <div className="flex text-sm font-bold hover:text-primary" style={{ cursor: "pointer" }}>
                    <Link href={{
                        pathname: `/profile/${encodeURIComponent(user.id)}`,
                        query: user
                    }}>
                        <span className="ml-1">@{user.username}</span></Link>
                </div>
            </div>
        </div>
    )
}
