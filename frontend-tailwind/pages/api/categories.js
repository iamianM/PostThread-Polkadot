import { CONSTANTS } from '../../constants/Constants';

export default async function handler(req, res) {
    const data = await fetch(`${CONSTANTS.server}/categories`)
    const response = await data.json()
    res.status(200).json(response)
    console.log(response)
    return response
}