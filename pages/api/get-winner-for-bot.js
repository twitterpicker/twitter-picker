
import { getWinnerFromDatabase } from "../../database/winner";



export default async function handler(request, response) {

    // if not a post request! No business being here
    if (request.method !== 'POST') {
        response.status(405).json({ error_message: 'Only POST requests allowed' });
        return;
    }

    // get parameters from body if exists.
    let params = request?.body?.params;

    // get tweetID
    let { tweetID } = params;

    // if there is no tweet ID, can't return any result
    if (!tweetID) {
        response.json({ message: "invalid query!" });
        return;
    }

    // get winner from database with tweetID
    let databaseResponse = await getWinnerFromDatabase(tweetID);

    //if there is a winner
    if (databaseResponse.data && databaseResponse.data.length !== 0) {
        let winner = databaseResponse.data[0];
        let message = "The winner for the given tweet giveaway is : @" + winner.tweeterHandle + 
        "\nTo verify, go to: http://twitter-picker.netlify.app/" + tweetID + "." +
        "\nTo visit the winner, go to: https://twitter.com/" + winner.tweeterHandle + ".\n";
        response.json({ message: message });
        return;
    }
    // if there is no winner stored in DB
    else {
        response.json({ message: "No winner found for the given tweet link!" });
        return;
    }
}


