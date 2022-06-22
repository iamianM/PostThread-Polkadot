import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import ThemeSelector from "./ThemeSelector"
import UserLink from "./UserLink";
import Search from "./Search";
import { themeChange } from 'theme-change'

export default function Header() {

    useEffect(() => {
        themeChange(false)
        // 👆 false parameter is required for react project
    }, [])

    return (
        <nav className="w-full py-6 bg-base-100 w-screen">
            <div className="flex items-center justify-between mx-auto xl:max-w-7xl lg:max-w-5xl md:max-w-3xl md:px-2 px-4">
                <Link href="/" className="group outline-none rounded-lg">
                    <section className="flex items-center text-inherit space-x-2">
                        <Image src="/postthreadicon.png" height={40} width={40} />
                        <a
                            href="/"
                            className="font-bold text-xl  outline-none rounded-lg"
                        >
                            PostThread
                        </a>
                    </section>
                </Link>
                <section>
                    <ul className="md:space-x-8 space-x-6  text-inherit  font-semibold hidden md:flex items-center">
                        <li className="relative group">
                            <ThemeSelector />
                        </li>
                        <li className="relative group">
                            <UserLink />
                        </li>
                        <li className="relative group">
                            <Search />
                        </li>
                        <li>
                            <a className="bg-secondary px-4 py-2 rounded-xl text-white hover:bg-secondary-focus focus:ring focus:ring-purple-500 focus:ring-opacity-25 outline-none">
                                Login
                            </a>
                        </li>
                    </ul>
                    <button className="flex md:hidden hover:bg-gray-100 p-2 rounded-full transition-all focus:ring focus:ring-purple-500 focus:ring-opacity-25 active:bg-gray-200 outline-none">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                        >
                            <path
                                fillRule="evenodd"
                                d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM9 15a1 1 0 011-1h6a1 1 0 110 2h-6a1 1 0 01-1-1z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </button>
                </section>
            </div>
        </nav>
    );
}
