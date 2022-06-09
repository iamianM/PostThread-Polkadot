import React, { useEffect, useState } from "react"
import { TxButton } from '../../substrate-lib/components'
import { Grid } from 'semantic-ui-react'


function CreateMessageHTML() {

    const [status, setStatus] = useState(null)
    const [formMessage, setFormMessage] = useState({ content: '' })
    const [subreddit, setSubreddit] = useState("")
    const [author, setAuthor] = useState("")
    const [title, setTitle] = useState("")
    const [text, setText] = useState("")
    const [url, setUrl] = useState("")
    const [isNsfw, setIsNsfw] = useState("")
    const schemaId = 4
    const msaId = 1

    const { content } = formMessage

    useEffect(() => {
        setFormMessage({ content: subreddit + "," + author + "," + title + "," + text + "," + url + "," + isNsfw })
        if (content === ",,,,,") setFormMessage({ content: '' })
        console.log("content: " + content)
    }, [subreddit, author, title, text, url, isNsfw])

    return (
        <Grid.Column width={8}>
            <h1>Create new message </h1>
            <div>
                <form>
                    <label>Subreddit:
                        <input type="text" id="subreddit" name="subreddit" required={true} onChange={(e) => setSubreddit(e.target.value)} />
                    </label>
                    <br></br>
                    <label>Author:
                        <input type="text" id="author" name="author" required={true} onChange={(e) => setAuthor(e.target.value)} />
                    </label>
                    <br></br>
                    <label>Title:
                        <input type="text" id="title" name="title" required={true} onChange={(e) => setTitle(e.target.value)} />
                    </label>
                    <br></br>
                    <label>Text:
                        <input type="text" id="text" name="text" required={true} onChange={(e) => setText(e.target.value)} />
                    </label>
                    <br></br>
                    <label>Url:
                        <input type="text" id="url" name="url" required={true} onChange={(e) => setUrl(e.target.value)} />
                    </label>
                    <br></br>
                    <label>Is NSFW:
                        <input type="text" id="is_nsfw" name="is_nsfw" required={true} onChange={(e) => setIsNsfw(e.target.value)} />
                    </label>
                    <br></br>
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
                    <div style={{ overflowWrap: 'break-word' }}>{status}</div>
                </form>
            </div>
        </Grid.Column>
    )
}

export default CreateMessageHTML
