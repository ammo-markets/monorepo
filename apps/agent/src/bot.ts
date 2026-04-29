import { Bot, InlineKeyboard, type Context } from "grammy";
import { env } from "./env";
import { generateDrafts, type DraftMediaContext, type DraftSet } from "./llm";
import { logger } from "./logger";
import {
  postTweet,
  validateTweetText,
  type SupportedMediaMimeType,
  type TweetMedia,
} from "./twitter";
import {
  appendPosted,
  appendToMemory,
  clearMemory,
  getActiveCharacterName,
  listCharacters,
  listPosted,
  readActiveCharacter,
  readContext,
  readMemory,
  setActiveCharacter,
} from "./storage";

const ALLOWED = new Set(env.TELEGRAM_ALLOWED_USER_IDS);

// In-memory draft cache. Lost on restart — the user just retypes /draft.
const DRAFT_TTL_MS = 60 * 60 * 1000;
const drafts = new Map<
  string,
  { set: DraftSet; media: TweetMedia[]; expiresAt: number }
>();

function rememberDraft(set: DraftSet, media: TweetMedia[] = []): void {
  drafts.set(set.id, { set, media, expiresAt: Date.now() + DRAFT_TTL_MS });
}

function getDraft(id: string): { set: DraftSet; media: TweetMedia[] } | null {
  const entry = drafts.get(id);
  if (!entry) return null;
  if (entry.expiresAt < Date.now()) {
    drafts.delete(id);
    return null;
  }
  return { set: entry.set, media: entry.media };
}

function sweepDrafts(): void {
  const now = Date.now();
  for (const [id, entry] of drafts) {
    if (entry.expiresAt < now) drafts.delete(id);
  }
}

// Chunks long text to fit Telegram's 4096-char message limit.
function chunk(text: string, max = 3800): string[] {
  if (text.length <= max) return [text];
  const out: string[] = [];
  let i = 0;
  while (i < text.length) {
    out.push(text.slice(i, i + max));
    i += max;
  }
  return out;
}

function parseRawTweetCommand(input: string | undefined): string | null {
  const text = input?.trim() ?? "";
  const explicitRaw = text.match(/^raw\s+([\s\S]+)$/i);
  return explicitRaw?.[1]?.trim() || text || null;
}

function getTelegramMedia(ctx: Context): {
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

async function downloadTelegramMedia(ctx: Context): Promise<TweetMedia[]> {
  const media = getTelegramMedia(ctx);
  await logger.debug("telegram media detected", {
    count: media.length,
    mimeTypes: media.map((item) => item.mimeType),
  });
  const out: TweetMedia[] = [];
  for (const item of media) {
    const file = await ctx.api.getFile(item.fileId);
    if (!file.file_path)
      throw new Error("Telegram did not return a file path.");
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

function toDraftMediaContext(media: TweetMedia[]): DraftMediaContext[] {
  return media.map((item) => ({
    mimeType: item.mimeType,
    dataUrl: item.mimeType.startsWith("image/")
      ? `data:${item.mimeType};base64,${item.data.toString("base64")}`
      : undefined,
  }));
}

function parseCaptionCommand(
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
  const recentPosts = recent.map((p) => p.text);

  let set: DraftSet;
  try {
    set = await generateDrafts(cleanTopic, {
      character: character.content,
      context,
      memory,
      recentPosts,
      media: toDraftMediaContext(media),
    });
  } catch (err) {
    await logger.error("draft generation failed", err);
    await ctx.reply(`LLM error: ${(err as Error).message}`);
    return;
  }

  rememberDraft(set, media);
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

export function createBot(): Bot {
  const bot = new Bot(env.TELEGRAM_BOT_TOKEN);

  bot.use(async (ctx, next) => {
    const userId = ctx.from?.id;
    if (!userId || !ALLOWED.has(userId)) {
      await logger.warn("unauthorized telegram update", {
        userId,
        chatId: ctx.chat?.id,
      });
      if (ctx.chat) await ctx.reply("Not authorized.");
      return;
    }
    await next();
  });

  bot.command(["start", "help"], async (ctx) => {
    const banner = env.DRY_RUN
      ? "🚧 DRY_RUN ON — approvals log the would-be tweet but do not call X."
      : "Ammo Markets draft bot is online.";
    await ctx.reply(
      [
        banner,
        "",
        "High-use marketing commands",
        "",
        "Command: /draft <idea>",
        "Does: creates 3 AI-written tweet options for approval.",
        "Example: /draft caption this image for prelaunch",
        "",
        "Command: /tweet <text>",
        "Does: posts the exact copy you provide.",
        "Example: /tweet Make your ammo liquid.",
        "",
        "Command: /remember <fact>",
        "Does: teaches the agent brand facts, campaign details, or wording rules.",
        "Example: /remember We are migrating to Pharaoh Exchange, not Trader Joe.",
        "",
        "Other useful commands",
        "",
        "/memory - show saved memory",
        "/forget - clear saved memory",
        "/character - show available voices",
        "/character <name> - switch voice",
        "/status - bot status",
      ].join("\n"),
    );
  });

  bot.command("status", async (ctx) => {
    const [recent, memory, activeCharacter] = await Promise.all([
      listPosted({ limit: 5 }),
      readMemory(),
      getActiveCharacterName(),
    ]);
    const memoryLines = memory
      ? memory.split("\n").filter((l) => l.startsWith("- [")).length
      : 0;
    const lines = [
      `Mode: manual (human-in-the-loop)${env.DRY_RUN ? " [DRY_RUN]" : ""}`,
      `Model: ${env.LLM_MODEL}`,
      `Active character: ${activeCharacter}`,
      `Pending drafts in memory: ${drafts.size}`,
      `Memory entries: ${memoryLines}`,
      `Recent posts (last ${recent.length}):`,
      ...recent.map(
        (p) =>
          `• ${p.postedAt.slice(0, 16)} — https://x.com/i/web/status/${p.tweetId}`,
      ),
    ];
    await ctx.reply(lines.join("\n"));
  });

  bot.command("tweet", async (ctx) => {
    await handleRawTweet(ctx, ctx.match ?? "");
  });

  bot.command("remember", async (ctx) => {
    if (!ctx.from) return;
    const text = ctx.match?.trim();
    if (!text) {
      await ctx.reply(
        "Usage: /remember <fact or guidance>\nExamples:\n• /remember We are migrating to Pharaoh Exchange, not Trader Joe.\n• /remember Do not use the word 'munitions' — reads military-industrial.\n• /remember Warehouse partner is based in Oregon; reputable brands only.",
      );
      return;
    }
    await appendToMemory(text, {
      tgUserId: ctx.from.id,
      tgUsername: ctx.from.username,
    });
    await ctx.reply(
      "Remembered. This will be included in every future /draft.",
    );
  });

  bot.command("memory", async (ctx) => {
    const memory = await readMemory();
    if (!memory.trim()) {
      await ctx.reply(
        "Memory is empty. Use /remember <text> to teach the agent.",
      );
      return;
    }
    for (const part of chunk(memory)) await ctx.reply(part);
  });

  bot.command("forget", async (ctx) => {
    const memory = await readMemory();
    if (!memory.trim()) {
      await ctx.reply("Memory is already empty.");
      return;
    }
    const kb = new InlineKeyboard()
      .text("Yes, wipe it", "forget:confirm")
      .text("Cancel", "forget:cancel");
    await ctx.reply(
      `This will permanently delete ${memory.split("\n").filter((l) => l.startsWith("- [")).length} memory entries. Continue?`,
      { reply_markup: kb },
    );
  });

  bot.callbackQuery("forget:confirm", async (ctx) => {
    await clearMemory();
    await ctx.answerCallbackQuery({ text: "Memory cleared." });
    await ctx.editMessageText("Memory wiped.");
  });

  bot.callbackQuery("forget:cancel", async (ctx) => {
    await ctx.answerCallbackQuery({ text: "Cancelled." });
    await ctx.editMessageText("Memory kept.");
  });

  bot.command("character", async (ctx) => {
    const arg = ctx.match?.trim();
    const available = await listCharacters();
    if (!arg) {
      const active = await getActiveCharacterName();
      const list =
        available.length > 0
          ? available
              .map((n) => (n === active ? `• ${n} (active)` : `• ${n}`))
              .join("\n")
          : "(none — add markdown files to apps/agent/characters/)";
      await ctx.reply(
        [
          `Active character: ${active}`,
          "",
          "Available:",
          list,
          "",
          "Switch: /character <name>",
          "Add a new one: drop a .md file in apps/agent/characters/, no restart needed.",
        ].join("\n"),
      );
      return;
    }
    try {
      await setActiveCharacter(arg);
      await ctx.reply(`Switched to character: ${arg}.`);
    } catch (err) {
      await ctx.reply((err as Error).message);
    }
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

  bot.callbackQuery(/^approve:([a-z0-9]+):(\d)$/, async (ctx) => {
    const [, draftId, idxStr] = ctx.match;
    const idx = Number(idxStr);
    const draft = getDraft(draftId!);
    if (!draft) {
      await ctx.answerCallbackQuery({
        text: "Draft expired. Run /draft again.",
        show_alert: true,
      });
      return;
    }
    const { set, media } = draft;
    const text = set.variants[idx];
    if (!text) {
      await ctx.answerCallbackQuery({
        text: "Invalid choice.",
        show_alert: true,
      });
      return;
    }
    const validationError = validateTweetText(text);
    if (validationError) {
      await ctx.answerCallbackQuery({
        text: validationError,
        show_alert: true,
      });
      return;
    }

    await ctx.answerCallbackQuery({ text: "Posting..." });

    try {
      const result = await postTweet(text, media);
      await logger.info("approved draft posted", {
        draftId,
        tweetId: result.id,
        dryRun: result.dryRun,
        mediaCount: media.length,
      });
      await appendPosted({
        tweetId: result.id,
        text,
        topic: set.topic,
        variantIdx: idx,
        approvedByTgUserId: ctx.from.id,
        postedAt: new Date().toISOString(),
        dryRun: result.dryRun,
      });
      drafts.delete(draftId!);
      const prefix = result.dryRun ? "DRY_RUN — would have posted:" : "Posted:";
      await ctx.editMessageText(`${prefix} ${result.url}\n\n${text}`);
    } catch (err) {
      await logger.error("approved draft post failed", err);
      console.error("[agent] Twitter error (full):", err);
      await ctx.reply(`Twitter error: ${(err as Error).message}`);
    }
  });

  bot.callbackQuery(/^cancel:([a-z0-9]+)$/, async (ctx) => {
    const [, draftId] = ctx.match;
    drafts.delete(draftId!);
    await ctx.answerCallbackQuery({ text: "Cancelled." });
    await ctx.editMessageText("Draft cancelled.");
  });

  bot.catch((err) => {
    void logger.error("grammy error", err.error);
    console.error("[agent] grammY error:", err);
  });

  setInterval(sweepDrafts, 10 * 60 * 1000);

  return bot;
}
