import { auth, Client } from "twitter-api-sdk";
import { addTokenToDatabase, getMostViableToken } from "../../database/token";
import { addWinnerToDatabase } from "../../database/winner";
import { LIMIT } from "../../utils/limit";
import { getAllRetweetersOfTweetID, getRandomRetweeter } from "./get-random-retweeter";


// it returns a tweetID for a given tweet, using a bearer token
async function getMetaDatafromTweetID(token, tweetID) {
    try {
        const client = new Client(token);
        const lookupTweetById = await client.tweets.findTweetById(
            tweetID,
            {
                expansions: ["author_id"],
                "user.fields": ["name"],
                "tweet.fields": ["public_metrics"]
            }
        );
        let authorID = lookupTweetById?.includes?.users[0]?.id;
        let retweetCount = lookupTweetById?.data?.public_metrics?.retweet_count;

        return {
            authorID,
            retweetCount,
        }
    }
    catch (error) {
        return null;
    }
}
// the max-number of retweeters that will be returned
const retweetLimit = LIMIT;


// util : https://meyerweb.com/eric/tools/dencoder/
const composeTweetLink = (tweetID, winnerHandle) => {
    let text = `The%20giveaway%20was%20for%20the%20tweeet%20%3A%20https%3A%2F%2Ftwitter.com%2Fuser%2Fstatus%2F${tweetID}%0AThe%20winner%20was%20%40${winnerHandle}%0AVisit%20the%20winner%20at%20https%3A%2F%2Ftwitter.com%2F${winnerHandle}%0Averify%20the%20winner%20at%20http%3A%2F%2Ftwitter-picker.netlify.app%2Fverify%2F${tweetID}`;
    // let text = `The%20giveaway%20was%20for%20the%20tweeet%20%3A%20https%3A%2F%2Ftwitter.com%2Fuser%2Fstatus%2F${tweetID}%0AThe%20winner%20was%20%40${winnerHandle}%0AVisit%20the%20winner%20at%20https%3A%2F%2Ftwitter.com%2F${winnerHandle}`;
    // let text = `The%20giveaway%20was%20for%20the%20tweeet%20%3A%20https%3A%2F%2Ftwitter.com%2Fuser%2Fstatus%2F%24%7BtweetID%7D%0AThe%20winner%20was%20%40%24%7BwinnerHandle%7D%0AVisit%20the%20winner%20at%20https%3A%2F%2Ftwitter.com%2F%24%7BwinnerHandle%7D%0Averify%20the%20winner%20at%20http%3A%2F%2Ftwitter-picker.netlify.app%2Fverify%2F%24%7BtweetID%7D`;
    let link = `https://twitter.com/intent/tweet?in_reply_to=${tweetID}&text=${text}`;
    return link;
  
  }
// handles /api/generate-winner-for-bot endpoint
export default async function handler(request, response) {

    // if not a post request! No business being here!
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

    // gets the most viable token to be used, (from the DB)
    let twitterToken = await getMostViableToken();

    // gets the author for a given tweet
    let authorID = null;
    let retweetCount = 0;

    if (twitterToken?.token) 
    {
        const metaData =  await getMetaDatafromTweetID(twitterToken.token, tweetID);
        authorID = metaData.authorID;
        retweetCount = metaData.retweetCount;
    }


    // if there is an author, there is a requester, and they both are the same!
    let isVerified = authorID && requesterID && (authorID === requesterID);

    // if not verified, return unauthenticated response
    if (!isVerified) {
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
        let message = retweetCount + " retweets loaded." + 
            "\nA winner was selected for the given tweet. Winner is : @" + winner.handle +
            "\nTo visit the winner, go to: https://twitter.com/" + winner.handle + "." +
            "\nTo verify, go to: http://twitter-picker.netlify.app/verify/" + tweetID + "." +
            "\nTo tweet about the result, use: " + composeTweetLink(tweetID, winner.handle) + ".\n";
        response.json({ message: message });
        return;
    }
    // if we couldn't generate or we couldn't save the winner
    else {
        response.json({ message: "No winner could be generated for the given tweet link!" });
        return;
    }
}


