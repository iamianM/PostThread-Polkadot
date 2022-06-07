import { Grid, Form, Input } from 'semantic-ui-react'
import { useState } from 'react'
import { TxButton } from '../../substrate-lib/components'

function CreateBlogPost() {
  const [status, setStatus] = useState(null)
  const [formState, setFormState] = useState({ content: '' })

  const onChange = (_, data) =>
    setFormState(prev => ({ ...prev, [data.state]: data.value }))

  const { content } = formState

  return (
    <Grid.Column width={8}>
      <h1>Create Blog Post</h1>
      <Form>
        <Form.Field>
          <Input label="Content" type="text" placeholder="type here..." state="content" onChange={onChange} value={content} />
        </Form.Field>
        <Form.Field style={{ textAlign: 'center' }}>
          <TxButton
            label="Submit"
            type="SIGNED-TX"
            setStatus={setStatus}
            attrs={{
              palletRpc: 'blogchain',
              callable: 'createBlogPost',
              inputParams: [content],
              paramFields: [true],
            }}
          />
        </Form.Field>
        <div style={{ overflowWrap: 'break-word' }}>{status}</div>
      </Form>
    </Grid.Column>
  )
}

export default CreateBlogPost
