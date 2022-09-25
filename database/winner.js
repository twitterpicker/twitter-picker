import { supabase } from "./client";

// adds/updates a winner to database (used after generating winner)
async function addWinnerToDatabase(tweetID, tweeterHandle, winnerID, timestamp) {
    const response = await supabase.from('winners').upsert([{
        tweetID: tweetID,
        tweeterHandle: tweeterHandle,
        winnerID: winnerID,
        timestamp: timestamp,
    }]);
    return response;
}


// retrieves winner from the database (used for searching/viewing winner)
async function getWinnerFromDatabase(tweetID) {
    const response = await supabase
        .from('winners')
        .select('*')
        .eq('tweetID', tweetID)

    return response;
}

export { addWinnerToDatabase, getWinnerFromDatabase }