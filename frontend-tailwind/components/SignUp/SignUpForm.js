import React from 'react'
import Image from 'next/image'
import { useToasts } from "react-toast-notifications";

export default function SignUpForm() {
    const { addToast } = useToasts()

    async function mintUser(username, password, profile_pic) {

        const response = await fetch(`api/user/mint?` + new URLSearchParams({
            username: username,
            password: password,
            profile_pic: profile_pic,
        }), {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        })
        const data = await response.json()
        return data
    }

    const handleSubmit = async (event) => {
        // Stop the form from submitting and refreshing the page.
        event.preventDefault()

        const username = event.target.username.value
        const password = event.target.password.value
        const profile_pic = event.target.profile_pic.value

        const response = await mintUser(username, password, profile_pic)
        console.log(response)

        switch (response.status_code) {
            case 406:
                addToast("Username already exists", {
                    appearance: 'error',
                    autoDismiss: true,
                })
                break;
            case 422:
                addToast("A problem occurred while signing up", {
                    appearance: 'error',
                    autoDismiss: true,
                })
                break;
            case 200:
                addToast("Sign up successful", {
                    appearance: 'success',
                    autoDismiss: true,
                })
                localStorage.setItem("username", response.username)
                localStorage.setItem("msa_id", response.msa_id)
                localStorage.setItem("profile_pic", response.profile_pic)
                window.location = "/"
            default:
                break;
        }
    }

    return (
        <div className="w-full mt-20">
            <div className="flex items-center justify-center h-full bg-base-100">
                <div className="px-8 py-6 mt-4 text-left bg-base-200 shadow-lg">
                    <div className="flex justify-center">
                        <Image src="/postthreadicon.png" height={80} width={80} />
                    </div>
                    <h3 className="text-2xl font-bold text-center">Sign up for a new account</h3>
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
                            <div className="mt-4">
                                <label className="block">Profile Pic URL</label>
                                <input type="text" id="profile_pic" placeholder="https://www.redditstatic.com/avatars/defaults/v2/avatar_default_7.png"
                                    className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600" />
                            </div>
                            <div className="flex items-baseline justify-between">
                                <button type="submit" className="px-6 py-2 mt-4 text-base-content bg-primary rounded-lg hover:bg-primary-focus">Sign Up</button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
