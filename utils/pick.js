import { addWinnerToDatabase } from "../database/winner";
import { LIMIT } from "./limit";


// picks a winner for the website client
// takes in requester name, and tweetID
async function pick(name, id) {
    let retweetLimit = LIMIT; // maximum retweets retrieval ammount

    // users the internal api, to get a random retweeter for a given tweetID
    
    let apiResponse = await fetch("api/get-random-retweeter", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            params: {
                tweetID: id,
                requesterName: name,
                retweetLimit: retweetLimit,
            },
        }),
    });
    let apiJsonResponse = await apiResponse.json();
    let randomRetweeter = apiJsonResponse.randomRetweeter;

    // if there is no random retweeter
    if (!randomRetweeter) {
        return { isWinner: false, error: apiJsonResponse.error_message };
    }

    // if there is a random retweeter
    // gets tweeterHandle, tweeterAccountID, timespampt
    let tweeterHandle = randomRetweeter.handle;
    let winnerID = randomRetweeter.id;
    let timestamp = Date.now();

    // saves the winner in database, with tweetID, handle, tweeterAccountID, and timestamp
    let response = await addWinnerToDatabase(id, tweeterHandle, winnerID, timestamp);

    // if winner could be saved, return winner
    if (response.data) return {
        tweetID: id,
        winnerID: winnerID,
        tweeterHandle: randomRetweeter.handle,
        timestamp: timestamp,
        isWinner: true,
    };
    // if winner couldn't be saved, return noWinner with error response
    else return { isWinner: false, error: apiJsonResponse.error_message };
}
export { pick }