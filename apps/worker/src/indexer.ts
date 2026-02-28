import { client } from "./lib/client";
import {
  BATCH_SIZE,
  CONFIRMATION_BLOCKS,
  MARKET_ADDRESSES,
  CURSOR_KEY,
  DEPLOYMENT_BLOCK,
  CHAIN_ID,
} from "./lib/constants";
import type { EventMeta } from "./lib/constants";
import { getCursor, upsertCursor } from "./lib/cursor";
import { handleMintStarted, handleMintFinalized } from "./handlers/mint";
import type { MintStartedArgs, MintFinalizedArgs } from "./handlers/mint";
import {
  handleRedeemRequested,
  handleRedeemFinalized,
} from "./handlers/redeem";
import type {
  RedeemRequestedArgs,
  RedeemFinalizedArgs,
} from "./handlers/redeem";
import { handleMintRefunded, handleRedeemCanceled } from "./handlers/refund";
import type { MintRefundedArgs, RedeemCanceledArgs } from "./handlers/refund";
import {
  handlePaused,
  handleUnpaused,
  handleMintFeeUpdated,
  handleRedeemFeeUpdated,
  handleMinMintUpdated,
} from "./handlers/lifecycle";
import { prisma } from "@ammo-exchange/db";
import { CaliberMarketAbi } from "@ammo-exchange/contracts";

// ── Event Fetching ──────────────────────────────────────────────────

/**
 * Fetch all 9 event types from all CaliberMarket contracts in parallel.
 * Uses strict mode for typed event args.
 */
async function fetchEvents(fromBlock: bigint, toBlock: bigint) {
  const [
    mintStarted,
    mintFinalized,
    mintRefunded,
    redeemRequested,
    redeemFinalized,
    redeemCanceled,
    paused,
    unpaused,
    mintFeeUpdated,
    redeemFeeUpdated,
    minMintUpdated,
  ] = await Promise.all([
    client.getContractEvents({
      abi: CaliberMarketAbi,
      address: MARKET_ADDRESSES,
      eventName: "MintStarted",
      fromBlock,
      toBlock,
      strict: true,
    }),
    client.getContractEvents({
      abi: CaliberMarketAbi,
      address: MARKET_ADDRESSES,
      eventName: "MintFinalized",
      fromBlock,
      toBlock,
      strict: true,
    }),
    client.getContractEvents({
      abi: CaliberMarketAbi,
      address: MARKET_ADDRESSES,
      eventName: "MintRefunded",
      fromBlock,
      toBlock,
      strict: true,
    }),
    client.getContractEvents({
      abi: CaliberMarketAbi,
      address: MARKET_ADDRESSES,
      eventName: "RedeemRequested",
      fromBlock,
      toBlock,
      strict: true,
    }),
    client.getContractEvents({
      abi: CaliberMarketAbi,
      address: MARKET_ADDRESSES,
      eventName: "RedeemFinalized",
      fromBlock,
      toBlock,
      strict: true,
    }),
    client.getContractEvents({
      abi: CaliberMarketAbi,
      address: MARKET_ADDRESSES,
      eventName: "RedeemCanceled",
      fromBlock,
      toBlock,
      strict: true,
    }),
    client.getContractEvents({
      abi: CaliberMarketAbi,
      address: MARKET_ADDRESSES,
      eventName: "Paused",
      fromBlock,
      toBlock,
      strict: true,
    }),
    client.getContractEvents({
      abi: CaliberMarketAbi,
      address: MARKET_ADDRESSES,
      eventName: "Unpaused",
      fromBlock,
      toBlock,
      strict: true,
    }),
    client.getContractEvents({
      abi: CaliberMarketAbi,
      address: MARKET_ADDRESSES,
      eventName: "MintFeeUpdated",
      fromBlock,
      toBlock,
      strict: true,
    }),
    client.getContractEvents({
      abi: CaliberMarketAbi,
      address: MARKET_ADDRESSES,
      eventName: "RedeemFeeUpdated",
      fromBlock,
      toBlock,
      strict: true,
    }),
    client.getContractEvents({
      abi: CaliberMarketAbi,
      address: MARKET_ADDRESSES,
      eventName: "MinMintUpdated",
      fromBlock,
      toBlock,
      strict: true,
    }),
  ]);

  return {
    mintStarted,
    mintFinalized,
    mintRefunded,
    redeemRequested,
    redeemFinalized,
    redeemCanceled,
    paused,
    unpaused,
    mintFeeUpdated,
    redeemFeeUpdated,
    minMintUpdated,
  };
}

type FetchedEvents = Awaited<ReturnType<typeof fetchEvents>>;

// ── Event Processing ────────────────────────────────────────────────

/**
 * Process all fetched events in block order within a single Prisma
 * interactive transaction. Advances the cursor atomically after all
 * events are committed.
 */
async function processAndCommit(
  events: FetchedEvents,
  lastBlock: bigint,
): Promise<void> {
  // Combine all event arrays with a common shape for sorting
  const allEvents = [
    ...events.mintStarted.map((e) => ({
      ...e,
      eventName: "MintStarted" as const,
    })),
    ...events.mintFinalized.map((e) => ({
      ...e,
      eventName: "MintFinalized" as const,
    })),
    ...events.mintRefunded.map((e) => ({
      ...e,
      eventName: "MintRefunded" as const,
    })),
    ...events.redeemRequested.map((e) => ({
      ...e,
      eventName: "RedeemRequested" as const,
    })),
    ...events.redeemFinalized.map((e) => ({
      ...e,
      eventName: "RedeemFinalized" as const,
    })),
    ...events.redeemCanceled.map((e) => ({
      ...e,
      eventName: "RedeemCanceled" as const,
    })),
    ...events.paused.map((e) => ({ ...e, eventName: "Paused" as const })),
    ...events.unpaused.map((e) => ({ ...e, eventName: "Unpaused" as const })),
    ...events.mintFeeUpdated.map((e) => ({
      ...e,
      eventName: "MintFeeUpdated" as const,
    })),
    ...events.redeemFeeUpdated.map((e) => ({
      ...e,
      eventName: "RedeemFeeUpdated" as const,
    })),
    ...events.minMintUpdated.map((e) => ({
      ...e,
      eventName: "MinMintUpdated" as const,
    })),
  ];

  // Sort by blockNumber ascending, then logIndex ascending
  allEvents.sort((a, b) => {
    const blockDiff = Number(a.blockNumber - b.blockNumber);
    if (blockDiff !== 0) return blockDiff;
    return a.logIndex - b.logIndex;
  });

  // Batch-fetch block timestamps for all unique blocks with events
  const uniqueBlockNumbers = [...new Set(allEvents.map((e) => e.blockNumber))];
  const blocks = await Promise.all(
    uniqueBlockNumbers.map((bn) => client.getBlock({ blockNumber: bn })),
  );
  const blockTimestamps = new Map<bigint, Date>(
    blocks.map((b) => [b.number, new Date(Number(b.timestamp) * 1000)]),
  );

  await prisma.$transaction(
    async (tx) => {
      for (const event of allEvents) {
        const meta: EventMeta = {
          address: event.address,
          transactionHash: event.transactionHash!,
          blockNumber: event.blockNumber,
          logIndex: event.logIndex,
          blockTimestamp: blockTimestamps.get(event.blockNumber)!,
        };

        switch (event.eventName) {
          case "MintStarted":
            await handleMintStarted(
              tx,
              event.args as unknown as MintStartedArgs,
              meta,
            );
            break;
          case "MintFinalized":
            await handleMintFinalized(
              tx,
              event.args as unknown as MintFinalizedArgs,
              meta,
            );
            break;
          case "RedeemRequested":
            await handleRedeemRequested(
              tx,
              event.args as unknown as RedeemRequestedArgs,
              meta,
            );
            break;
          case "RedeemFinalized":
            await handleRedeemFinalized(
              tx,
              event.args as unknown as RedeemFinalizedArgs,
              meta,
            );
            break;
          case "MintRefunded":
            await handleMintRefunded(
              tx,
              event.args as unknown as MintRefundedArgs,
              meta,
            );
            break;
          case "RedeemCanceled":
            await handleRedeemCanceled(
              tx,
              event.args as unknown as RedeemCanceledArgs,
              meta,
            );
            break;
          case "Paused":
            handlePaused(meta, event.args as unknown as { by: `0x${string}` });
            break;
          case "Unpaused":
            handleUnpaused(
              meta,
              event.args as unknown as { by: `0x${string}` },
            );
            break;
          case "MintFeeUpdated":
            handleMintFeeUpdated(
              meta,
              event.args as unknown as { oldBps: bigint; newBps: bigint },
            );
            break;
          case "RedeemFeeUpdated":
            handleRedeemFeeUpdated(
              meta,
              event.args as unknown as { oldBps: bigint; newBps: bigint },
            );
            break;
          case "MinMintUpdated":
            handleMinMintUpdated(
              meta,
              event.args as unknown as { oldMin: bigint; newMin: bigint },
            );
            break;
        }
      }

      // Atomically advance the cursor within the same transaction
      await upsertCursor(tx, lastBlock);
    },
    { timeout: 30_000 },
  );

  console.log(
    `[indexer] Processed ${allEvents.length} events (blocks ${events.mintStarted[0]?.blockNumber ?? lastBlock}..${lastBlock})`,
  );
}

// ── Polling ─────────────────────────────────────────────────────────

/**
 * Poll once: fetch all events from the last cursor position to the
 * current block head, processing in batches of BATCH_SIZE.
 *
 * Used for both initial backfill and recurring polling ticks.
 */
export async function pollOnce(): Promise<void> {
  const currentBlock = await client.getBlockNumber();

  const cursor = await prisma.blockCursor.findUnique({
    where: { contractAddress: CURSOR_KEY },
  });

  // Roll back cursor by CONFIRMATION_BLOCKS to re-process recent blocks.
  // This catches shallow reorgs where events may have been added or removed.
  // Idempotent handlers (txHash-based upsert) make re-processing safe.
  const rawFrom = (cursor?.lastBlock ?? 0n) + 1n;
  const reorgSafeFrom =
    rawFrom > CONFIRMATION_BLOCKS ? rawFrom - CONFIRMATION_BLOCKS : rawFrom;
  const fromBlock =
    reorgSafeFrom < DEPLOYMENT_BLOCK ? DEPLOYMENT_BLOCK : reorgSafeFrom;

  if (fromBlock > currentBlock) {
    console.log(
      `[indexer] Caught up (cursor=${cursor?.lastBlock ?? 0n}, head=${currentBlock})`,
    );
    return;
  }

  let batchStart = fromBlock;
  let totalEventsProcessed = 0;

  while (batchStart <= currentBlock) {
    const batchEnd =
      batchStart + BATCH_SIZE - 1n > currentBlock
        ? currentBlock
        : batchStart + BATCH_SIZE - 1n;

    const totalBlocks = Number(currentBlock - fromBlock + 1n);
    const scannedBlocks = Number(batchStart - fromBlock);
    const progressPct =
      totalBlocks > 0 ? Math.floor((scannedBlocks / totalBlocks) * 100) : 100;
    console.log(
      `[indexer] Scanning batch ${batchStart}..${batchEnd} (${progressPct}% complete, ${totalEventsProcessed} events found)`,
    );

    const events = await fetchEvents(batchStart, batchEnd);
    const totalEvents =
      events.mintStarted.length +
      events.mintFinalized.length +
      events.mintRefunded.length +
      events.redeemRequested.length +
      events.redeemFinalized.length +
      events.redeemCanceled.length +
      events.paused.length +
      events.unpaused.length +
      events.mintFeeUpdated.length +
      events.redeemFeeUpdated.length +
      events.minMintUpdated.length;

    if (totalEvents > 0) {
      await processAndCommit(events, batchEnd);
      totalEventsProcessed += totalEvents;
    } else {
      // No events in this range -- still advance the cursor so we don't
      // re-scan empty blocks on next tick
      await prisma.blockCursor.upsert({
        where: { contractAddress: CURSOR_KEY },
        create: {
          contractAddress: CURSOR_KEY,
          chainId: CHAIN_ID,
          lastBlock: batchEnd,
        },
        update: { lastBlock: batchEnd },
      });
    }

    batchStart = batchEnd + 1n;
  }

  const blocksScanned = Number(currentBlock - fromBlock + 1n);
  console.log(
    `[indexer] Backfill complete: ${blocksScanned.toLocaleString()} blocks scanned (${fromBlock}..${currentBlock}), ${totalEventsProcessed} events found`,
  );
}
