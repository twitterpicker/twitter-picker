import { SessionProvider } from "next-auth/react"
import '../styles/globals.css'


// app component (wrapped by the session provider of next-auth)
export default function App({
  Component,
  pageProps: { session, ...pageProps },
}) {
  return (
    <SessionProvider session={session}>
      <Component {...pageProps} />
    </SessionProvider>
  )
}