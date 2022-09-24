
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

    let databaseResponse = await getWinnerFromDatabase(tweetID);
    if (databaseResponse.data && databaseResponse.data.length !== 0) {
        let winner = databaseResponse.data[0];

        let message = "The winner for the given tweet giveaway is : @$" + winner.tweeterHandle + 
        "\nTo visit the winner, go to: https://twitter.com/" + winner.tweeterHandle + ".\n";
        response.json({ message: message });
        return;
    }
    else {
        response.json({ message: "No winner found for the given tweet link!" });
        return;
    }
}


// et voila