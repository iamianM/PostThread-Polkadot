import { CONSTANTS } from '../../../constants/Constants';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const query = req.query;
        const accountType = query.account_type
        const accountValue = query.account_value
        const id = query.user_msa_id
        const data = await fetch(`${CONSTANTS.server}/user/link?` + new URLSearchParams({
            account_type: accountType,
            account_value: accountValue,
            user_msa_id: id,
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