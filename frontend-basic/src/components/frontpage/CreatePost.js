import React from "react";
import "./css/CreatePost.css";
import { useNavigate  } from "react-router-dom";

export default function CreatePost() {
    const navigate = useNavigate();

    function handleClick() {
        navigate("/submit");
    }
    return (
        <div className="container-center-horizontal">
        <div className="creat-post screen">
            <div className="input-data">
            <p className="lets-share-what-going-on-your-mind">
                Lets share what going on your mind...
            </p>
            </div>
            <div className="button">
                <button type="button" onClick={handleClick} className="create-post">
                    Create Post
                </button>
            </div>
        </div>
        </div>
    );
}
