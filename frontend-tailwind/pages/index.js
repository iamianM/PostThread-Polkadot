import Feed from './components/Feed/Feed'
import Header from './components/Header/Header'
import React, { useEffect, useState } from 'react'
import LoginForm from './components/LoginForm'

export default function Home() {

  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const item = localStorage.getItem('username')
    console.log('item ' + item)
    if (item) {
      console.log(true)
      setIsLoggedIn(true)
    } else {
      console.log(false)
      setIsLoggedIn(false)
    }
    console.log("Is logged in: " + isLoggedIn)
  }, [])

  return (
    <>
      {isLoggedIn ? <Feed /> : <LoginForm />}
    </>
  )
}