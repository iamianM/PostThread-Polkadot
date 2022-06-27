import React, { useEffect, useState } from 'react'
import ProfileCard from './ProfileCard'
import ProfileInfo from './ProfileInfo';

export default function ProfileSection() {

    const [posts, setPosts] = useState([]);
    const [iter, setIter] = useState(1);
    const [id, setId] = useState(0);
    const [username, setUsername] = useState('');
    const [profilePic, setProfilePic] = useState('');
    const numMessagesPerScroll = 10

    useEffect(() => {
        const msaId = localStorage.getItem("msa_id");
        if (msaId) setId(msaId)
        else setId(0)
        const user = localStorage.getItem("username");
        if (user) setUsername(user)
        else setUsername('')
        const pic = localStorage.getItem("profile_pic");
        if (pic) setProfilePic(pic)
        else setProfilePic('')
    }, [id])

    async function fetchPosts() {
        const response = await fetch(`/api/posts/${iter}/${numMessagesPerScroll}?` + new URLSearchParams({ user_msa_id: id }));
        const data = await response.json()
        setPosts(posts.concat(data));
        setIter(prevIter => prevIter + 1);
    }


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
