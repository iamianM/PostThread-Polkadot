import { CONSTANTS } from "../../../constants/Constants";

// http://localhost:3000/api/posts/1/10

export default async function handler(req, res) {
  let headers = new Headers();
  headers.append("Access-Control-Allow-Origin", "*");
  const params = req.query.params;
  if (params.length === 3) {
    const type = params[0];
    const iter = params[1];
    const numberOfMessages = params[2];
    const data = await fetch(
      `${CONSTANTS.server}/announcement/${type}/${iter}/${numberOfMessages}?` +
        new URLSearchParams({ ...req.query }),
      { headers: headers }
    );
    const response = await data.json();
    res.status(200).json(response);
    console.log(response);
    return response;
  } else res.status(200).json(params);
}
