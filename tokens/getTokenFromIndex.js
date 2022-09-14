import { twitter_tokens } from "./tokens";

function getTokenFromIndex(index) {
    index = (index < 0 || index > twitter_tokens.length) ? 0 : index;
    return twitter_tokens[index];
}
export { getTokenFromIndex }