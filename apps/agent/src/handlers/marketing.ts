import { InlineKeyboard, type Bot, type Context } from "grammy";
import { readActiveCharacter } from "../characters";
import { readContext } from "../context-store";
import { rememberDraft } from "../drafts";
import { generateDrafts, type DraftSet } from "../llm";
import { logger } from "../logger";
import { readMemory } from "../memory-store";
import { appendPosted, listPosted } from "../posted-store";
import {
  downloadTelegramMedia,
  getTelegramMedia,
  parseCaptionCommand,
  parseRawTweetCommand,
  toDraftMediaContext,
} from "../telegram";
import { postTweet, validateTweetText, type TweetMedia } from "../twitter";
import { registerApprovalHandlers } from "./approval";

async function handleRawTweet(ctx: Context, rawArgs: string): Promise<void> {
  if (!ctx.from) return;
  await logger.info("raw tweet requested", {
    userId: ctx.from.id,
    hasMedia: getTelegramMedia(ctx).length > 0,
  });
  const text = parseRawTweetCommand(rawArgs);
  if (!text) {
    await ctx.reply(
      "Usage: /tweet <text>\nOptional: /tweet raw <text>\nAttach one photo or video to include media.",
    );
    return;
  }

  const validationError = validateTweetText(text);
  if (validationError) {
    await ctx.reply(validationError);
    return;
  }

  await ctx.replyWithChatAction("typing");

  try {
    const media = await downloadTelegramMedia(ctx);
    const result = await postTweet(text, media);
    await appendPosted({
      tweetId: result.id,
      text,
      topic: "raw",
      variantIdx: 0,
      approvedByTgUserId: ctx.from.id,
      postedAt: new Date().toISOString(),
      dryRun: result.dryRun,
    });
    const prefix = result.dryRun ? "DRY_RUN — would have posted:" : "Posted:";
    const suffix = media.length > 0 ? `\nMedia attached: ${media.length}` : "";
    await ctx.reply(`${prefix} ${result.url}${suffix}\n\n${text}`);
  } catch (err) {
    await logger.error("raw tweet failed", err);
    console.error("[agent] Raw tweet error (full):", err);
    await ctx.reply(`Tweet error: ${(err as Error).message}`);
  }
}

async function handleDraft(ctx: Context, topic: string): Promise<void> {
  const cleanTopic = topic.trim();
  await logger.info("draft requested", {
    userId: ctx.from?.id,
    topic: cleanTopic,
    hasMedia: getTelegramMedia(ctx).length > 0,
  });
  if (!cleanTopic) {
    await ctx.reply(
      "Usage: /draft <topic>\nExample: /draft caption this image for prelaunch",
    );
    return;
  }

  await ctx.replyWithChatAction("typing");

  let character: { name: string; content: string };
  try {
    character = await readActiveCharacter();
  } catch (err) {
    await logger.error("active character read failed", err);
    await ctx.reply((err as Error).message);
    return;
  }

  let media: TweetMedia[] = [];
  try {
    media = await downloadTelegramMedia(ctx);
  } catch (err) {
    await logger.error("telegram media download failed", err);
    await ctx.reply(`Media error: ${(err as Error).message}`);
    return;
  }

  const [context, memory, recent] = await Promise.all([
    readContext(),
    readMemory(),
    listPosted({ limit: 10 }),
  ]);

  let set: DraftSet;
  try {
    set = await generateDrafts(cleanTopic, {
      character: character.content,
      context,
      memory,
      recentPosts: recent.map((p) => p.text),
      media: toDraftMediaContext(media),
    });
  } catch (err) {
    await logger.error("draft generation failed", err);
    await ctx.reply(`LLM error: ${(err as Error).message}`);
    return;
  }

  await rememberDraft(set, media);
  await logger.info("draft generated", {
    draftId: set.id,
    variants: set.variants.length,
    mediaCount: media.length,
  });

  const body = [
    `Topic: ${set.topic}`,
    `Character: ${character.name}`,
    media.length > 0 ? `Media attached: ${media.length}` : "",
    "",
    ...set.variants.map((v, i) => `${i + 1}. ${v}\n(${v.length} chars)`),
  ]
    .filter(Boolean)
    .join("\n\n");

  const kb = new InlineKeyboard()
    .text("Post 1", `approve:${set.id}:0`)
    .text("Post 2", `approve:${set.id}:1`)
    .text("Post 3", `approve:${set.id}:2`)
    .row()
    .text("Cancel", `cancel:${set.id}`);

  await ctx.reply(body, { reply_markup: kb });
}

export function registerMarketingHandlers(bot: Bot): void {
  bot.command("tweet", async (ctx) => {
    await handleRawTweet(ctx, ctx.match ?? "");
  });

  bot.command("draft", async (ctx) => {
    await handleDraft(ctx, ctx.match ?? "");
  });

  bot.on("message:caption", async (ctx) => {
    const parsed = parseCaptionCommand(ctx.message.caption);
    if (!parsed) return;
    if (parsed.command === "draft") {
      await handleDraft(ctx, parsed.args);
      return;
    }
    await handleRawTweet(ctx, parsed.args);
  });

  registerApprovalHandlers(bot);
}
