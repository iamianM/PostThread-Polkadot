import React from "react";
import "./css/Message.css";
// import { LinkPreview } from '@dhaiwat10/react-link-preview';

export default function Message({ message }) {
  return (
    <div className="all-messages-container">
      <div className="message-container">
        <div className="head">
          <img className="ava" src={message.data.profile_pic} />
          <div className="group-5">
            <div className="nikcnamevalign-text-middleroboto-normal-black-13px">
              {message.data.username}
            </div>
            <div className="timevalign-text-middleroboto-normal-gray-10px">
              Block: {message.data.block_number}
            </div>
          </div>
        </div>
        <div className="sub-message-container">
          <h1 className="message-title">{message.data.title}</h1>
          {message.data.body == '' ? <link url={message.data.url} width='400px' /> : 
          <p className="message-body">{message.data.body}</p>}
          {/* <Link href={`/posts/${encodeURIComponent(message.id)}`}>
                <a>Comments</a>
            </Link> */}
        </div>
      </div>
    </div>
  );
}
