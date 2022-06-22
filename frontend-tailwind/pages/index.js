import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import Editor from './components/Editor'
import Feed from './components/Feed/Feed'

export default function Home() {
  return (
    <>
      <Feed />
      {/* <Editor /> */}
    </>
  )
}