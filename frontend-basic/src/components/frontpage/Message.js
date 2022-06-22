import React from "react";
import { useNavigate  } from "react-router-dom";

import "./css/Message.css";

// Go here http://127.0.0.1:5000/posts/1/100 for example of output

export default function Message({ message }) {
  const navigate = useNavigate();

  function handleClick() {
      navigate(`/post/${message.data.id}`);
  }

  function isImage(url) {
    return /\.(jpg|jpeg|png|webp|avif|gif|svg)$/.test(url);
  }

  return (<div>{message.data.title ? 
    <div className="all-messages-container">
      <div className="message-container">
        <div className="head">
          <img className="ava" src={message.data.profile_pic} />
          <div className="group-5">
            <div className="nikcnamevalign-text-middleroboto-normal-black-13px">
              {message.data.username}
            </div>
            <div className="timevalign-text-middleroboto-normal-gray-10px">
              Block: {message.block_number}
            </div>
          </div>
        </div>
        <div className="sub-message-container">
          {message.data.body != '' ? 
          [<h1 className="message-title">{message.data.title}</h1>,
          <p className="message-body">{message.data.body}</p>] :
          isImage(message.data.url) ?
          <img src={message.data.url} width='400px' /> :
          <a href={message.data.url} target="_blank"><h1 className="message-title">{message.data.title}</h1></a>
          } 
          <button type="button" onClick={handleClick} className="button">
              Go to post
          </button>
        </div>
      </div>
    </div>
  : null}</div>
  );
}
