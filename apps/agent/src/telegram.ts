import type { Context } from "grammy";
import { env } from "./env";
import type { DraftMediaContext } from "./llm";
import { logger } from "./logger";
import type { SupportedMediaMimeType, TweetMedia } from "./twitter";

export function parseRawTweetCommand(input: string | undefined): string | null {
  const text = input?.trim() ?? "";
  const explicitRaw = text.match(/^raw\s+([\s\S]+)$/i);
  return explicitRaw?.[1]?.trim() || text || null;
}

export function parseCaptionCommand(
  caption: string | undefined,
): { command: "draft" | "tweet"; args: string } | null {
  const match = caption
    ?.trim()
    .match(/^\/(draft|tweet)(?:@[A-Za-z0-9_]+)?(?:\s+([\s\S]*))?$/i);
  if (!match) return null;
  return {
    command: match[1]!.toLowerCase() as "draft" | "tweet",
    args: match[2]?.trim() ?? "",
  };
}

export function parseCommandText(
  text: string,
): { command: string; args: string } | null {
  const match = text
    .trim()
    .match(/^\/([A-Za-z0-9_]+)(?:@[A-Za-z0-9_]+)?(?:\s+([\s\S]*))?$/);
  if (!match) return null;
  return {
    command: match[1]!.toLowerCase(),
    args: match[2]?.trim() ?? "",
  };
}

export function getTelegramMedia(ctx: Context): {
  fileId: string;
  mimeType: SupportedMediaMimeType;
}[] {
  const msg = ctx.message;
  if (!msg) return [];

  if ("photo" in msg && msg.photo && msg.photo.length > 0) {
    const largest = msg.photo.at(-1);
    return largest ? [{ fileId: largest.file_id, mimeType: "image/jpeg" }] : [];
  }

  if ("video" in msg && msg.video) {
    const mimeType =
      msg.video.mime_type === "video/quicktime"
        ? "video/quicktime"
        : "video/mp4";
    return [
      {
        fileId: msg.video.file_id,
        mimeType,
      },
    ];
  }

  return [];
}

export function hasTelegramMedia(ctx: Context): boolean {
  return getTelegramMedia(ctx).length > 0;
}

export async function downloadTelegramMedia(
  ctx: Context,
): Promise<TweetMedia[]> {
  const media = getTelegramMedia(ctx);
  await logger.debug("telegram media detected", {
    count: media.length,
    mimeTypes: media.map((item) => item.mimeType),
  });
  const out: TweetMedia[] = [];
  for (const item of media) {
    const file = await ctx.api.getFile(item.fileId);
    if (!file.file_path) {
      throw new Error("Telegram did not return a file path.");
    }
    const url = `https://api.telegram.org/file/bot${env.TELEGRAM_BOT_TOKEN}/${file.file_path}`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(
        `Telegram media download failed: ${res.status} ${res.statusText}`,
      );
    }
    out.push({
      data: Buffer.from(await res.arrayBuffer()),
      mimeType: item.mimeType,
    });
  }
  return out;
}

export function toDraftMediaContext(media: TweetMedia[]): DraftMediaContext[] {
  return media.map((item) => ({
    mimeType: item.mimeType,
    dataUrl: item.mimeType.startsWith("image/")
      ? `data:${item.mimeType};base64,${item.data.toString("base64")}`
      : undefined,
  }));
}
