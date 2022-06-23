import React, { useState } from 'react'
import Link from 'next/link'

export default function LoginButton() {


    return (
        <>
            <a className="bg-secondary px-4 py-2 rounded-xl text-inherit hover:bg-secondary-focus focus:ring focus:ring-purple-500 focus:ring-opacity-25 outline-none"
                href="/login" >
                Login
            </a>
        </>
    )
}
