import '../styles/globals.css'
import { QueryClient, QueryClientProvider } from 'react-query'
import Header from './components/Header/Header'
import { ToastProvider } from 'react-toast-notifications'
import { themeChange } from 'theme-change'
import { useEffect } from 'react'

const queryClient = new QueryClient()

function MyApp({ Component, pageProps }) {

  useEffect(() => {
    themeChange(false)
    // 👆 false parameter is required for react project
  })

  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <Header />
        <Component {...pageProps} />
      </ToastProvider>
    </QueryClientProvider>
  )
}

export default MyApp
