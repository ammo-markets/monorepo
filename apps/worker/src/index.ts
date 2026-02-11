import { pollOnce } from "./indexer";
import { client } from "./lib/client";
import { POLL_INTERVAL_MS } from "./lib/constants";

async function main() {
  console.log("[worker] Starting Ammo Exchange event indexer...");
  console.log(
    `[worker] Chain: ${client.chain?.name} (${client.chain?.id})`,
  );

  const blockNumber = await client.getBlockNumber();
  console.log(`[worker] Current block: ${blockNumber}`);

  // Run initial backfill from last cursor to current head
  console.log("[worker] Running initial backfill...");
  await pollOnce();
  console.log("[worker] Backfill complete.");

  // Start polling loop with overlap protection
  let isProcessing = false;

  const intervalId = setInterval(async () => {
    if (isProcessing) return;
    isProcessing = true;
    try {
      await pollOnce();
    } catch (error) {
      console.error("[worker] Polling error (will retry):", error);
    } finally {
      isProcessing = false;
    }
  }, POLL_INTERVAL_MS);

  console.log(
    `[worker] Polling every ${POLL_INTERVAL_MS / 1000}s for new events...`,
  );

  // Graceful shutdown on SIGTERM / SIGINT
  const shutdown = () => {
    console.log("[worker] Shutting down...");
    clearInterval(intervalId);
    process.exit(0);
  };

  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
}

main().catch((err) => {
  console.error("[worker] Fatal error:", err);
  process.exit(1);
});
