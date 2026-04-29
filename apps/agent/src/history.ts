import type { Context } from "grammy";
import { logger } from "./logger";
import { appendTelegramHistory } from "./telegram-history-store";
import { hasTelegramMedia, parseCommandText } from "./telegram";

export async function recordTelegramHistory(
  ctx: Context,
  authorized: boolean,
): Promise<void> {
  const user = ctx.from;
  const base = {
    timestamp: new Date().toISOString(),
    authorized,
    tgUserId: user?.id,
    tgUsername: user?.username,
    chatId: ctx.chat?.id,
  };

  const message = ctx.message;
  if (message) {
    const text =
      "text" in message
        ? message.text
        : "caption" in message
          ? message.caption
          : undefined;
    const parsed = text ? parseCommandText(text) : null;
    if (!parsed) return;
    await appendTelegramHistory({
      ...base,
      kind: "command",
      command: parsed.command,
      args: parsed.args,
      messageId: message.message_id,
      hasMedia: hasTelegramMedia(ctx),
    });
    return;
  }

  const callbackData = ctx.callbackQuery?.data;
  if (callbackData) {
    await appendTelegramHistory({
      ...base,
      kind: "callback",
      callbackData,
      messageId: ctx.callbackQuery?.message?.message_id,
      hasMedia: false,
    });
  }
}

export async function recordHistorySafely(
  ctx: Context,
  authorized: boolean,
): Promise<void> {
  await recordTelegramHistory(ctx, authorized).catch((err) =>
    logger.error("telegram history write failed", err),
  );
}
