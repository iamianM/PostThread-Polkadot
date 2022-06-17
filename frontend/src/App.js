import React from "react";
import { createRef } from "react";
import {
  // Container,
  Dimmer,
  Loader,
  Grid,
  Sticky,
  Message,
} from "semantic-ui-react";
import "semantic-ui-css/semantic.min.css";

import { SubstrateContextProvider } from "./substrate-lib";
import { useSubstrateState } from "./substrate-lib";

import { DeveloperConsole } from "./substrate-lib/components";

import AccountSelector from "./AccountSelector";
// import Balances from './Balances'
// import BlockNumber from './BlockNumber'
// import Events from './Events'
// import Interactor from './Interactor'
// import Metadata from './Metadata'
// import NodeInfo from './NodeInfo'
// import TemplateModule from './TemplateModule'
// import Blogchain from './Blogchain'
import CreatePost from "./postthread/components/CreatePost";
import ListMessages from "./postthread/components/ListMessages";
import CreateMessage from "./postthread/components/CreateMessage";
import CreateMsa from "./postthread/components/CreateMsa";
import RetrieveMsa from "./postthread/components/RetrieveMsa";
import CreateSchema from "./postthread/components/CreateSchema";
import CreateMessageHTML from "./postthread/components/CreateMessageHTML";

import { BrowserRouter, Route, Routes } from "react-router-dom";

import "./css/App.css";

function Main(props) {
  const { apiState, apiError, keyringState, currentAccount } =
    useSubstrateState();

  const loader = (text) => (
    <Dimmer active>
      <Loader size="small">{text}</Loader>
    </Dimmer>
  );

  const message = (errObj) => (
    <Grid centered columns={2} padded>
      <Grid.Column>
        <Message
          negative
          compact
          floating
          header="Error Connecting to Substrate"
          content={`Connection to websocket '${errObj.target.url}' failed.`}
        />
      </Grid.Column>
    </Grid>
  );

  if (apiState === "ERROR") return message(apiError);
  else if (apiState !== "READY") return loader("Connecting to Substrate");

  if (keyringState !== "READY") {
    return loader(
      "Loading accounts (please review any extension's authorization)"
    );
  }

  const contextRef = createRef();

  return (
    <div ref={contextRef}>
      <Sticky context={contextRef}>
        <AccountSelector />
      </Sticky>
      <div className="lower">
        {props.name === "" ? (
          [<CreatePost />,
          <ListMessages />]
        ) : props.name === "submit" ? (
          [<CreateMessage />, <CreateMessageHTML />]
        ) : props.name === "testing" ? (
          [currentAccount && <RetrieveMsa />, <CreateMsa />, <CreateSchema />]
        ) : (
          ""
        )}
        <DeveloperConsole />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <SubstrateContextProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Main name="" />} />
          <Route path="/user" element={<Main name="user" />} />
          <Route path="/submit" element={<Main name="submit" />} />
          <Route path="/testing" element={<Main name="testing" />} />
        </Routes>
      </BrowserRouter>
    </SubstrateContextProvider>
  );
}
