import { CONSTANTS } from '../../../constants/Constants';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const query = req.query;
        const username = query.username
        const password = query.password
        const profilePic = query.profile_pic
        const data = await fetch(`${CONSTANTS.server}/user/mint?` + new URLSearchParams({
            username: username,
            password: password,
            profile_pic: profilePic,
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