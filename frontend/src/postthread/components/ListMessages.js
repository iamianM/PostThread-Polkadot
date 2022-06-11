import Message from "./Message";
import axios from "axios";
import React, { useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { useQuery } from "react-query";

import "./css/ListMessages.css";

export default function ListMessages() {
  const { error, isError, isLoading } = useQuery("messages", fetchMessages);
  // const [allMessages, setAllMessages] = useState([]);
  const [messages, setMessages] = useState([]);
  // const messagesPerScroll = 10;

  async function fetchMessages() {
    // if (messages.length == 0) {
    const { data } = await axios.get(
      "https://jsonplaceholder.typicode.com/posts"
    );
    setMessages(messages.concat(data));
    // }
    // if (messages.length + messagesPerScroll >= allMessages.length) {
    //   const { data } = await axios.get(
    //     "https://jsonplaceholder.typicode.com/posts"
    //   );
    //   setAllMessages(allMessages.concat(data));
    // }
    // console.log(allMessages.length);
    // console.log(messages.length);
    // setMessages(
    //   messages.concat(
    //     allMessages.slice(messages.length, messages.length + messagesPerScroll)
    //   )
    // );
    // console.log(messages.length);
  }

  if (isLoading) {
    return <div>Loadings...</div>;
  }
  if (isError) {
    console.log("error");
    return <div>Error! {error.message}</div>;
  }

  return (
    <div className="all-messages-container">
      <InfiniteScroll
        dataLength={messages.length}
        next={fetchMessages}
        hasMore={true}
        loader={<h4>Loading...</h4>}
      >
        {messages.map((message) => (
          <Message key={message.id} message={message} />
        ))}
      </InfiniteScroll>
    </div>
  );
}
