import React from 'react'
import { createRef } from 'react'
import {
  Container,
  Dimmer,
  Loader,
  Grid,
  Sticky,
  Message,
} from 'semantic-ui-react'
import 'semantic-ui-css/semantic.min.css'

import { SubstrateContextProvider } from './substrate-lib'
import { useSubstrateState } from './substrate-lib'

import { DeveloperConsole } from './substrate-lib/components'

import AccountSelector from './AccountSelector'
// import Balances from './Balances'
// import BlockNumber from './BlockNumber'
// import Events from './Events'
// import Interactor from './Interactor'
// import Metadata from './Metadata'
// import NodeInfo from './NodeInfo'
// import TemplateModule from './TemplateModule'
// import Blogchain from './Blogchain'
import ListMessages from './postthread/components/ListMessages'
import CreateMessage from './postthread/components/CreateMessage'
import CreateMsa from './postthread/components/CreateMsa'
import RetrieveMsa from './postthread/components/RetrieveMsa'
import CreateSchema from './postthread/components/CreateSchema'

function Main() {
  const { apiState, apiError, keyringState, currentAccount } = useSubstrateState()

  const loader = text => (
    <Dimmer active>
      <Loader size="small">{text}</Loader>
    </Dimmer>
  )

  const message = errObj => (
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
  )

  if (apiState === 'ERROR') return message(apiError)
  else if (apiState !== 'READY') return loader('Connecting to Substrate')

  if (keyringState !== 'READY') {
    return loader(
      "Loading accounts (please review any extension's authorization)"
    )
  }

  const contextRef = createRef()

  // return (
  //   <div ref={contextRef}>
  //     <Sticky context={contextRef}>
  //       <AccountSelector />
  //     </Sticky>
  //     <Container>
  //       <Grid stackable columns="equal">
  //         <Grid.Row stretched>
  //           <NodeInfo />
  //           <Metadata />
  //           <BlockNumber />
  //           <BlockNumber finalized />
  //         </Grid.Row>
  //         <Grid.Row>
  //           <Blogchain />
  //         </Grid.Row>
  //         <Grid.Row stretched>
  //           <Balances />
  //         </Grid.Row>
  //         <Grid.Row>
  //           <Interactor />
  //           <Events />
  //         </Grid.Row>
  //         <Grid.Row>
  //           <TemplateModule />
  //         </Grid.Row>
  //       </Grid>
  //     </Container>
  //     <DeveloperConsole />
  //   </div>
  // )

  return (
    <div ref={contextRef}>
      <Sticky context={contextRef}>
        <AccountSelector />
      </Sticky>
      <Container>
        <Grid divided='vertically'>
          <Grid.Row columns={2}>
            <Grid.Column>
              <ListMessages />
            </Grid.Column>
            <Grid.Column>
              <Grid.Row>
                <CreateMessage />
              </Grid.Row>
              <Grid.Row>
                <CreateMsa />
              </Grid.Row>
              <Grid.Row>
                {currentAccount && <RetrieveMsa />}
              </Grid.Row>
              <Grid.Row>
                <CreateSchema />
              </Grid.Row>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Container>
      <DeveloperConsole />
    </div>
  )

}

export default function App() {
  return (
    <SubstrateContextProvider>
      <Main />
    </SubstrateContextProvider>
  )
}
