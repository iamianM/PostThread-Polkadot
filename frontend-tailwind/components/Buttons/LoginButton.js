import Link from 'next/link'
import React from 'react'

export default function LoginButton() {

    return (
        <>
            <Link href="/login">
                <button className="bg-secondary px-4 py-2 rounded-xl text-inherit hover:bg-secondary-focus focus:ring focus:ring-purple-500 focus:ring-opacity-25 outline-none">
                    Login
                </button>
            </Link>
        </>
    )
}
