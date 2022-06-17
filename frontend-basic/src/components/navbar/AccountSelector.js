import React, { useState, useEffect } from "react";
import logo from "../../images/postthreadicon.png";
import DarkMode from "./DarkMode";

import {
  Menu,
  Button,
  Dropdown,
  Container,
  Icon,
  Image,
  Label,
} from "semantic-ui-react";

import "./css/AccountSelector.css";

function Main(props) {
  return (
    <div className="menu">
      <Image src={logo} size="tiny" />
      {DarkMode()}
    </div>
  );
}

export default function AccountSelector(props) {
  return <Main {...props} />;
}
