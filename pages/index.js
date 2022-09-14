import { signIn, signOut, useSession, getSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { twitter_tokens } from '../tokens/tokens';

export default function Home() {

  const { data: session, status } = useSession();

  const [generatedWinner, setGeneratedWinner] = useState(null);
  const [tweetLink, setTweetLink] = useState("");
  const [queryTweetLink, setQueryTweetLink] = useState("");


  function getTweetIDFromLink(link) {
    const arrayAfterSplit = link.trim().split("/");
    return arrayAfterSplit[arrayAfterSplit.length - 1];
  }

  // function getRando

  async function generateWinner(name, id) {

    if (id === "") return;
    try {
      const token = twitter_tokens[0];
      const res = await fetch("api/get-retweeters", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          params: {
            twitterToken: token,
            tweetID: id,
            requesterName: name,
          },
        }),
      });

      let result = await res.json();
      setGeneratedWinner(result);
    } catch (err) {
      console.log(err);
    }
  }


  if (!session) {
    return (
      <>
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
      <div>
        <h1> Signed in as {session.user.name} </h1>
        <button onClick={() => signOut()}>Sign out</button>
      </div>
      <div>
        <input value={tweetLink} placeholder='tweet link' type="text" onChange={(event) => { setTweetLink(event.target.value) }} />
      </div>
      <div>
        <button onClick={async () => await generateWinner(session.user.name, getTweetIDFromLink(tweetLink))}>generate winner</button>
      </div>
      <div>
        {
          JSON.stringify(generatedWinner)
        }
      </div>
      <div>
        <input value={queryTweetLink} placeholder='tweet link' type="text" onChange={(event) => { setQueryTweetLink(event.target.value) }} />
        <button onClick={async () => { }}>view winner</button>
      </div>
    </>
  )
}


