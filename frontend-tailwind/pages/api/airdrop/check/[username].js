import { CONSTANTS } from '../../../../constants/Constants';

// http://localhost:3000/api/airdrop/check/hughjassjess
export default async function handler(req, res) {
    const { username } = req.query.username;
    const data = await fetch(`${CONSTANTS.server}/airdrop/check/${username}?` + new URLSearchParams({
        postthread_username: req.query.postthread_username
    }))
    const response = await data.json()
    res.status(200).json(response)
    console.log(response)
    return response
}