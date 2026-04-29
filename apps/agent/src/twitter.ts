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

export type TweetMedia = {
  data: Buffer;
  mimeType: SupportedMediaMimeType;
};

export type SupportedMediaMimeType =
  | "image/gif"
  | "image/jpeg"
  | "image/png"
  | "image/webp"
  | "video/mp4"
  | "video/quicktime";

export function validateTweetText(text: string): string | null {
  const length = Array.from(text).length;
  if (length === 0) return "Tweet text is empty.";
  if (length > 280) return `Tweet is ${length} characters; X limit is 280.`;
  return null;
}

function mediaCategory(
  mimeType: SupportedMediaMimeType,
): "tweet_image" | "tweet_video" | "tweet_gif" {
  if (mimeType === "image/gif") return "tweet_gif";
  if (mimeType.startsWith("video/")) return "tweet_video";
  return "tweet_image";
}

export async function postTweet(
  text: string,
  media: TweetMedia[] = [],
): Promise<PostedResult> {
  const validationError = validateTweetText(text);
  if (validationError) throw new Error(validationError);

  if (env.DRY_RUN) {
    const id = `dry-${Date.now()}`;
    console.log(
      `[agent] DRY_RUN — not calling X. Would have tweeted (${text.length} chars, ${media.length} media):\n${text}`,
    );
    return {
      id,
      url: `(DRY_RUN) https://x.com/i/web/status/${id}`,
      dryRun: true,
    };
  }

  const mediaIds = [];
  for (const item of media) {
    mediaIds.push(
      await getClient().v2.uploadMedia(item.data, {
        media_type: item.mimeType,
        media_category: mediaCategory(item.mimeType),
      }),
    );
  }

  const { data } =
    mediaIds.length > 0
      ? await getClient().v2.tweet({
          text,
          media: {
            media_ids: mediaIds as
              | [string]
              | [string, string]
              | [string, string, string]
              | [string, string, string, string],
          },
        })
      : await getClient().v2.tweet(text);
  // Username is not in the create-tweet response; "i" works as the canonical URL.
  return {
    id: data.id,
    url: `https://x.com/i/web/status/${data.id}`,
    dryRun: false,
  };
}
