// Import env first to fail fast on missing variables before any other work
import { env as _env } from "./lib/env";

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

  // Shutdown coordination
  let isShuttingDown = false;
  let currentPoll: Promise<void> | null = null;

  // Run initial backfill from last cursor to current head
  console.log("[worker] Running initial backfill...");
  await pollOnce();
  if (isShuttingDown) {
    console.log("[worker] Shutdown requested during backfill. Exiting.");
    process.exit(0);
  }
  console.log("[worker] Backfill complete.");

  // Start polling loop with overlap protection
  let isProcessing = false;

  const intervalId = setInterval(async () => {
    if (isProcessing || isShuttingDown) return;
    isProcessing = true;
    try {
      currentPoll = pollOnce();
      await currentPoll;
    } catch (error) {
      console.error("[worker] Polling error (will retry):", error);
    } finally {
      currentPoll = null;
      isProcessing = false;
    }
  }, POLL_INTERVAL_MS);

  console.log(
    `[worker] Polling every ${POLL_INTERVAL_MS / 1000}s for new events...`,
  );

  // Graceful shutdown on SIGTERM / SIGINT -- drains in-flight work
  const shutdown = async () => {
    if (isShuttingDown) return; // Prevent double-shutdown
    isShuttingDown = true;
    console.log("[worker] Shutting down -- draining in-flight work...");
    clearInterval(intervalId);

    // Wait for current poll cycle to complete
    if (currentPoll) {
      try {
        await currentPoll;
        console.log("[worker] In-flight poll completed.");
      } catch (error) {
        console.error("[worker] In-flight poll failed during shutdown:", error);
      }
    }

    console.log("[worker] Shutdown complete.");
    process.exit(0);
  };

  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
}

main().catch((err) => {
  console.error("[worker] Fatal error:", err);
  process.exit(1);
});
