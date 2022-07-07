import React from 'react'
import { useRouter } from 'next/router'
import Feed from '../../components/Feed/Feed'

export default function Profile() {

    const router = useRouter()
    const category = router.query.categoryName

    return (
        <>
            <Feed category={category} />
        </>
    )
}
