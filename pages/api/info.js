export default function handler(req, res) {
  res.status(200).json({
    version: "1.0.0",
    functionalities: {
      getRetweetersOfTweetID: "/api/get-retweeters-of/:id/bearer/:token/for/:name",
    }
  })
}
