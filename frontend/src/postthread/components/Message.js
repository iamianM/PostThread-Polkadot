import React from "react";
import "./css/Message.css";

export default function Message({ message }) {
  return (
    <div className="all-messages-container">
      <div className="message-container">
        <div className="sub-message-container">
          <h1 className="message-title">{message.title}</h1>
          <p className="message-body">{message.body}</p>
          {/* <Link href={`/posts/${encodeURIComponent(message.id)}`}>
                <a>Comments</a>
            </Link> */}
        </div>
      </div>
    </div>
  );
}
