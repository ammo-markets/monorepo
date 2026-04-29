import { env } from "./env";
import { createBot } from "./bot";
import { logger } from "./logger";

let shuttingDown = false;

async function main() {
  const bot = createBot();

  console.log(
    `[agent] Allowed Telegram user IDs: ${env.TELEGRAM_ALLOWED_USER_IDS.join(", ")}`,
  );
  await logger.info("allowed user ids loaded", {
    ids: env.TELEGRAM_ALLOWED_USER_IDS,
    count: env.TELEGRAM_ALLOWED_USER_IDS.length,
  });

  const shutdown = async () => {
    if (shuttingDown) return;
    shuttingDown = true;
    await logger.info("shutting down");
    console.log("[agent] Shutting down...");
    await bot.stop();
    process.exit(0);
  };
  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);

  console.log("[agent] Verifying Telegram bot token...");
  await logger.info("verifying telegram bot token");
  const me = await bot.api.getMe();
  await logger.info("telegram getMe ok", { username: me.username, id: me.id });
  console.log(`[agent] Telegram token OK for @${me.username}`);

  await logger.info("registering telegram commands");
  await bot.api.setMyCommands([
    { command: "help", description: "Show available commands" },
    { command: "draft", description: "Create 3 tweet drafts for approval" },
    { command: "tweet", description: "Post exact copy" },
    { command: "remember", description: "Save brand facts or guidance" },
    { command: "memory", description: "Show saved memory" },
    { command: "forget", description: "Clear saved memory" },
    { command: "character", description: "Show or switch voice" },
    { command: "status", description: "Show bot status" },
  ]);
  await logger.info("telegram commands registered");

  console.log("[agent] Starting Telegram long-polling...");
  await logger.info("starting telegram long-polling");
  await bot.start({
    onStart: (me) => {
      void logger.info("bot online", { username: me.username });
      console.log(`[agent] Bot online as @${me.username}`);
    },
  });
}

main().catch((err) => {
  if (shuttingDown) return;
  void logger.error("fatal error", err);
  console.error("[agent] Fatal error:", err);
  process.exit(1);
});
