import { CONSTANTS } from '../../../../constants/Constants';

// http://localhost:3000/api/uuser/get/followers?user_msa_id=382&user_msa_id_to_check=694

export default async function handler(req, res) {
    const query = req.query;
    const method = query.follow
    const id = query.user_msa_id
    const data = await fetch(`${CONSTANTS.server}/user/get/${method}?` + new URLSearchParams({ ...req.query }))
    const response = await data.json()
    res.status(200).json(response)
    console.log(response)
    return response
}