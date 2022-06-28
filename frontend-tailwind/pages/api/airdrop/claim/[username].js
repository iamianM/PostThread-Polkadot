import { CONSTANTS } from '../../../../constants/Constants';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const username = req.query.username;
        const data = await fetch(`${CONSTANTS.server}/airdrop/claim/${username}?` + new URLSearchParams({ ...req.query }), {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        })
        res.status(200).json(await data.json())
    }
}