
import CreatePost from "./components/frontpage/CreatePost";
import ListMessages from "./components/frontpage/ListMessages";
import CreateMessage from "./components/submit/CreateMessage";
import CreateMessageHTML from "./components/submit/CreateMessageHTML";
import AccountSelector from "./components/navbar/AccountSelector";
import PostPage from "./components/postpage/PostPage";

import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { createRef } from "react";

import './App.css';

function App() {
  return (
    <Router>
      <AccountSelector />
      <div className="lower">
        <Routes>
          <Route path="/" element={[<CreatePost />, <ListMessages />]}/>
          <Route path="/post/:postHash?" component={PostPage}/>
          <Route path="/submit" element={[<CreateMessage />, <CreateMessageHTML />]}/>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
