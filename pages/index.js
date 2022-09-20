import { signIn, signOut, useSession, getSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { twitter_tokens } from '../tokens/tokens';

const APP_STATE =
{
  START_ANIMATION: "START_ANIMATION",
  LOAD_ANIMATION: "LOAD_ANIMATION",
  WINNER_GENERATION: "WINNER_GENERATION",
  WINNER_GENERATON_RESULT: "WINNER_RESULT",
  SEARCH_WINNER: "SEARCH_WINNER",
  WINNER_SEARCH_RESULT: "WINNER_SEARCH_RESULT"
}

const START_ANIMATION_DURATION = 3;
const APP_NAME = "picker";


function Profile({
  profileImage,
  name,
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
          <button className='button' onClick={() => signOut({ redirect: false })}>Sign out</button>
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

  // stores the tweet link the winner generator queried for
  const [tweetLink, setTweetLink] = useState("");

  // stores the query tweet link, any user queries about a tweet
  const [queryTweetLink, setQueryTweetLink] = useState("");



  // returns the tweet ID from a valid tweet link
  function getTweetIDFromLink(link) {
    const arrayAfterSplit = link.trim().split("/");
    return arrayAfterSplit[arrayAfterSplit.length - 1];
  }


  // generates a winner by ${name} for tweet with id ${id}
  async function generateWinner(name, id) {

    // if empty query : doesn't do anything
    if (!id || id === "") return;

    try {
      // needs to get the twitter token : (with least number of retweet fetched)
      const token = twitter_tokens[0];

      // try fetching retweeters of ${id}, by ${name} with retrieved token 
      const res = await fetch("api/get-retweeters", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          params: {
            twitterToken: token,
            tweetID: id,
            requesterName: name,
          },
        }),
      });

      let result = await res.json();
      // calculate winner and set the winner
      setGeneratedWinner(result);
      // if winner is generated, signout
    } catch (err) {
      console.log(err);
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      setAppState(APP_STATE.SEARCH_WINNER);
    }, (START_ANIMATION_DURATION * 1000));
    return () => clearTimeout(timer);
  }, []);





  // 2 loading state
  // page reload animation
  // generate/search winner animation
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
  else if (appState === APP_STATE.LOAD_ANIMATION) {
    return (
      <div className='start_animation_container'>
        <div className='start_animation_app_info'>
          <img className='start_animation_app_logo' src='/logo.png' />
        </div>
        <p className='start_animation_app_name'>{APP_NAME}</p>
      </div>
    )
  }

  // 1 case for authorized user
  // generate the winner for that tweet
  if (session) {
    return (

      <div className='main'>
        <div className='app_info'>
          <img className='app_logo' src='/logo.png' />
          <p className='app_name'>{APP_NAME}</p>
        </div>
        <Profile name={session?.user?.name} profileImage={session?.user?.image} />
        <input className='input' value={tweetLink} placeholder='tweet link' type="text" onChange={(event) => { setTweetLink(event.target.value) }} />
        <button className='button' onClick={async () => await generateWinner(session.user.name, getTweetIDFromLink(tweetLink))}>generate winner</button>
      </div>
    )
  }


  // 3 cases for unauthinticated use 
  // (if there is a winner generated), show that result
  // else (if there is a winner result after query), show that result
  // else, show the option to search a winner of a tweet
  if (!session && appState === APP_STATE.WINNER_GENERATON_RESULT) {
    return (
      <div className='main'>
        <Profile />
        {
          "GENERATION RESULT"
        }
      </div>
    )
  }
  else if (!session && appState === APP_STATE.WINNER_SEARCH_RESULT) {
    return (
      <div className='main'>
        <Profile />
        {
          "SEARCH RESULT"
        }
      </div>
    )
  }
  else if (!session && appState === APP_STATE.SEARCH_WINNER) {
    return (
      <div className='main'>
        <div className='app_info'>
          <img className='app_logo' src='/logo.png' />
          <p className='app_name'>{APP_NAME}</p>
        </div>
        <Profile />
        <input className='input' value={queryTweetLink} placeholder='tweet link' type="text" onChange={(event) => { setQueryTweetLink(event.target.value) }} />
        <button className='button' onClick={async () => { }}>view winner</button>
      </div>
    )
  }


}


