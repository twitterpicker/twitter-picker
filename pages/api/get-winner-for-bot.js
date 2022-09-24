
import { getWinnerFromDatabase } from "../../database/winner";



export default async function handler(request, response) {

    // if not a post request! No business being here, fuck off punk.
    if (request.method !== 'POST') {
        response.status(405).json({ error_message: 'Only POST requests allowed' });
        return;
    }

    // get parameters from body if exists.
    let params = request?.body?.params;

    // get tweetID
    let { tweetID } = params;

    if (!tweetID) {
        response.json({ message: "invalid query!" });
        return;
    }

    let response = await getWinnerFromDatabase(tweetID);
    if (response.data && response.data.length !== 0) {
        let winner = response.data[0];
        let message = JSON.stringify(winner);
        response.json({ message: message });
        return;
    }
    else {
        response.json({ message: "No winner found for the given tweet link!" });
        return;
    }
}


// et voila