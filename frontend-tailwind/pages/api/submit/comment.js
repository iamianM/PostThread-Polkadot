import { CONSTANTS } from '../../../constants/Constants';

// http://localhost:3000/api/user/submit/

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const commentToMint = req.body;
        const query = req.query;
        const data = await fetch(`${CONSTANTS.server}/submit/comment?` + new URLSearchParams({
            user_msa_id: `${query.user_msa_id}`,
            wait_for_inclusion: `${query.wait_for_inclusion}`,
            wait_for_finalization: `${query.wait_for_finalization}`
        }), {
            method: 'POST',
            body: JSON.stringify({ commentToMint }),
            headers: {
                'Content-Type': 'application/json'
            }
        })
        res.status(200).json(await data.json())
    }
}