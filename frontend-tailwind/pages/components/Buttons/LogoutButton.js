import React from 'react'

export default function LogoutButton() {

    function logout() {
        localStorage.removeItem("username")
        localStorage.removeItem("msa_id")
        localStorage.removeItem("profile_pic")
        window.location.reload()
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
