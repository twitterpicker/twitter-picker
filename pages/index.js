import { signIn, signOut, useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { getWinnerFromDatabase } from '../database/winner';
import { pick } from '../utils/pick';

const APP_STATE =
{
  START_ANIMATION: "START_ANIMATION",
}

const START_ANIMATION_DURATION = 3;
const APP_NAME = "picker";


function Profile({
  profileImage,
  name,
  setTweetLinkError,
}) {
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

    if (statusLink === "") {
      setTweetLinkError(null);
      return;
    };

    let tweetId = "";
    if (isValidTweetLink(statusLink)) {
      setTweetLinkError(null);
      let splitted = statusLink.split("/");
      for (let i = 0; i < splitted.length; i++) {
        if (splitted[i] === "status" || splitted[i] === "statuses") tweetId = splitted[i + 1];
      }
    }
    else {
      setTweetLinkError("Not A Valid Tweet Link!");
    }
    return tweetId;
  }


  // generates a winner by ${name} for tweet with id ${id}
  async function generateWinner(name, id) {

    // if empty query : doesn't do anything
    if (!id || id === "") return;

    if (tweetLinkError) return;

    try {
      // start loading
      setIsLoading(true);
      // try fetching retweeters of ${id}, by ${name} with retrieved token 
      console.log(1);
      const winner = await pick(name, id);
      setGeneratedWinner(winner);
      // if winner is generated, signout
      if (winner.isWinner) signOut({ redirect: false });
      // set winner to be generated


      // stop loading
      setIsLoading(false);
    }
    // there was an error
    catch (err) {
      console.log(err);
    }
  }

  useEffect(() => {
    console.log(generatedWinner);
  }, [generatedWinner]);


  async function searchWinner(tweetID) {
    // if empty query : doesn't do anything
    if (!tweetID || tweetID === "") return;
    if (tweetLinkError) return;
    // start loading
    setIsLoading(true);
    let response = await getWinnerFromDatabase(tweetID);
    if (response.data && response.data.length !== 0) {
      setSearchedWinner({ ...response.data[0], isWinner: true });
    }
    else {
      setSearchedWinner({ isWinner: false })
    }
    // stop loading
    setIsLoading(false);
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      setAppState(null);
    }, (START_ANIMATION_DURATION * 1000));
    return () => clearTimeout(timer);
  }, []);


  useEffect(() => {
    if (status === "authenticated") getTweetIDFromLink(tweetLink);
    else if (status === "unauthenticated") getTweetIDFromLink(queryTweetLink);
  }, [tweetLink, queryTweetLink]);










  if (appState === APP_STATE.START_ANIMATION) {
    console.log("start animation")
    return (
      <div className='start_animation_container'>
        <div className='start_animation_app_info'>
          <img className='start_animation_app_logo' src='/logo.png' />
        </div>
        <p className='start_animation_app_name'>{APP_NAME}</p>
      </div>
    )
  }
  else if (isLoading || status === "loading") {
    console.log("load animation")
    return (
      <div className='start_animation_container'>
        <div className='start_animation_app_info'>
          <img className='start_animation_app_logo' src='/logo.png' />
        </div>
        <p className='start_animation_app_name'>{"fetching data ..."} </p>
      </div>
    )
  }

  // 1 case for authorized user
  // generate the winner for that tweet
  else if (status === "authenticated" && !generatedWinner) {
    console.log("generate winner")
    return (
      <div className='main'>
        <div className='app_info'>
          <img className='app_logo' src={isInputFocused ? '/back.png' : '/logo.png'} onClick={() => { setIsInputFocused(false) }} />
          <p className='app_name'>{APP_NAME} </p>
        </div>
        {
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

  // 3 cases for unauthinticated use 
  // (if there is a winner generated), show that result
  // else (if there is a winner result after query), show that result
  // else, show the option to search a winner of a tweet
  else if ((status === "unauthenticated" || status === "authenticated") && generatedWinner) {
    console.log("generated winner result")
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
  else if (status === "unauthenticated" && searchedWinner) {
    console.log("searched winner result")

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
  else if (status === "unauthenticated") {
    console.log("search for winner")
    return (
      <div className='main'>
        <div className='app_info'>
          <img className='app_logo' src={isInputFocused ? '/back.png' : '/logo.png'} onClick={() => { setIsInputFocused(false) }} />
          <p className='app_name'>{APP_NAME} </p>
        </div>
        {
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


