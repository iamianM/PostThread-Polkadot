import React from "react";
import "./css/Message.css";
// import { LinkPreview } from '@dhaiwat10/react-link-preview';
// import linkPreviewGenerator from "link-preview-generator";

export default function Message({ message }) {
    return (
        <div className="message-container">
            <div className="sub-message-container">
            <h1 className="message-title">{message.title}</h1>
            <p className="message-body">{message.body}</p>
            {/* <Link href={`/posts/${encodeURIComponent(message.id)}`}>
                <a>Comments</a>
            </Link> */}
        </div></div>
    )
}
