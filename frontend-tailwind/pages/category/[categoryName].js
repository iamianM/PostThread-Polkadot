import React from 'react'
import { useRouter } from 'next/router'
import CategorySection from '../../components/Category/CategorySection'

export default function Profile() {

    const router = useRouter()
    const category = router.query.categoryName

    return (
        <>
            <CategorySection category={category} />
        </>
    )
}
