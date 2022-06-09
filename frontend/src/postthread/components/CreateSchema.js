import { Grid, Form, Input } from 'semantic-ui-react'
import { useState } from 'react'
import { TxButton } from '../../substrate-lib/components'


export default function CreateSchema() {
    const [status, setStatus] = useState(null)
    const [formState, setFormState] = useState({ schema: '' })

    const onChange = (_, data) =>
        setFormState(prev => ({ ...prev, [data.state]: data.value }))

    const { content } = formState

    return (
        <Grid.Column width={8}>
            <h1>Create schema </h1>
            <Form>
                <Form.Field>
                    <Input label="Schema" type="text" placeholder="attr1,attr2,attr3..." state="content" onChange={onChange} value={content} />
                </Form.Field>
                <Form.Field style={{ textAlign: 'center' }}>
                    <TxButton
                        label="Submit"
                        type="SIGNED-TX"
                        setStatus={setStatus}
                        attrs={{
                            palletRpc: 'schemas',
                            callable: 'registerSchema',
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
