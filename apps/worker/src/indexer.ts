import { client } from "./lib/client";
import {
  BATCH_SIZE,
  MARKET_ADDRESSES,
  CURSOR_KEY,
  DEPLOYMENT_BLOCK,
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
import { prisma } from "@ammo-exchange/db";
import { CaliberMarketAbi } from "@ammo-exchange/contracts";

// ── Event Fetching ──────────────────────────────────────────────────

/**
 * Fetch all 4 event types from all CaliberMarket contracts in parallel.
 * Uses strict mode for typed event args.
 */
async function fetchEvents(fromBlock: bigint, toBlock: bigint) {
  const [mintStarted, mintFinalized, redeemRequested, redeemFinalized] =
    await Promise.all([
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
    ]);

  return { mintStarted, mintFinalized, redeemRequested, redeemFinalized };
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
    ...events.mintStarted.map((e) => ({ ...e, eventName: "MintStarted" as const })),
    ...events.mintFinalized.map((e) => ({ ...e, eventName: "MintFinalized" as const })),
    ...events.redeemRequested.map((e) => ({ ...e, eventName: "RedeemRequested" as const })),
    ...events.redeemFinalized.map((e) => ({ ...e, eventName: "RedeemFinalized" as const })),
  ];

  // Sort by blockNumber ascending, then logIndex ascending
  allEvents.sort((a, b) => {
    const blockDiff = Number(a.blockNumber - b.blockNumber);
    if (blockDiff !== 0) return blockDiff;
    return a.logIndex - b.logIndex;
  });

  await prisma.$transaction(
    async (tx) => {
      for (const event of allEvents) {
        const meta: EventMeta = {
          address: event.address,
          transactionHash: event.transactionHash!,
          blockNumber: event.blockNumber,
          logIndex: event.logIndex,
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

  // Use deployment block as floor -- never scan before contracts existed
  const rawFrom = (cursor?.lastBlock ?? 0n) + 1n;
  const fromBlock = rawFrom < DEPLOYMENT_BLOCK ? DEPLOYMENT_BLOCK : rawFrom;

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
    const progressPct = totalBlocks > 0 ? Math.floor((scannedBlocks / totalBlocks) * 100) : 100;
    console.log(
      `[indexer] Scanning batch ${batchStart}..${batchEnd} (${progressPct}% complete, ${totalEventsProcessed} events found)`
    );

    const events = await fetchEvents(batchStart, batchEnd);
    const totalEvents =
      events.mintStarted.length +
      events.mintFinalized.length +
      events.redeemRequested.length +
      events.redeemFinalized.length;

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
          chainId: 43113,
          lastBlock: batchEnd,
        },
        update: { lastBlock: batchEnd },
      });
    }

    batchStart = batchEnd + 1n;
  }

  const blocksScanned = Number(currentBlock - fromBlock + 1n);
  console.log(
    `[indexer] Backfill complete: ${blocksScanned.toLocaleString()} blocks scanned (${fromBlock}..${currentBlock}), ${totalEventsProcessed} events found`
  );
}
