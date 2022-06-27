import { CONSTANTS } from '../../../../constants/Constants';

// http://localhost:3000/api/user/interact/follow?user_msa_id=1&user_msa_id_to_interact_with=2
// http://localhost:3000/api/user/interact/unfollow?user_msa_id=1&user_msa_id_to_interact_with=2

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { action } = req.params
        const query = req.query;
        const data = await fetch(`${CONSTANTS.server}/${action}?` + new URLSearchParams({
            user_msa_id: `${query.user_msa_id}`,
            user_msa_id_to_interact_with: `${query.user_msa_id_to_interact_with}`,
        }), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        res.status(200).json(await data.json())
    }
}