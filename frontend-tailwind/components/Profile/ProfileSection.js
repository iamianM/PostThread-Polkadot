import React, { useEffect, useState } from 'react'
import { useAppContext } from '../../context/AppContext';
import ProfileCard from './ProfileCard'
import ProfileInfo from './ProfileInfo';

export default function ProfileSection() {

    const [posts, setPosts] = useState([]);
    const [iter, setIter] = useState(1);
    const numMessagesPerScroll = 10

    const context = useAppContext()
    const id = context.id
    const username = context.username
    const profilePic = context.profilePic



    return (
        <div>
            <div className="container mx-auto my-5 p-5">
                <main className="flex flex-row h-screen md:flex md:-mx-2 ">
                    <ProfileCard id={id} username={username} profilePic={profilePic} />
                    <ProfileInfo type="Posts" />
                    <ProfileInfo type="Comments" />
                </main>
            </div>
        </div>
    )
}
