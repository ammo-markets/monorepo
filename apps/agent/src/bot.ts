import { Bot, InlineKeyboard } from "grammy";
import { env } from "./env";
import { generateDrafts, type DraftSet } from "./llm";
import { postTweet } from "./twitter";
import {
  appendPosted,
  appendToMemory,
  clearMemory,
  getActiveCharacterName,
  listCharacters,
  listPosted,
  readActiveCharacter,
  readMemory,
  setActiveCharacter,
} from "./storage";

const ALLOWED = new Set(env.TELEGRAM_ALLOWED_USER_IDS);

// In-memory draft cache. Lost on restart — the user just retypes /draft.
const DRAFT_TTL_MS = 60 * 60 * 1000;
const drafts = new Map<string, { set: DraftSet; expiresAt: number }>();

function rememberDraft(set: DraftSet): void {
  drafts.set(set.id, { set, expiresAt: Date.now() + DRAFT_TTL_MS });
}

function getDraft(id: string): DraftSet | null {
  const entry = drafts.get(id);
  if (!entry) return null;
  if (entry.expiresAt < Date.now()) {
    drafts.delete(id);
    return null;
  }
  return entry.set;
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

export function createBot(): Bot {
  const bot = new Bot(env.TELEGRAM_BOT_TOKEN);

  bot.use(async (ctx, next) => {
    const userId = ctx.from?.id;
    if (!userId || !ALLOWED.has(userId)) {
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
        "Drafting:",
        "• /draft <topic> — generate 3 tweet drafts",
        "• /history — last posted tweets",
        "• /status — bot status",
        "",
        "Memory (what the agent knows):",
        "• /remember <fact or guidance> — teach the agent something",
        "• /memory — show what the agent currently remembers",
        "• /forget — wipe memory (with confirmation)",
        "",
        "Voice:",
        "• /character — show active character + list available",
        "• /character <name> — switch active character",
        "",
        "• /help — show this message",
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

  bot.command("history", async (ctx) => {
    const recent = await listPosted({ limit: 10 });
    if (recent.length === 0) {
      await ctx.reply("Nothing posted yet.");
      return;
    }
    const lines = recent.map(
      (p, i) =>
        `${i + 1}. [${p.postedAt.slice(0, 10)}] ${p.text}\n   https://x.com/i/web/status/${p.tweetId}`,
    );
    await ctx.reply(lines.join("\n\n"));
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
    const topic = ctx.match?.trim();
    if (!topic) {
      await ctx.reply(
        "Usage: /draft <topic>\nExample: /draft tokenization of ammo explained in 1 tweet",
      );
      return;
    }

    await ctx.replyWithChatAction("typing");

    let character: { name: string; content: string };
    try {
      character = await readActiveCharacter();
    } catch (err) {
      await ctx.reply((err as Error).message);
      return;
    }

    const [memory, recent] = await Promise.all([
      readMemory(),
      listPosted({ limit: 10 }),
    ]);
    const recentPosts = recent.map((p) => p.text);

    let set: DraftSet;
    try {
      set = await generateDrafts(topic, {
        character: character.content,
        memory,
        recentPosts,
      });
    } catch (err) {
      await ctx.reply(`LLM error: ${(err as Error).message}`);
      return;
    }

    rememberDraft(set);

    const body = [
      `Topic: ${set.topic}`,
      `Character: ${character.name}`,
      "",
      ...set.variants.map((v, i) => `${i + 1}. ${v}\n(${v.length} chars)`),
    ].join("\n\n");

    const kb = new InlineKeyboard()
      .text("Post 1", `approve:${set.id}:0`)
      .text("Post 2", `approve:${set.id}:1`)
      .text("Post 3", `approve:${set.id}:2`)
      .row()
      .text("Cancel", `cancel:${set.id}`);

    await ctx.reply(body, { reply_markup: kb });
  });

  bot.callbackQuery(/^approve:([a-z0-9]+):(\d)$/, async (ctx) => {
    const [, draftId, idxStr] = ctx.match;
    const idx = Number(idxStr);
    const set = getDraft(draftId!);
    if (!set) {
      await ctx.answerCallbackQuery({
        text: "Draft expired. Run /draft again.",
        show_alert: true,
      });
      return;
    }
    const text = set.variants[idx];
    if (!text) {
      await ctx.answerCallbackQuery({
        text: "Invalid choice.",
        show_alert: true,
      });
      return;
    }

    await ctx.answerCallbackQuery({ text: "Posting..." });

    try {
      const result = await postTweet(text);
      await appendPosted({
        tweetId: result.id,
        text,
        topic: set.topic,
        variantIdx: idx,
        approvedByTgUserId: ctx.from.id,
        postedAt: new Date().toISOString(),
      });
      drafts.delete(draftId!);
      const prefix = result.dryRun ? "DRY_RUN — would have posted:" : "Posted:";
      await ctx.editMessageText(`${prefix} ${result.url}\n\n${text}`);
    } catch (err) {
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
    console.error("[agent] grammY error:", err);
  });

  setInterval(sweepDrafts, 10 * 60 * 1000);

  return bot;
}
