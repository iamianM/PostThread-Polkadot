import { Grid, Form, Input } from 'semantic-ui-react'
import { useState } from 'react'
import { TxButton } from '../../substrate-lib/components'

function CreateMessage() {
  const [status, setStatus] = useState(null)
  const [formMessage, setFormMessage] = useState({})
  const schemaId = 1
  const msaId = 1

  const onChange = (_, data) => {
    setFormMessage(prev => ({ ...prev, [data.state]: data.value }))
    console.log((content))
  }

  const { content } = formMessage

  return (
    <Grid.Column width={8}>
      <h1>Create new message </h1>
      <Form>
        <Form.Field>
          <Input label="Subreddit" type="text" placeholder="Message" state="content" onChange={onChange} value={content} />
        </Form.Field>
        {/* <Form.Field>
          <Input label="Author" type="text" placeholder="Me" state="content" onChange={onChange} value={content} />
        </Form.Field>
        <Form.Field>
          <Input label="Title" type="text" placeholder="What are some good ice breaker questions?" state="content" onChange={onChange} value={content} />
        </Form.Field>
        <Form.Field>
          <Input label="Text" type="text" placeholder="What are some good ice breaker questions?" state="content" onChange={onChange} value={content} />
        </Form.Field>
        <Form.Field>
          <Input label="Url" type="text" placeholder="https://www.reddit.com" state="content" onChange={onChange} value={content} />
        </Form.Field>
        <Form.Field>
          <Input label="Is NSFW" type="text" placeholder="false" state="content" onChange={onChange} value={content} />
        </Form.Field>
        <Form.Field>
          <Input label="dsvs" type="text" placeholder="dsvs" state="content" onChange={onChange} value={content} />
        </Form.Field> */}
        <Form.Field style={{ textAlign: 'center' }}>
          <TxButton
            label="Submit"
            type="SIGNED-TX"
            setStatus={setStatus}
            attrs={{
              palletRpc: 'messages',
              callable: 'add',
              inputParams: [msaId, schemaId, content],
              paramFields: [true, true, true],
            }}
          />
        </Form.Field>
        <div style={{ overflowWrap: 'break-word' }}>{status}</div>
      </Form>
    </Grid.Column>
  )
}



export default CreateMessage
