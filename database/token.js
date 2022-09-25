import { supabase } from "./client";


// retunrs all the token from the database
async function getTokensFromDatabase() {
    const response = await supabase.from('tokens').select('*');
    return response;
}

// adds/updates token to database (used specially for updating the requests and fetched attr.)
async function addTokenToDatabase(token, requests, fetched) {
    const response = await supabase.from('tokens').upsert([{
        token: token,
        requests: requests,
        fetched: fetched,
    }]);
    return response;
}

// returns the most viable token
// we define the most viable token as the token, which has the least number of retweets fetched
async function getMostViableToken() {
    const { data, error } = await getTokensFromDatabase();
    let lowest = null;
    if (data && data.length !== 0) {
        lowest = data[0];
        for(let i = 1; i < data.length; i++)
        {
            if(data[i].fetched < lowest.fetched) lowest = data[i];
        }

    }
    return lowest;
}

export { addTokenToDatabase, getMostViableToken }