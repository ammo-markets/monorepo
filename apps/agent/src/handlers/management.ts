import { InlineKeyboard, type Bot } from "grammy";
import {
  getActiveCharacterName,
  listCharacters,
  setActiveCharacter,
} from "../characters";
import { countDrafts } from "../drafts";
import { env } from "../env";
import { chunk, formatHistoryLine } from "../format";
import { appendToMemory, clearMemory, readMemory } from "../memory-store";
import { listPosted } from "../posted-store";
import { listTelegramHistory } from "../telegram-history-store";

export function registerManagementHandlers(bot: Bot): void {
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
        "/history - show recent command history",
        "/status - bot status",
      ].join("\n"),
    );
  });

  bot.command("history", async (ctx) => {
    const arg = ctx.match?.trim();
    const limit = Math.min(Math.max(Number(arg) || 20, 1), 50);
    const history = await listTelegramHistory({ limit });
    if (history.length === 0) {
      await ctx.reply("History is empty.");
      return;
    }
    for (const part of chunk(history.map(formatHistoryLine).join("\n"))) {
      await ctx.reply(part);
    }
  });

  bot.command("status", async (ctx) => {
    const [recent, memory, activeCharacter, pendingDrafts] = await Promise.all([
      listPosted({ limit: 5 }),
      readMemory(),
      getActiveCharacterName(),
      countDrafts(),
    ]);
    const memoryLines = memory
      ? memory.split("\n").filter((l) => l.startsWith("- [")).length
      : 0;
    const lines = [
      `Mode: manual (human-in-the-loop)${env.DRY_RUN ? " [DRY_RUN]" : ""}`,
      `Model: ${env.LLM_MODEL}`,
      `Active character: ${activeCharacter}`,
      `Pending drafts: ${pendingDrafts}`,
      `Memory entries: ${memoryLines}`,
      `Recent posts (last ${recent.length}):`,
      ...recent.map(
        (p) =>
          `• ${p.postedAt.slice(0, 16)} — https://x.com/i/web/status/${p.tweetId}`,
      ),
    ];
    await ctx.reply(lines.join("\n"));
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
}
