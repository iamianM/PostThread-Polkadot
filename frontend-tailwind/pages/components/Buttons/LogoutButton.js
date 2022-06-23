import React from 'react'

export default function LogoutButton() {

    function logout() {
        localStorage.setItem("username", "")
    }

    return (
        <>
            <button className="bg-secondary px-4 py-2 rounded-xl text-inherit hover:bg-secondary-focus focus:ring focus:ring-purple-500 focus:ring-opacity-25 outline-none"
                onClick={logout}>
                Logout
            </button>
        </>
    )
}
