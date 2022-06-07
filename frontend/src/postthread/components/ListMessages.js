import React, { useState, useEffect } from 'react'
import Message from './Message'

export default function ListMessages() {

  const [messages, setMessages] = useState([])

  useEffect(() => {
    fetch("https://jsonplaceholder.typicode.com/posts")
      .then(response => response.json())
      .then(data => setMessages(data))
  }, [])

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
