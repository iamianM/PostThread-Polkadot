import React from 'react'
import { useSession, signIn, signOut } from 'next-auth/react'
import Link from 'next/link';

export default function SocialLogin() {

    const { data: session } = useSession();

    const handleSignin = (e) => {
        e.preventDefault()
        signIn()
    }

    const handleSignout = (e) => {
        e.preventDefault()
        signOut()
    }

    return (
        <div className='header'>
            <Link href='/social-login'>
                <a className='logo'>NextAuth.js</a>
            </Link>
            {session && <a href="#" onClick={handleSignout} className="btn-signin">Sign out</a>}
            {!session && <a href="#" onClick={handleSignin} className="btn-signin">Sign in</a>}
        </div>
    )
}
