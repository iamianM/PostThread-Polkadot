import React from 'react'
import ProfileCard from './ProfileCard'
import ProfileInfo from './ProfileInfo';


export default function ProfileSection({ user }) {

    return (
        <div>
            <div className="container mx-auto my-5 p-5">
                <main className="flex flex-row h-screen md:flex md:-mx-2 ">
                    <ProfileCard id={user.id} username={user.username} profilePic={user.profilePic} />
                    <ProfileInfo type="Posts" user={user} />
                    <ProfileInfo type="Comments" user={user} />
                </main>
            </div>
        </div>
    )
}
