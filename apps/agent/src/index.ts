import { env as _env } from "./env";
import { createBot } from "./bot";
import { logger } from "./logger";

async function main() {
  const bot = createBot();

  const shutdown = async () => {
    await logger.info("shutting down");
    console.log("[agent] Shutting down...");
    await bot.stop();
    process.exit(0);
  };
  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);

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
  void logger.error("fatal error", err);
  console.error("[agent] Fatal error:", err);
  process.exit(1);
});
