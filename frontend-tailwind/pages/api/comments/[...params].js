import { CONSTANTS } from '../../constants/Constants';

export default async function handler(req, res) {
    const params = req.query.params
    if (params.length === 3) {
        const postHash = params[0]
        const pageNumber = params[1]
        const numberOfComments = params[2]
        const data = await fetch(`${CONSTANTS.server}/comments/${postHash}/${pageNumber}/${numberOfComments}`)
        const response = await data.json()
        res.status(200).json(response)
        console.log(response)
        return response
    }
    else res.status(200).json(params)
}