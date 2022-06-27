import { CONSTANTS } from '../../../constants/Constants';

// http://localhost:3000/api/user/followers/1337
// http://localhost:3000/api/user/following/1337

export default async function handler(req, res) {
    const params = req.query.params
    if (params.length === 2) {
        const method = params[0]
        const id = params[1]
        const data = await fetch(`${CONSTANTS.server}/user/${method}?` + new URLSearchParams({
            user_msa_id: `${id}`
        }))
        const response = await data.json()
        res.status(200).json(response)
        console.log(response)
        return response
    }
    else res.status(200).json(params)
}