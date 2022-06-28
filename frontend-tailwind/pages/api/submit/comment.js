import { CONSTANTS } from '../../../constants/Constants';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const commentToMint = req.body;
        const data = await fetch(`${CONSTANTS.server}/submit/comment?` +
            new URLSearchParams({ ...req.query })
            , {
                method: 'POST',
                body: JSON.stringify(commentToMint),
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            })
        res.status(200).json(await data.json())
    }
}