import { auth, Client } from "twitter-api-sdk";
import { addTokenToDatabase, getMostViableToken } from "../../database/token";
import { addWinnerToDatabase } from "../../database/winner";
import { LIMIT } from "../../utils/limit";
import { getAllRetweetersOfTweetID, getRandomRetweeter } from "./get-random-retweeter";


// it returns a tweetID for a given tweet, using a bearer token
async function getAuthorIdfromTweetID(token, tweetID) {
    try {
        const client = new Client(token);
        const lookupTweetById = await client.tweets.findTweetById(
            tweetID,
            {
                expansions: ["author_id"],
                "user.fields": ["name"],
            }
        );
        return lookupTweetById?.includes?.users[0]?.id;
    }
    catch (error) {
        return null;
    }
}
// the max-number of retweeters that will be returned
const retweetLimit = LIMIT;

// handles /api/generate-winner-for-bot endpoint
export default async function handler(request, response) {

    // if not a post request! No business being here!
    if (request.method !== 'POST') {
        response.status(405).json({ error_message: 'Only POST requests allowed'});
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

    // gets the most viable token to be used, (from the DB)
    let twitterToken = await getMostViableToken();

    // gets the author for a given tweet
    let authorID = await getAuthorIdfromTweetID(twitterToken.token, tweetID);

    // if there is an author, there is a requester, and they both are the same!
    let isVerified = authorID && requesterID && (authorID === requesterID);

    // if not verified, return unauthenticated response
    if(!isVerified)
    {
        response.json({ message: "The given tweet was not authored by you. Can't select winner!" });
        return;
    }

    //  fetch all retweeters, request count, fetched document count using the method below
    let { retweeters, numOfDocuments, numOfRequests } = await getAllRetweetersOfTweetID(twitterToken.token, tweetID, retweetLimit);

    // generate a random retweeter
    let randomRetweeter = getRandomRetweeter(retweeters);

    // update the fetched and requests attr. for the used token
    await addTokenToDatabase(twitterToken.token, (twitterToken.requests + numOfRequests), (twitterToken.fetched + numOfDocuments));

    // add the winner to the database
    let databaseResponse = await addWinnerToDatabase(tweetID, randomRetweeter.handle, randomRetweeter.id, Date.now());

    // if we generated and saved the winner
    if (randomRetweeter && databaseResponse.data) {
        let winner = randomRetweeter;
        let message =  "A winner was selected for the given tweet. Winner is : @" + winner.handle +
            "\nTo visit the winner, go to: https://twitter.com/" + winner.handle + ".\n";
        response.json({ message: message });
        return;
    }
    // if we couldn't generate or we couldn't save the winner
    else {
        response.json({ message: "No winner could be generated for the given tweet link!" });
        return;
    }
}


