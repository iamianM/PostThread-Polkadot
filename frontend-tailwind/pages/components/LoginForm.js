import React from 'react'
import Image from 'next/image'

export default function LoginForm() {

    return (
        <div className="flex items-center justify-center h-full bg-base-100">
            <div className="px-8 py-6 mt-4 text-left bg-base-200 shadow-lg">
                <div className="flex justify-center">
                    <Image src="/postthreadicon.png" height={80} width={80} />
                </div>
                <h3 className="text-2xl font-bold text-center">Login to your account</h3>
                <form action="">
                    <div className="mt-4">
                        <div>
                            <label className="block" htmlFor="email">Username</label>
                            <input type="text" placeholder="Username"
                                className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600" />
                            {/* <span className="text-xs tracking-wide text-red-600">Email field is required </span> */}
                        </div>
                        <div className="mt-4">
                            <label className="block">Password</label>
                            <input type="password" placeholder="Password"
                                className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600" />
                        </div>
                        <div className="flex items-baseline justify-between">
                            <button className="px-6 py-2 mt-4 text-white bg-primary rounded-lg hover:bg-primary-focus">Login</button>
                            <a href="#" className="text-sm text-inherit hover:underline">Forgot password?</a>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    )
}
