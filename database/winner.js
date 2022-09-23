import { supabase } from "./client";

async function addWinnerToDatabase(tweetID, tweeterHandle, winnerID, timestamp) {
    const response = await supabase.from('winners').upsert([{
        tweetID: tweetID,
        tweeterHandle: tweeterHandle,
        winnerID: winnerID,
        timestamp: timestamp,
    }]);
    return response;
}


// retrieve winner
async function getWinnerFromDatabase(tweetID) {
    const response = await supabase
        .from('winners')
        .select('*')
        .eq('tweetID', tweetID)

    return response;
}

export { addWinnerToDatabase, getWinnerFromDatabase }