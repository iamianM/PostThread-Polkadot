
import CreatePost from "./components/frontpage/CreatePost";
import ListMessages from "./components/frontpage/ListMessages";
import CreateMessage from "./components/submit/CreateMessage";
import CreateMessageHTML from "./components/submit/CreateMessageHTML";
import AccountSelector from "./components/navbar/AccountSelector";

import { BrowserRouter, Route, Routes } from "react-router-dom";
import { createRef } from "react";

import './App.css';


function Main(props) {
  const contextRef = createRef();
  return (
    <div ref={contextRef}>
      <AccountSelector />
      <div className="lower">
        {props.name == "" ? (
          [<CreatePost />,
          <ListMessages />]
        ) : props.name == "submit" ? (
          [<CreateMessage />, <CreateMessageHTML />]
        ) : (
          ""
        )}
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Main name="" />} />
        <Route path="/user" element={<Main name="user" />} />
        <Route path="/submit" element={<Main name="submit" />} />
        <Route path="/testing" element={<Main name="testing" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
