import { supabase } from "./client";

async function getTokensFromDatabase() {
    const response = await supabase.from('tokens').select('*');
    return response;
}

async function addTokenToDatabase(token, requests, fetched) {
    const response = await supabase.from('tokens').upsert([{
        token: token,
        requests: requests,
        fetched: fetched,
    }]);
    return response;
}

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
    console.log(lowest);
    return lowest;
}

export { addTokenToDatabase, getMostViableToken }