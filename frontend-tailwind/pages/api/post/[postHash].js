import { CONSTANTS } from '../../constants/Constants';

// http://localhost:3000/api/post/QmaEKD9igfwiDNMVufvXTSQ3SDorSna1fXBzhpquYGdZwT

export default async function handler(req, res) {
    const { postHash } = req.query
    const data = await fetch(`${CONSTANTS.server}/post/${postHash}`)
    const response = await data.json()
    res.status(200).json(response)
    console.log(response)
    return response
}