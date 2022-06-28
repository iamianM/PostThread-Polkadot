import React from 'react'
import ProfileSection from '../../components/Profile/ProfileSection'
import { useRouter } from 'next/router'

export default function Profile() {

    const router = useRouter()
    const user = router.query

    return (
        <>
            <ProfileSection user={user} />
        </>
    )
}
