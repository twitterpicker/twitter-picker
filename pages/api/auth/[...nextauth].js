import NextAuth from 'next-auth';
import TwitterProvider from 'next-auth/providers/twitter';

// used for authentication
// only supports the twitter-provider
export default NextAuth({
  providers: [
    TwitterProvider({
      clientId: process.env.NEXT_PUBLIC_TWITTER_CONSUMER_KEY,
      clientSecret: process.env.NEXT_PUBLIC_TWITTER_CONSUMER_SECRET,
    })
  ],
  secret: process.env.NEXT_PUBLIC_AUTH_SECRET,
});
