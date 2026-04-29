import type { Bot } from "grammy";
import { deleteDraft, getDraft } from "../drafts";
import { logger } from "../logger";
import { appendPosted } from "../posted-store";
import { postTweet, validateTweetText } from "../twitter";

export function registerApprovalHandlers(bot: Bot): void {
  bot.callbackQuery(/^approve:([a-z0-9]+):(\d)$/, async (ctx) => {
    const [, draftId, idxStr] = ctx.match;
    const idx = Number(idxStr);
    const draft = await getDraft(draftId!);
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
      await deleteDraft(draftId!);
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
    await deleteDraft(draftId!);
    await ctx.answerCallbackQuery({ text: "Cancelled." });
    await ctx.editMessageText("Draft cancelled.");
  });
}
