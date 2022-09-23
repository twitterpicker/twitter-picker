import { addWinnerToDatabase } from "../database/winner";

async function pick(name, id) {
    let retweetLimit = 300; // maximum retweets retrieval ammount
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

    let tweeterHanndle = randomRetweeter.handle;
    let winnerID = randomRetweeter.id;
    let timestamp = Date.now();
    
    let response = await addWinnerToDatabase(id, tweeterHanndle, winnerID, timestamp);
    return randomRetweeter;
}
export { pick }