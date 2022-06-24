import React, { useEffect, useState } from 'react'
import ProfileSection from '../components/Profile/ProfileSection'
import LoginForm from '../components/LoginForm'
import { useAppContext } from '../context/AppContext'

export default function Profile() {

    const context = useAppContext()
    const isLoggedIn = context["isLoggedIn"]

    return (
        <>
            {isLoggedIn ? <ProfileSection /> : <LoginForm />}
        </>

    )
}
