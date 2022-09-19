export default function handler(req, res) {
  res.status(200).json({
    version: "1.0.0",

    functionalities: {
      getRetweetersOfTweetID: {
        method: "post",
        endpoint: "/api/get-retweeters",
        takes: ["twitterToken", "tweetID", "requesterName"],
      },
    }
  })
}
