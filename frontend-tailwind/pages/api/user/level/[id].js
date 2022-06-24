import { CONSTANTS } from '../../../../constants/Constants';

// http://localhost:3000/api/user/level/1337

export default async function handler(req, res) {
    const { id } = req.query
    const data = await fetch(`${CONSTANTS.server}/user/level?` + new URLSearchParams({
        user_msa_id: `${id}`
    }))
    const response = await data.json()
    res.status(200).json(response)
    console.log(response)
    return response
}