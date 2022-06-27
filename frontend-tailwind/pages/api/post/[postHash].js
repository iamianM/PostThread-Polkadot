import { CONSTANTS } from '../../../constants/Constants';

// http://localhost:3000/api/post/QmaEKD9igfwiDNMVufvXTSQ3SDorSna1fXBzhpquYGdZwT

export default async function handler(req, res) {
    let headers = new Headers();
    headers.append('Access-Control-Allow-Origin', '*');
    const { postHash } = req.query
    const data = await fetch(`${CONSTANTS.server}/post/${postHash}`, { headers: headers })
    const response = await data.json()
    res.status(200).json(response)
    console.log(response)
    console.log(postHash)
    return response
}