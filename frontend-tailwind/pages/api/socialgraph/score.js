import { CONSTANTS } from '../../../constants/Constants';

export default async function handler(req, res) {
    const data = await fetch(`${CONSTANTS.server}/socialgraph/score?` + new URLSearchParams({
        user_msa_id: `${req.query.user_msa_id}`
    }))
    const response = await data.json()
    res.status(200).json(response)
    console.log(response)
    return response
}