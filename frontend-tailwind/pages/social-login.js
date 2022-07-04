import React from 'react'
import { useSession } from 'next-auth/react'
import SocialLogin from '../components/Social/SocialLogin'

export default function SocialLoginPage() {

    const { data: session, status } = useSession()
    const loading = status === "loading"

    return (
        <div className="container">
            <SocialLogin />
            <main>
                <h1 >Authentication in Next.js app using Next-Auth</h1>
                <div>
                    {loading && <h1>Loading...</h1>}
                    {
                        session &&
                        <>
                            <p style={{ marginBottom: '10px' }}> Welcome, {session.user.name ?? session.user.email}</p> <br />
                            <img src={session.user.image} alt="" />
                        </>
                    }
                    {
                        !session &&
                        <>
                            <p >Please Sign in</p>
                            <img src="https://cdn.dribbble.com/users/759083/screenshots/6915953/2.gif" alt="" />
                            <p>GIF by <a href="https://dribbble.com/shots/6915953-Another-man-down/attachments/6915953-Another-man-down?mode=media">Another man</a> </p>
                        </>
                    }
                </div>
            </main>
        </div>
    )
}
