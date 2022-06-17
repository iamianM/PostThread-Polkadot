import { Grid, Form, Input } from 'semantic-ui-react'
import { useState } from 'react'

function CreateMessage() {
  const [status, setStatus] = useState(null)
  const [formMessage, setFormMessage] = useState({})

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
        <div style={{ overflowWrap: 'break-word' }}>{status}</div>
      </Form>
    </Grid.Column>
  )
}

export default CreateMessage
