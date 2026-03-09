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
import { handleMinted } from "./handlers/mint";
import type { MintedArgs } from "./handlers/mint";
import {
  handleRedeemRequested,
  handleRedeemApproved,
  handleRedeemPaid,
  handleRedeemFinalized,
} from "./handlers/redeem";
import type {
  RedeemRequestedArgs,
  RedeemApprovedArgs,
  RedeemPaidArgs,
  RedeemFinalizedArgs,
} from "./handlers/redeem";
import { handleRedeemCanceled } from "./handlers/refund";
import type { RedeemCanceledArgs } from "./handlers/refund";
import {
  handlePaused,
  handleUnpaused,
  handleMintFeeUpdated,
  handleRedeemFeeUpdated,
  handleMinRedeemUpdated,
} from "./handlers/lifecycle";
import { prisma } from "@ammo-exchange/db";
import { CaliberMarketAbi } from "@ammo-exchange/contracts";
import { CALIBER_TO_PRISMA } from "@ammo-exchange/shared";
import type { Caliber } from "@ammo-exchange/shared";

// ── MarketConfig Seeding ─────────────────────────────────────────────

/**
 * Seed the MarketConfig table by reading current contract state for each
 * caliber market. Runs on worker startup when the table is empty.
 *
 * Uses multicall to batch-read mintFeeBps, redeemFeeBps, minRedeemAmount,
 * and paused state from every CaliberMarket contract in a single RPC call.
 */
export async function seedMarketConfig(): Promise<void> {
  const existing = await prisma.marketConfig.count();
  if (existing > 0) {
    console.log(`[indexer] MarketConfig already seeded (${existing} entries)`);
    return;
  }

  const { contracts: contractAddresses } = await import("./lib/chain");

  const calibers = Object.keys(contractAddresses.calibers) as Caliber[];

  // Build multicall contracts for all calibers
  const calls = calibers.flatMap((caliber) => {
    const address = contractAddresses.calibers[caliber].market;
    return [
      {
        address,
        abi: CaliberMarketAbi,
        functionName: "mintFeeBps" as const,
      },
      {
        address,
        abi: CaliberMarketAbi,
        functionName: "redeemFeeBps" as const,
      },
      {
        address,
        abi: CaliberMarketAbi,
        functionName: "minRedeemAmount" as const,
      },
      {
        address,
        abi: CaliberMarketAbi,
        functionName: "paused" as const,
      },
    ];
  });

  const results = await client.multicall({ contracts: calls });

  // Process results in groups of 4 (one per caliber)
  for (let i = 0; i < calibers.length; i++) {
    const caliber = calibers[i]!;
    const base = i * 4;
    const mintFeeBps = results[base]?.result as bigint | undefined;
    const redeemFeeBps = results[base + 1]?.result as bigint | undefined;
    const minRedeemAmount = results[base + 2]?.result as bigint | undefined;
    const paused = results[base + 3]?.result as boolean | undefined;

    // Convert minRedeemAmount from token amount (18 decimals) to rounds
    const minMintRounds = minRedeemAmount
      ? Number(minRedeemAmount / 10n ** 18n)
      : 50;

    await prisma.marketConfig.upsert({
      where: { caliber: CALIBER_TO_PRISMA[caliber] },
      create: {
        caliber: CALIBER_TO_PRISMA[caliber],
        mintFeeBps: mintFeeBps !== undefined ? Number(mintFeeBps) : 150,
        redeemFeeBps: redeemFeeBps !== undefined ? Number(redeemFeeBps) : 150,
        minMintRounds,
        paused: paused ?? false,
      },
      update: {
        mintFeeBps: mintFeeBps !== undefined ? Number(mintFeeBps) : 150,
        redeemFeeBps: redeemFeeBps !== undefined ? Number(redeemFeeBps) : 150,
        minMintRounds,
        paused: paused ?? false,
      },
    });
  }

  console.log(
    `[indexer] Seeded MarketConfig for ${calibers.length} calibers`,
  );
}

// ── Event Fetching ──────────────────────────────────────────────────

/**
 * Fetch all 8 event types from all CaliberMarket contracts in parallel.
 * Uses strict mode for typed event args.
 */
async function fetchEvents(fromBlock: bigint, toBlock: bigint) {
  const [
    minted,
    redeemRequested,
    redeemApproved,
    redeemPaid,
    redeemFinalized,
    redeemCanceled,
    paused,
    unpaused,
    mintFeeUpdated,
    redeemFeeUpdated,
    minRedeemUpdated,
  ] = await Promise.all([
    client.getContractEvents({
      abi: CaliberMarketAbi,
      address: MARKET_ADDRESSES,
      eventName: "Minted",
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
      eventName: "RedeemApproved",
      fromBlock,
      toBlock,
      strict: true,
    }),
    client.getContractEvents({
      abi: CaliberMarketAbi,
      address: MARKET_ADDRESSES,
      eventName: "RedeemPaid",
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
      eventName: "MinRedeemUpdated",
      fromBlock,
      toBlock,
      strict: true,
    }),
  ]);

  return {
    minted,
    redeemRequested,
    redeemApproved,
    redeemPaid,
    redeemFinalized,
    redeemCanceled,
    paused,
    unpaused,
    mintFeeUpdated,
    redeemFeeUpdated,
    minRedeemUpdated,
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
    ...events.minted.map((e) => ({
      ...e,
      eventName: "Minted" as const,
    })),
    ...events.redeemRequested.map((e) => ({
      ...e,
      eventName: "RedeemRequested" as const,
    })),
    ...events.redeemApproved.map((e) => ({
      ...e,
      eventName: "RedeemApproved" as const,
    })),
    ...events.redeemPaid.map((e) => ({
      ...e,
      eventName: "RedeemPaid" as const,
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
    ...events.minRedeemUpdated.map((e) => ({
      ...e,
      eventName: "MinRedeemUpdated" as const,
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
          case "Minted":
            await handleMinted(
              tx,
              event.args as unknown as MintedArgs,
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
          case "RedeemApproved":
            await handleRedeemApproved(
              tx,
              event.args as unknown as RedeemApprovedArgs,
              meta,
            );
            break;
          case "RedeemPaid":
            await handleRedeemPaid(
              tx,
              event.args as unknown as RedeemPaidArgs,
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
          case "RedeemCanceled":
            await handleRedeemCanceled(
              tx,
              event.args as unknown as RedeemCanceledArgs,
              meta,
            );
            break;
          case "Paused":
            await handlePaused(tx, meta, event.args as unknown as { by: `0x${string}` });
            break;
          case "Unpaused":
            await handleUnpaused(
              tx, meta,
              event.args as unknown as { by: `0x${string}` },
            );
            break;
          case "MintFeeUpdated":
            await handleMintFeeUpdated(
              tx, meta,
              event.args as unknown as { oldBps: bigint; newBps: bigint },
            );
            break;
          case "RedeemFeeUpdated":
            await handleRedeemFeeUpdated(
              tx, meta,
              event.args as unknown as { oldBps: bigint; newBps: bigint },
            );
            break;
          case "MinRedeemUpdated":
            await handleMinRedeemUpdated(
              tx, meta,
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
    `[indexer] Processed ${allEvents.length} events (blocks ${events.minted[0]?.blockNumber ?? lastBlock}..${lastBlock})`,
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
      events.minted.length +
      events.redeemRequested.length +
      events.redeemApproved.length +
      events.redeemPaid.length +
      events.redeemFinalized.length +
      events.redeemCanceled.length +
      events.paused.length +
      events.unpaused.length +
      events.mintFeeUpdated.length +
      events.redeemFeeUpdated.length +
      events.minRedeemUpdated.length;

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
