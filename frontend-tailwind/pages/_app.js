import '../styles/globals.css'
import { QueryClient, QueryClientProvider } from 'react-query'
import Header from '../components/Header/Header'
import { ToastProvider } from 'react-toast-notifications'
import { themeChange } from 'theme-change'
import React, { useEffect, useState } from 'react'
import { AppWrapper } from '../context/AppContext';

const queryClient = new QueryClient()

function MyApp({ Component, pageProps }) {

  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [username, setUsername] = useState('')
  const [msa_id, setMsa_id] = useState(0)
  const [profilePic, setProfilePic] = useState('')

  useEffect(() => {

    themeChange(false)
    // 👆 false parameter is required for react project
    const user = localStorage.getItem('username')
    const id = localStorage.getItem('msa_id')
    const profilePic = localStorage.getItem('profile_pic')

    if (user) {
      setUsername(user)
      setMsa_id(id)
      setProfilePic(profilePic)
      setIsLoggedIn(true)
    } else {
      setIsLoggedIn(false)
    }

    console.log("Is Logged in: " + isLoggedIn)
    console.log("Username: " + username)
    console.log("MSA ID: " + msa_id)
    console.log("Profile Pic: " + profilePic)

  }, [isLoggedIn])

  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AppWrapper isLoggedIn={isLoggedIn} username={username} id={msa_id} profilePic={profilePic}>
          <Header />
          <Component {...pageProps} />
        </AppWrapper>
      </ToastProvider>
    </QueryClientProvider>
  )
}

export default MyApp
