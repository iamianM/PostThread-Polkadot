import { CONSTANTS } from '../../constants/Constants';

// http://localhost:3000/api/posts/1/10

export default async function handler(req, res) {
    const params = req.query.params
    if (params.length === 2) {
        const iter = params[0]
        const numberOfMessages = params[1]
        const data = await fetch(`${CONSTANTS.server}/posts/${iter}/${numberOfMessages}`)
        const response = await data.json()
        res.status(200).json(response)
        console.log(response)
        return response
    }
    else res.status(200).json(params)
}