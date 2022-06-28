import Feed from '../components/Feed/Feed'
import React from 'react'
import LoginForm from '../components/LoginForm'
import { useAppContext } from '../context/AppContext'

export default function Home() {

  const context = useAppContext()
  const isLoggedIn = context["isLoggedIn"]

  return (
    <>
      {isLoggedIn ? <Feed /> : <LoginForm />}
    </>
  )
}