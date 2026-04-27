import { env as _env } from "./env";
import { createBot } from "./bot";

async function main() {
  const bot = createBot();

  const shutdown = async () => {
    console.log("[agent] Shutting down...");
    await bot.stop();
    process.exit(0);
  };
  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);

  console.log("[agent] Starting Telegram long-polling...");
  await bot.start({
    onStart: (me) => console.log(`[agent] Bot online as @${me.username}`),
  });
}

main().catch((err) => {
  console.error("[agent] Fatal error:", err);
  process.exit(1);
});
