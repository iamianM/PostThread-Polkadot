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

  useEffect(() => {
    themeChange(false)
    // 👆 false parameter is required for react project
    const user = localStorage.getItem('username')
    if (user) {
      setIsLoggedIn(true)
    } else {
      setIsLoggedIn(false)
    }

    console.log("Is Logged in: " + isLoggedIn)
  }, [isLoggedIn])

  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AppWrapper isLoggedIn={isLoggedIn}>
          <Header />
          <Component {...pageProps} />
        </AppWrapper>
      </ToastProvider>
    </QueryClientProvider>
  )
}

export default MyApp
