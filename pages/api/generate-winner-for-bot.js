import { Client } from "twitter-api-sdk";
import { addTokenToDatabase, getMostViableToken } from "../../database/token";
import { addWinnerToDatabase } from "../../database/winner";
import { getAllRetweetersOfTweetID, getRandomRetweeter } from "./get-random-retweeter";


async function getAuthorfromTweetID(token, tweetID) {
    try {
        const client = new Client(token);
        const lookupTweetById = await client.tweets.findTweetById(
            tweetID,
            {
                expansions: ["author_id"],
                "user.fields": ["name"],
            }
        );
        return lookupTweetById?.includes?.users[0];
    }
    catch (error) {
        return null;
    }
}

const retweetLimit = 300;
export default async function handler(request, response) {

    // if not a post request! No business being here, fuck off punk.
    if (request.method !== 'POST') {
        response.status(405).json({ error_message: 'Only POST requests allowed' });
        return;
    }

    // get parameters from body if exists.
    let params = request?.body?.params;

    // get tweetID
    let { requesterID, tweetID } = params;

    if (!tweetID || !requesterID) {
        response.json({ message: "invalid query!" });
        return;
    }

    let twitterToken = await getMostViableToken();

    let author = await getAuthorfromTweetID(twitterToken, tweetID);

    //  fetch all retweeters, request count, fetched document count using the method below
    let { retweeters, numOfDocuments, numOfRequests } = await getAllRetweetersOfTweetID(twitterToken.token, tweetID, retweetLimit);
    let randomRetweeter = getRandomRetweeter(retweeters);

    await addTokenToDatabase(twitterToken.token, (twitterToken.requests + numOfRequests), (twitterToken.fetched + numOfDocuments));

    
    let response = await addWinnerToDatabase(tweetID, randomRetweeter.handle, randomRetweeter.id, Date.now());

    if (randomRetweeter && response.data) {
        let winner = randomRetweeter;
        let message = "A winner was selected for the given tweet. Winner is : @" + winner.handle + JSON.stringify(author) +
            "\nTo visit the winner, go to: https://twitter.com/" + winner.handle + ".\n";
        response.json({ message: message });
        return;
    }
    else {
        response.json({ message: "No winner found for the given tweet link!" });
        return;
    }
}


// et voila