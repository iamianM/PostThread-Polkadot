import React, { useState } from 'react'
import Message from './Message'
import { useQuery } from 'react-query'
import axios from 'axios'

export default function ListMessages() {

  const { error, isError, isLoading } = useQuery('messages', fetchMessages)
  const [messages, setMessages] = useState([])

  async function fetchMessages() {
    const { data } = await axios.get("https://jsonplaceholder.typicode.com/posts")
    setMessages(data)
  }

  if (isLoading) {
    return <div>Loading...</div>
  }
  if (isError) {
    return <div>Error! {error.message}</div>
  }

  return (
    <div>
      {
        messages?.map((message) =>
          <Message key={message.id} message={message} />
        )
      }
    </div>
  )

}
