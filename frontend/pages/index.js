import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import TopBar from '../components/TopBar'
import FrontPage from '../components/FrontPage'
import Footer from '../components/Footer'


export default function Home() {
  return (
    <div className={styles.container}>
      <TopBar />
      <FrontPage />
      <Footer />
    </div>
  )
}
