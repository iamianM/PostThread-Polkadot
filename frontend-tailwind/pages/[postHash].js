import React from 'react'
import { useRouter } from 'next/router'
import ShowPost from '../components/Post/ShowPost'

export default function PostPage() {

  const router = useRouter()
  const post = router.query

  return (
    <div>
      <ShowPost post={post} />
    </div>
  )
}
