import { CONSTANTS } from '../../../constants/Constants';

// http://localhost:3000/api/user/followers?user_msa_id=1337
// http://localhost:3000/api/user/following?user_msa_id=1337

export default async function handler(req, res) {
    const query = req.query;
    const method = query.follow
    const id = query.user_msa_id
    const data = await fetch(`${CONSTANTS.server}/user/${method}?` + new URLSearchParams({ ...req.query }))
    const response = await data.json()
    res.status(200).json(response)
    console.log(response)
    return response
}