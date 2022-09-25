import { Client } from "twitter-api-sdk";
import { addTokenToDatabase, getMostViableToken } from "../../database/token";

// returns a valid, random retweeter from a list of retweeters
export function getRandomRetweeter(retweeters) {
    let valid = [];
    let randomRetweeter = null;
    for (let i = 0; i < retweeters?.length; i++) {
        if (retweeters[i] && retweeters[i].id && retweeters[i].username) {
            valid.push({
                id: retweeters[i].id,
                handle: retweeters[i].username,
            });

        }
    }
    if (valid.length !== 0) randomRetweeter = valid[Math.floor(Math.random() * valid.length)];
    return randomRetweeter;
}

// returns all the 1. retweeters 2. number of requests it took 3. num of documents it retrieved
export async function getAllRetweetersOfTweetID(token, tweetID, retweetLimit) {

    let data = [];
    let numOfRequests = 0;

    try {
        // create client
        const client = new Client(token);
        const retweeters = client.users.tweetsIdRetweetingUsers(tweetID);

        // collect all retweeters info into data
        // also add number of requests
        for await (const page of retweeters) {
            if (page?.data) {
                data = data.concat(page.data);
                if (data?.length >= retweetLimit) break;
            }
            numOfRequests++;
        }

        return {
            retweeters: data,
            numOfDocuments: data?.length,
            numOfRequests: numOfRequests,
        };
    }
    catch (error) {
        return {
            retweeters: data,
            numOfDocuments: data?.length,
            numOfRequests: numOfRequests,
        };
    }
}
// returns the name of the author for a given tweetID
async function getAuthorNamefromTweetID(token, tweetID) {
    try {
        const client = new Client(token);
        const lookupTweetById = await client.tweets.findTweetById(
            tweetID,
            {
                expansions: ["author_id"],
                "user.fields": ["name"],
            }
        );
        return lookupTweetById?.includes?.users[0]?.name;
    }
    catch (error) {
        return null;
    }
}
// handles the /api/get-random-retweeter/ endpont
export default async function handler(request, response) {

    // if not a post request! No business being here
    if (request.method !== 'POST') {
        response.status(405).json({ error_message: 'Only POST requests allowed', x: x });
        return;
    }

    // get parameters from body if exists.
    let params = request?.body?.params;

    // get necessarytweetID and requesterName and limit from parameters
    let { tweetID, requesterName, retweetLimit } = params;

    // get the token from the database
    let twitterToken = await getMostViableToken();


    let authorName = null;
    // get author name of the given tweetID if there is a viable token
    if (twitterToken?.token) authorName = await getAuthorNamefromTweetID(twitterToken.token, tweetID);


    // if tweet has a author, a requester and they are the same
    let isVerified = authorName && requesterName && (authorName === requesterName);

    // if not verified
    if (isVerified === false) {
        response.json({ error_message: "The specified tweet was not posted by you. Can't pick winner" });
        return;
    }

    //  fetch all retweeters, request count, fetched document count using the method below
    let { retweeters, numOfDocuments, numOfRequests } = await getAllRetweetersOfTweetID(twitterToken.token, tweetID, retweetLimit);
    
    //  generate a random retweeter
    let randomRetweeter = getRandomRetweeter(retweeters);

    // updates the token attr. in database
    await addTokenToDatabase(twitterToken.token, (twitterToken.requests + numOfRequests), (twitterToken.fetched + numOfDocuments));


    // returns, random retweeter
    response.status(200).json({
        requestInfo:
        {
            tweetID,
            requesterName,
        },
        // retweeters: retweeters, // return only for testing purposes (otherwise, chance of api abuse/ longer time for response)
        randomRetweeter: randomRetweeter,
    })
}

