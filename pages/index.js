import { signIn, signOut, useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { getWinnerFromDatabase } from '../database/winner';
import { pick } from '../utils/pick';

// determine if the app is in it's start animation phase
const APP_STATE =
{
  START_ANIMATION: "START_ANIMATION",
};

// start animation time can be limited
const START_ANIMATION_DURATION = 3;

// app name
const APP_NAME = "picker";


// a profile component, that returns a profile card
function Profile({
  profileImage,
  name,
  setTweetLinkError, // if user signs out, tweetLinkError should disapear
}) {

  // if there is no name and no profile image
  // no session! so, return card to sign in
  if (!name && !profileImage) {
    return (
      <div className='profile_card'>
        <img className='profile_image' src='/anon_profile.jpg' />
        <p>
          {"You aren't signed in."}
          <span className='profile_name'>
            {" sign in "}
          </span>
          {"to pick a winner."}
        </p>
        <button className='button' onClick={() => signIn()}>Sign in</button>
      </div>
    )
  }
  // if user is signed in, show his information
  // return a card to sign out
  else {
    return (
      <>
        <div className='profile_card'>
          <img className='profile_image' src={profileImage} />
          <p>
            {"You are logged in as"}
            <span className='profile_name'>
              {" " + name}
            </span>
          </p>
          <button className='button' onClick={() => {
            signOut({ redirect: false });
            setTweetLinkError(null);
          }}>Sign out</button>
        </div>
      </>
    )
  }

}

// the main Home component That displays the core app
export default function Home() {

  // stores the current app state
  const [appState, setAppState] = useState(APP_STATE.START_ANIMATION);

  // stores session data about twitter login
  const { data: session, status } = useSession();

  // stores the winner object 
  const [generatedWinner, setGeneratedWinner] = useState(null);

  const [searchedWinner, setSearchedWinner] = useState(null);

  // stores the tweet link the winner generator queried for
  const [tweetLink, setTweetLink] = useState("");

  // stores the tweetLinkError message
  const [tweetLinkError, setTweetLinkError] = useState(null);

  // stores the query tweet link, any user queries about a tweet
  const [queryTweetLink, setQueryTweetLink] = useState("");

  // is loading from server
  const [isLoading, setIsLoading] = useState(false);

  // is any input field in focus
  const [isInputFocused, setIsInputFocused] = useState(false);




  // regex expression checker for twitter status URL
  const isValidTweetLink = (urlString) => {
    var urlPattern = /^https?:\/\/(www.)?(mobile.)?twitter\.com\/(?:#!\/)?(\w+)\/status(es)?\/(\d+)/
    let isValidUrl = urlString.match(urlPattern);
    return isValidUrl;
  }

  // returns the tweet ID from a valid tweet link
  function getTweetIDFromLink(statusLink) {

    // if there's no link in input, there can't be an invalid link
    if (statusLink === "") {
      setTweetLinkError(null);
      return;
    };

    let tweetId = "";
    if (isValidTweetLink(statusLink)) {
      // if valid, remove tweetLinkError
      setTweetLinkError(null);
      let splitted = statusLink.split("/");
      for (let i = 0; i < splitted.length; i++) {
        if (splitted[i] === "status" || splitted[i] === "statuses") tweetId = splitted[i + 1].split("?")[0];
      }
    }
    else {
      // if not valid, set an error
      setTweetLinkError("Not A Valid Tweet Link!");
    }
    return tweetId;
  }


  // generates a winner by ${name} for tweet with id ${id}
  async function generateWinner(name, id) {

    // if empty query : doesn't do anything
    if (!id || id === "") return;

    // if there is an error with the tweet link, doesn't generate
    if (tweetLinkError) return;

    try {
      // starts loading
      setIsLoading(true);
      // tries fetching retweeters of ${id}, by ${name} with retrieved token 
      const winner = await pick(name, id);
      setGeneratedWinner(winner);
      // if winner is generated, signs out
      if (winner.isWinner) signOut({ redirect: false });
      // stops loading
      setIsLoading(false);
    }
    // there was an unhandled error
    catch (err) {
      // prints the error for now!
      console.log(err);
    }
  }

  // handles the searching of a winner with tweetID
  async function searchWinner(tweetID) {
    // if empty query : doesn't do anything
    if (!tweetID || tweetID === "") return;

    // if there is an error with the tweet link, doesn't search
    if (tweetLinkError) return;
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

  // useAffect onMount, for the home component
  // animates the start animation onMount
  useEffect(() => {
    const timer = setTimeout(() => {
      setAppState(null);
    }, (START_ANIMATION_DURATION * 1000));
    return () => clearTimeout(timer);
  }, []);


  // use affect for the change in input
  // see if there is any error with the tweet link or query tweet link
  useEffect(() => {
    // if authenticated, user is trying to generate winner
    if (status === "authenticated") getTweetIDFromLink(tweetLink);

    // if unauthenticated, user is trying to search a winner
    else if (status === "unauthenticated") getTweetIDFromLink(queryTweetLink);
  }, [tweetLink, queryTweetLink]);










  // if app is in START_ANIMATION state
  if (appState === APP_STATE.START_ANIMATION) {
    return (
      <div className='start_animation_container'>
        <div className='start_animation_app_info'>
          <img className='start_animation_app_logo' src='/logo.png' />
        </div>
        <p className='start_animation_app_name'>{APP_NAME}</p>
      </div>
    )
  }
  // if app is in loading state, (i.e: fetching data, or changing auth status!)
  else if (isLoading || status === "loading") {
    return (
      <div className='start_animation_container'>
        <div className='start_animation_app_info'>
          <img className='start_animation_app_logo' src='/logo.png' />
        </div>
        <p className='start_animation_app_name'>{"fetching data ..."} </p>
      </div>
    )
  }

  // if user is authenticated, but there is no winner generated yet,
  // show option for inputing tweetLink to generate winner
  else if (status === "authenticated" && !generatedWinner) {
    return (
      <div className='main'>
        <div className='app_info'>
          <img className='app_logo' src={isInputFocused ? '/back.png' : '/logo.png'} onClick={() => { setIsInputFocused(false) }} />
          <p className='app_name'>{APP_NAME} </p>
        </div>
        {
          // don't show profile card if input is fouced
          (isInputFocused === false) &&
          <Profile name={session?.user?.name} profileImage={session?.user?.image} setTweetLinkError={setTweetLinkError} />
        }
        {
          (isInputFocused === true) &&
          <p>{"Enter Tweet Link To Generate a winner"}</p>
        }
        <input className='input' value={tweetLink} placeholder='tweet link' type="text"
          onFocus={() => { setIsInputFocused(true) }}
          onChange={(event) => { setTweetLink(event.target.value) }} />
        <button className='button' onClick={async () => await generateWinner(session.user.name, getTweetIDFromLink(tweetLink))}>generate winner</button>
        {tweetLinkError && <p className='tweet_link_error'>{tweetLinkError}</p>}
      </div >
    )
  }


  // if user is authenticated, but generatedWinner {} is not a winner
  // or, if the user is unauthenticated, and there is a generated winner

  // shows error for first case, shows result for second case
  else if ((status === "unauthenticated" || status === "authenticated") && generatedWinner) {
    return (

      <div className='main'>
        <div className='app_info'>
          <img className='app_logo' src='/back.png' onClick={() => { setGeneratedWinner(null); setIsInputFocused(false) }} />
          <p className='app_name'>{APP_NAME} </p>
        </div>
        {
          (!generatedWinner.isWinner) &&
          <div className='query_unsuccessful'>
            <h2>
              {generatedWinner.error || "Sorry! no winner could be picked for the given tweet . . ."}
            </h2>
          </div>
        }
        {
          (generatedWinner.isWinner) &&
          <div className='winner'>
            <h2>{"GiveAway tweet :"}</h2>
            <a href={"https://twitter.com/user/status/" + generatedWinner.tweetID} target="_blank" rel="noopener noreferrer">
              {"https://twitter.com/user/status/" + generatedWinner.tweetID}
            </a>
            <h2>{"Winner Handle :"}
              <span className='profile-link'> {"@" + generatedWinner.tweeterHandle} </span>
            </h2>
            <a href={"https://twitter.com/" + generatedWinner.tweeterHandle} target="_blank" rel="noopener noreferrer">
              {"Visit winner profile"}
            </a>
            <h2>{"Selected at, "}  <span>{new Date(generatedWinner.timestamp).toLocaleDateString('en-US')}</span> </h2>
          </div>
        }
      </div>
    )
  }

  // or, if the user is unauthenticated, and there is a searched winner {}

  // shows error for if it's not a winner, shows result for if it's a winner
  else if (status === "unauthenticated" && searchedWinner) {

    return (
      <div className='main'>
        <div className='app_info'>
          <img className='app_logo' src='/back.png' onClick={() => { setSearchedWinner(null); setIsInputFocused(false) }} />
          <p className='app_name'>{APP_NAME} </p>
        </div>

        {
          (!searchedWinner.isWinner) &&
          <div className='query_unsuccessful'>
            <h1>
              {"Sorry! no winner found for the given tweet . . ."}
            </h1>
          </div>
        }
        {
          (searchedWinner.isWinner) &&
          <div className='winner'>
            <h2>{"GiveAway tweet :"}</h2>
            <a href={"https://twitter.com/user/status/" + searchedWinner.tweetID} target="_blank" rel="noopener noreferrer">
              {"https://twitter.com/user/status/" + searchedWinner.tweetID}
            </a>
            <h2>{"Winner Handle :"}
              <span className='profile-link'> {"@" + searchedWinner.tweeterHandle} </span>
            </h2>
            <a href={"https://twitter.com/" + searchedWinner.tweeterHandle} target="_blank" rel="noopener noreferrer">
              {"Visit winner profile"}
            </a>
            <h2>{"Selected at, "}  <span>{new Date(searchedWinner.timestamp).toLocaleDateString('en-US')}</span> </h2>
          </div>
        }
      </div>
    )
  }
  // else if aunethenticated user and no searched winner
  // show input for entering tweet link to search
  else if (status === "unauthenticated") {
    return (
      <div className='main'>
        <div className='app_info'>
          <img className='app_logo' src={isInputFocused ? '/back.png' : '/logo.png'} onClick={() => { setIsInputFocused(false) }} />
          <p className='app_name'>{APP_NAME} </p>
        </div>
        {
          // don't show profile card if input is focused
          (isInputFocused === false) &&
          <Profile setTweetLinkError={setTweetLinkError} />
        }
        {
          (isInputFocused === true) &&
          <p>{"Enter Tweet Link To search the giveaway winner."}</p>
        }
        <input className='input' value={queryTweetLink} placeholder='tweet link' type="text"
          onFocus={() => { setIsInputFocused(true) }}
          onChange={(event) => { setQueryTweetLink(event.target.value) }} />
        <button className='button' onClick={async () => { await searchWinner(getTweetIDFromLink(queryTweetLink)) }}>view winner</button>
        {tweetLinkError && <p className='tweet_link_error'>{tweetLinkError}</p>}
      </div>
    )
  }



}


