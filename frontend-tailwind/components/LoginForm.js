import React, { useState } from 'react'
import Image from 'next/image'
import { useToasts } from "react-toast-notifications";

export default function LoginForm() {

    const { addToast } = useToasts()

    async function fetchUser(username) {
        const response = await fetch(`api/user/data/${username}`)
        const data = await response.json()
        return data
    }

    const handleSubmit = async (event) => {
        // Stop the form from submitting and refreshing the page.
        event.preventDefault()

        const info = {
            username: event.target.username.value,
            password: event.target.password.value
        }

        const response = await fetchUser(info.username)
        console.log(response)

        if (response.password === info.password) {
            addToast("Login successful", {
                appearance: 'success',
                autoDismiss: true,
            })
            localStorage.setItem("username", info.username)
            localStorage.setItem("msa_id", response.msa_id)
            localStorage.setItem("profile_pic", response.profile_pic)
            window.location.reload()
        }
        else {
            addToast("Wrong password", {
                appearance: 'error',
                autoDismiss: true,
            })
        }
    }

    return (
        <div className="w-full mt-20">
            <div className="flex items-center justify-center h-full bg-base-100">
                <div className="px-8 py-6 mt-4 text-left bg-base-200 shadow-lg">
                    <div className="flex justify-center">
                        <Image src="/postthreadicon.png" height={80} width={80} />
                    </div>
                    <h3 className="text-2xl font-bold text-center">Login to your account</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="mt-4">
                            <div>
                                <label className="block">Username</label>
                                <input type="text" id="username" placeholder="Username"
                                    className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600" />
                                {/* <span className="text-xs tracking-wide text-red-600">Email field is required </span> */}
                            </div>
                            <div className="mt-4">
                                <label className="block">Password</label>
                                <input type="password" id="password" placeholder="Password"
                                    className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600" />
                            </div>
                            <div className="flex items-baseline justify-between">
                                <button type="submit" className="px-6 py-2 mt-4 text-base-content bg-primary rounded-lg hover:bg-primary-focus">Login</button>
                                <a href="#" className="text-sm text-inherit hover:underline">Forgot password?</a>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
