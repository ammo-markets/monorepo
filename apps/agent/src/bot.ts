import { Bot } from "grammy";
import { startDraftSweeper } from "./drafts";
import { env } from "./env";
import { registerManagementHandlers } from "./handlers/management";
import { registerMarketingHandlers } from "./handlers/marketing";
import { recordHistorySafely } from "./history";
import { logger } from "./logger";

const ALLOWED = new Set(env.TELEGRAM_ALLOWED_USER_IDS);

export function createBot(): Bot {
  const bot = new Bot(env.TELEGRAM_BOT_TOKEN);

  bot.use(async (ctx, next) => {
    const userId = ctx.from?.id;
    const authorized = !!userId && ALLOWED.has(userId);
    await recordHistorySafely(ctx, authorized);
    if (!authorized) {
      await logger.warn("unauthorized telegram update", {
        userId,
        chatId: ctx.chat?.id,
      });
      if (ctx.chat) await ctx.reply("Not authorized.");
      return;
    }
    await next();
  });

  registerManagementHandlers(bot);
  registerMarketingHandlers(bot);

  bot.catch((err) => {
    void logger.error("grammy error", err.error);
    console.error("[agent] grammY error:", err);
  });

  startDraftSweeper();

  return bot;
}
