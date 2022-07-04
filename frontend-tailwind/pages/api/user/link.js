import { CONSTANTS } from '../../../constants/Constants';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const data = await fetch(`${CONSTANTS.server}/user/link?` + new URLSearchParams({
            ...req.query
        }), {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        })
        res.status(200).json(await data.json())
    }
}