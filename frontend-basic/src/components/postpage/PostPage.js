import axios from "axios";
import React, { useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { useQuery } from "react-query";
import { useParams} from "react-router-dom";

import "./css/PostPage.css";

export default function PostPage() {
    let { post_hash } = useParams();
    const { error, isError, isLoading } = useQuery("messages", fetchMessages);
    const [messages, setMessages] = useState([]);
    const [iter, setIter] = useState(1);
    const numMessagesPerScroll = 10
  
    async function fetchMessages() {
      const { data } = await axios.get(
        `http://cupochia.ddns.net:5000/post/${post_hash}/${iter}/${numMessagesPerScroll}`
      );
      console.log(data, iter, numMessagesPerScroll)
      setMessages(messages.concat(data.results));
      setIter(iter+1);
    }
  
    if (isLoading) {
      return <div>Loadings...</div>;
    }
    if (isError) {
      console.log("error");
      return <div>Error! {error.message}</div>;
    }
  
    return (
        <InfiniteScroll
          dataLength={messages.length}
          next={fetchMessages}
          hasMore={true}
          loader={<h4>Loading...</h4>}
          className="all-messages-container"
        >
          {messages.map((message) => (
            message.id
          ))}
        </InfiniteScroll>
    );
}
