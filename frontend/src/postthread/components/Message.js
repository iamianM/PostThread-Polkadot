import React from "react";
import "./css/Message.css";
// import { LinkPreview } from '@dhaiwat10/react-link-preview';
// import linkPreviewGenerator from "link-preview-generator";

export default function Message({ message }) {
  function isImage(url) {
    return /\.(jpg|jpeg|png|webp|avif|gif|svg)$/.test(url);
  }
  return (<div>{message.title ? 
    <div className="all-messages-container">
      <div className="message-container">
        <div className="head">
          <img className="ava" src={message.profile_pic} />
          <div className="group-5">
            <div className="nikcnamevalign-text-middleroboto-normal-black-13px">
              {message.username}
            </div>
            <div className="timevalign-text-middleroboto-normal-gray-10px">
              Block: {message.block_number}
            </div>
          </div>
        </div>
        <div className="sub-message-container">
          {message.body != '' ? 
          [<h1 className="message-title">{message.title}</h1>,
          <p className="message-body">{message.body}</p>] :
          isImage(message.url) ?
          <img src={message.url} width='400px' /> :
          <a href={message.url} target="_blank"><h1 className="message-title">{message.title}</h1></a>
          } 
          {/* <Link href={`/posts/${encodeURIComponent(message.id)}`}>
                <a>Comments</a>
            </Link> */}
        </div>
      </div>
    </div>
  : null}</div>
  );
}
