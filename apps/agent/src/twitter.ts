import { TwitterApi } from "twitter-api-v2";
import { env } from "./env";

let client: TwitterApi | null = null;
function getClient(): TwitterApi {
  if (!client) {
    client = new TwitterApi({
      appKey: env.TWITTER_API_KEY,
      appSecret: env.TWITTER_API_SECRET,
      accessToken: env.TWITTER_ACCESS_TOKEN,
      accessSecret: env.TWITTER_ACCESS_TOKEN_SECRET,
    });
  }
  return client;
}

export type PostedResult = {
  id: string;
  url: string;
  dryRun: boolean;
};

export async function postTweet(text: string): Promise<PostedResult> {
  if (env.DRY_RUN) {
    const id = `dry-${Date.now()}`;
    console.log(
      `[agent] DRY_RUN — not calling X. Would have tweeted (${text.length} chars):\n${text}`,
    );
    return {
      id,
      url: `(DRY_RUN) https://x.com/i/web/status/${id}`,
      dryRun: true,
    };
  }
  const { data } = await getClient().v2.tweet(text);
  // Username is not in the create-tweet response; "i" works as the canonical URL.
  return {
    id: data.id,
    url: `https://x.com/i/web/status/${data.id}`,
    dryRun: false,
  };
}
