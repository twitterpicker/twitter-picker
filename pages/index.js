import { signIn, signOut, useSession, getSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { twitter_tokens } from '../tokens/tokens';

const APP_STATE =
{
  START_ANIMATION: "START_ANIMATION",
  LOAD_ANIMATION: "LOAD_ANIMATION",
  AUTHENTICATED_WINNER_GENERATION: "AUTHENTICATED_WINNER_GENERATION",
  UNAUTHENTICATED_WINNER_GENERATION: "UNAUTHENTICATED_WINNER_GENERATION",
  VIEW_WINNER: "VIEW_WINNER",
  VIEW_WINNER_WITH_GENERATION_CAPABILITY: "VIEW_WINNER_WITH_GENERATION_CAPABILITY",
}

const START_ANIMATION_DURATION = 3;

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
      setAppState(APP_STATE.AUTHENTICATED_WINNER_GENERATION);
    }, (START_ANIMATION_DURATION * 1000));
    return () => clearTimeout(timer);
  }, []);



  if (appState === APP_STATE.START_ANIMATION) {
    return (
      <div className='start_animation_container'>
        <div className='start_animation_app_info'>
          <img className='start_animation_app_logo' src='/logo.png' />
        </div>
        <p className='start_animation_app_name'>Picker</p>
      </div>
    )
  }




  if (!session) {
    return (
      <>
        <div>
          {tweetLink + " : LINK"}
        </div>
        Not signed in <br />
        <button onClick={() => signIn()}>Sign in</button>
        <div>
          <input value={queryTweetLink} placeholder='tweet link' type="text" onChange={(event) => { setQueryTweetLink(event.target.value) }} />
          <button onClick={async () => { }}>view winner</button>
        </div>
      </>
    )
  }


  return (
    <>
      {
        session?.user?.image && <img src={session.user.image} />
      }
      <div>
        <h1> Signed in as {session.user.name} </h1>
        <button onClick={() => signOut({ redirect: false })}>Sign out</button>
      </div>
      <div>
        <input value={tweetLink} placeholder='tweet link' type="text" onChange={(event) => { setTweetLink(event.target.value) }} />
      </div>
      <div>
        <button onClick={async () => await generateWinner(session.user.name, getTweetIDFromLink(tweetLink))}>generate winner</button>
      </div>
      <div>
        {
          JSON.stringify(session)
        }
      </div>
      <div>
        <input value={queryTweetLink} placeholder='tweet link' type="text" onChange={(event) => { setQueryTweetLink(event.target.value) }} />
        <button onClick={async () => { }}>view winner</button>
      </div>
    </>
  )
}


