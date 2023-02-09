import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { getWinnerFromDatabase } from "../../database/winner";


// app name
const APP_NAME = "Picker";

export default function Verify() {
    

    const router = useRouter()
    const { tweetID } = router.query;

    let [loading, setIsLoading] = useState(true);
    const [searchedWinner, setSearchedWinner] = useState(null);


    // handles the searching of a winner with tweetID
    async function searchWinner(tweetID) {
        // if empty query : don't do anything
        if (!tweetID || tweetID === "") return;


        // starts loading
        setIsLoading(true);
        // gets the winner from the database
        let response = await getWinnerFromDatabase(tweetID);

        // if a winner is found
        if (response.data && response.data.length !== 0) {
            setSearchedWinner({ ...response.data[0], isWinner: true });
        }
        else {
            // if a winner is not found
            setSearchedWinner({ isWinner: false })
        }
        // stop loading
        setIsLoading(false);
    }


    useEffect(() => {
        // if tweetID exists try to find winner for that tweetID
        if (tweetID) {
            searchWinner(tweetID);
        }
    }, [tweetID]);


    if (!searchedWinner) {
        return (
            <div className='start_animation_container'>
                <div className='start_animation_app_info'>
                    <img className='start_animation_app_logo' src='/logo.png' />
                </div>
                <p className='start_animation_app_name'>{"fetching data ..."} </p>
            </div>
        )
    }


    return (
        <div className='main'>
            <div className='app_info'>
                <img className='app_logo' src='/logo.png' onClick={() => { router.push('/') }} />
                <p className='app_name'>{APP_NAME} </p>
            </div>

            {
                (!searchedWinner.isWinner) &&
                <div className='query_unsuccessful'>
                    <h1>
                        {"Sorry! no winner has been selected yet for the tweet giveaway  . . ."}
                    </h1>
                </div>
            }
            {
                (searchedWinner.isWinner) &&
                <>
                    <h1 className="winner-title">
                        {"Winner verification"}
                    </h1>
                    <div className='winner'>
                        <h2 className='giveaway-tweet'>{"Giveaway tweet"}</h2>
                        <a href={"https://twitter.com/user/status/" + searchedWinner.tweetID} target="_blank" rel="noopener noreferrer">
                            {"https://twitter.com/user/status/" + searchedWinner.tweetID}
                        </a>
                        <h2 className='giveaway-tweet'>{"Winner Twitter Handle"}</h2>
                        <p>
                            {"@" + searchedWinner.tweeterHandle}
                        </p>
                        <h2 className='giveaway-tweet'>{"Winner Selected At"}</h2>
                        <p>
                            {new Date(searchedWinner.timestamp).toLocaleDateString('en-US')}
                        </p>
                        <h3>
                            <a href={"https://twitter.com/" + searchedWinner.tweeterHandle} target="_blank" rel="noopener noreferrer">
                                {"Visit winner profile"}
                            </a>
                        </h3>
                    </div>
                </>

            }
        </div>
    )

}