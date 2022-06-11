import { useHistory } from "react-router-dom";
import React from "react";

function Home(props) {
  const { className } = props;

  return (
    <div className={`home ${className || ""}`}>
      <img className="home-2" src="home-2.svg" />
    </div>
  );
}

export default function PagesBar(props) {
  function PageButton() {
    const history = useHistory();

    function handleClick() {
      history.push("/" + props.name);
    }

    return (
      <button type="button" onClick={handleClick}>
        props.name
      </button>
    );
  }

  return (
    <div className="icons">
      <PageButton name="User" />
      <PageButton name />
      <PageButton name="icons-item" />
      <PageButton name="icons-item" />
    </div>
  );
}
