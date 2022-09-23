import { supabase } from "./client";

async function getTokensFromDatabase() {
    const response = await supabase.from('tokens').select('*');
    return response;
}

async function getMostViableToken()
{
    return "AAAAAAAAAAAAAAAAAAAAAEG5gwEAAAAAQWyzq1e4H1rVtBSqcPK%2FpbpIQy4%3DJqboq6M3OCgCIuFpWNW3oxn67kwmRK5XItFcZQYkaBOj0Vn2mT";
}

export { getMostViableToken }