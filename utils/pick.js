import { addWinnerToDatabase } from "../database/winner";

export const LIMIT = 300;
async function pick(name, id) {
    let retweetLimit = LIMIT; // maximum retweets retrieval ammount

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

    if (!randomRetweeter) {
        return { isWinner: false, error: apiJsonResponse.error_message };
    }

    let tweeterHandle = randomRetweeter.handle;
    let winnerID = randomRetweeter.id;
    let timestamp = Date.now();

    let response = await addWinnerToDatabase(id, tweeterHandle, winnerID, timestamp);

    if (response.data) return {
        tweetID: id,
        winnerID: winnerID,
        tweeterHandle: randomRetweeter.handle,
        timestamp: timestamp,
        isWinner: true,
    };
    else return { isWinner: false, error: apiJsonResponse.error_message };
}
export { pick }