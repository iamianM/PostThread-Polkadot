import { CONSTANTS } from '../../../../constants/Constants';

// http://localhost:3000/api/user/data?username=Charlie

export default async function handler(req, res) {
    const data = await fetch(`${CONSTANTS.server}/user/data?` + { ...req.query })
    const response = await data.json()
    res.status(200).json(response)
    console.log(response)
    return response
}