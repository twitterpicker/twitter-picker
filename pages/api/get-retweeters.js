import { Client } from "twitter-api-sdk";

async function getAllRetweetersOfTweetID(token, tweetID) {
    try {
        const client = new Client(token);
        let data = [];
        let numOfRequests = 0;
        const retweeters = client.users.tweetsIdRetweetingUsers(tweetID);

        for await (const page of retweeters) {
            data = data.concat(page.data);
            numOfRequests++;
        }

        return {
            retweeters: data,
            numOfDocuments: data?.length,
            numOfRequests: numOfRequests,
        };
    }
    catch (error) {
        return null;
    }
}

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
        console.log("error");
        return null;
    }
}

export default async function handler(request, response) {

    // if not a post request! No business being here, fuck off punk.
    if (request.method !== 'POST') {
        response.status(405).json({ error_message: 'Only POST requests allowed' });
        return;
    }

    // get parameters from body if exists.
    let params = request?.body?.params;

    // get necessary token, tweetID and requesterName from parameters
    let { twitterToken, tweetID, requesterName } = params;


    // get author of the given tweetID
    let authorName = await getAuthorNamefromTweetID(twitterToken, tweetID);

    // if 
    // - the tweet is valid,
    // - author ID is valid, 
    // - requester name is valid 
    // - author and requester are same
    // * verify the request
    let isVerified = authorName && requesterName && (authorName === requesterName);

    // if not verified
    if (isVerified === true) {
        response.status(400).json({ method: request.body, error_message: 'unauthorized user credential' });
        return;
    }

    let data = await getAllRetweetersOfTweetID(twitterToken, tweetID);
    //  fetch all retweeters, request count, fetched tweet count and a winner using the method below
    //  return response of made of the fetched values





    response.status(200).json({
        requestInfo:
        {
            twitterToken,
            tweetID,
            requesterName,
        },
        data: data,
    })
}


// et voila