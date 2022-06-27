import { CONSTANTS } from '../../../../constants/Constants';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const username = req.query.username;
        const postthread_username = req.query.postthread_username
        const data = await fetch(`${CONSTANTS.server}/airdrop/claim/${username}?` + new URLSearchParams({
            postthread_username: postthread_username,
            wait_for_inclusion: false,
            wait_for_finalization: false
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