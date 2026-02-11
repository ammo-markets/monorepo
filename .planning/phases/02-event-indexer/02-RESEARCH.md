# Phase 2: Event Indexer - Research

**Researched:** 2026-02-11
**Domain:** viem event polling, Prisma transactional writes, blockchain event indexer architecture, Bun long-running process
**Confidence:** HIGH

## Summary

Phase 2 builds a polling-based event indexer in the existing `apps/worker` that detects four event types (MintStarted, MintFinalized, RedeemRequested, RedeemFinalized) across all four CaliberMarket contracts on Avalanche Fuji, and persists them as Order records in the database with crash-recovery via BlockCursor checkpointing.

The core pattern is straightforward: on startup, read the last processed block from BlockCursor, backfill all events from that block to the current head, then enter a polling loop that fetches new events every N seconds. Each batch of events is processed inside a Prisma interactive transaction that atomically writes/updates Order records and advances the BlockCursor. viem's `getContractEvents` supports an array of addresses, meaning all four CaliberMarket contracts can be queried in a single RPC call per event type. Avalanche Fuji's eth_getLogs supports up to 2,048 blocks per request (public RPC limit), and blocks finalize in approximately 1 second with no practical reorg risk, eliminating the need for confirmation block delays.

Key design decisions: (1) Use `getContractEvents` with `fromBlock`/`toBlock` for explicit block ranges rather than `watchContractEvent` which is WebSocket-based. (2) Process events in block-number order to maintain causal ordering. (3) Use Prisma interactive transactions to atomically upsert Order records and update BlockCursor in a single database transaction. (4) Create User records on-the-fly via `connectOrCreate` since the worker discovers wallet addresses from events before users have accounts. (5) Store `onChainOrderId` as a composite key of `caliber:orderId` since order IDs are per-contract, not globally unique.

**Primary recommendation:** Build a single polling loop that fetches all four event types from all four contracts per tick, processes them in block order within a Prisma transaction, and advances BlockCursor atomically after each batch.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| viem | ^2.23.2 | `getContractEvents` for polling, `createPublicClient` for RPC | Already installed in worker, provides typed event decoding from ABI |
| Prisma Client | 7.3.0 | Interactive transactions for atomic writes | Already installed via @ammo-exchange/db, supports `$transaction` with upsert |
| Bun | latest | Runtime for long-running worker process | Already configured as worker runtime, supports `setInterval` natively |
| @ammo-exchange/contracts | workspace:* | CaliberMarketAbi for typed event decoding | Already installed, exports `as const` ABIs for viem type inference |
| @ammo-exchange/shared | workspace:* | CONTRACT_ADDRESSES, CALIBER_TO_PRISMA mappings | Already installed, has Fuji addresses and caliber mappings |
| @ammo-exchange/db | workspace:* | Prisma client singleton, generated types | Already installed, exports `prisma` and all Prisma types |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| viem/chains | (bundled with viem) | `avalancheFuji` chain definition | Worker client must target Fuji (chain ID 43113), not mainnet |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Manual polling loop | viem `watchContractEvent` | watchContractEvent uses WebSocket or falls back to polling internally; manual loop gives explicit control over block ranges, batch sizes, and cursor management |
| Per-contract cursors | Single global cursor | Per-contract cursors allow independent progress per market, but adds complexity. Since all 4 contracts are queried together, a single cursor tracking the lowest processed block is simpler and sufficient |

**Installation:**
No new packages needed. All dependencies are already installed in `apps/worker/package.json`.

## Architecture Patterns

### Recommended Project Structure

```
apps/worker/src/
  index.ts               # MODIFIED - entry point, startup + polling loop
  indexer.ts              # NEW - core indexer logic (backfill, poll, processEvents)
  handlers/
    mint.ts               # NEW - MintStarted + MintFinalized event handlers
    redeem.ts             # NEW - RedeemRequested + RedeemFinalized event handlers
  lib/
    client.ts             # NEW - viem public client configured for Fuji
    cursor.ts             # NEW - BlockCursor read/write helpers
    constants.ts          # NEW - polling interval, batch size, market addresses array
```

### Pattern 1: Polling Loop with Block Cursor

**What:** A `setInterval`-based loop that fetches events from `lastBlock + 1` to `currentBlock`, processes them, and updates the cursor atomically.

**When to use:** Any polling-based blockchain event indexer that must survive restarts without missing or duplicating events.

**Example:**
```typescript
// Source: viem docs (https://v1.viem.sh/docs/contract/getContractEvents.html)
// + Prisma interactive transactions (https://www.prisma.io/docs/orm/prisma-client/queries/transactions)

import { createPublicClient, http } from "viem";
import { avalancheFuji } from "viem/chains";
import { CaliberMarketAbi } from "@ammo-exchange/contracts";
import { prisma } from "@ammo-exchange/db";
import { CONTRACT_ADDRESSES } from "@ammo-exchange/shared";

const POLL_INTERVAL_MS = 4_000; // ~2 Avalanche blocks per tick
const BATCH_SIZE = 2_000n;      // Max blocks per getContractEvents call

const client = createPublicClient({
  chain: avalancheFuji,
  transport: http(process.env.FUJI_RPC_URL),
});

// All 4 CaliberMarket addresses as an array for multi-address query
const MARKET_ADDRESSES = Object.values(CONTRACT_ADDRESSES.fuji.calibers)
  .map((c) => c.market);

async function pollEvents() {
  const currentBlock = await client.getBlockNumber();
  const cursor = await prisma.blockCursor.findUnique({
    where: { contractAddress: "all-markets" },
  });
  const fromBlock = (cursor?.lastBlock ?? 0n) + 1n;

  if (fromBlock > currentBlock) return; // already caught up

  // Process in batches to respect RPC limits
  let batchStart = fromBlock;
  while (batchStart <= currentBlock) {
    const batchEnd = batchStart + BATCH_SIZE - 1n > currentBlock
      ? currentBlock
      : batchStart + BATCH_SIZE - 1n;

    // Fetch all event types in parallel for this block range
    const [mintStarted, mintFinalized, redeemRequested, redeemFinalized] =
      await Promise.all([
        client.getContractEvents({
          abi: CaliberMarketAbi,
          address: MARKET_ADDRESSES,
          eventName: "MintStarted",
          fromBlock: batchStart,
          toBlock: batchEnd,
        }),
        client.getContractEvents({
          abi: CaliberMarketAbi,
          address: MARKET_ADDRESSES,
          eventName: "MintFinalized",
          fromBlock: batchStart,
          toBlock: batchEnd,
        }),
        client.getContractEvents({
          abi: CaliberMarketAbi,
          address: MARKET_ADDRESSES,
          eventName: "RedeemRequested",
          fromBlock: batchStart,
          toBlock: batchEnd,
        }),
        client.getContractEvents({
          abi: CaliberMarketAbi,
          address: MARKET_ADDRESSES,
          eventName: "RedeemFinalized",
          fromBlock: batchStart,
          toBlock: batchEnd,
        }),
      ]);

    // Process events and update cursor atomically
    await processAndCommit(
      [...mintStarted, ...mintFinalized, ...redeemRequested, ...redeemFinalized],
      batchEnd
    );

    batchStart = batchEnd + 1n;
  }
}
```

### Pattern 2: Atomic Event Processing with Prisma Interactive Transaction

**What:** Process all events from a batch inside a single Prisma `$transaction` that upserts Order records and updates BlockCursor. If any operation fails, the entire batch rolls back, preventing partial processing.

**When to use:** Any event indexer that must guarantee exactly-once processing semantics.

**Example:**
```typescript
// Source: Prisma docs (https://www.prisma.io/docs/orm/prisma-client/queries/transactions)

async function processAndCommit(events: EventLog[], lastBlock: bigint) {
  // Sort by block number then log index for causal ordering
  events.sort((a, b) => {
    if (a.blockNumber !== b.blockNumber)
      return Number(a.blockNumber - b.blockNumber);
    return Number(a.logIndex - b.logIndex);
  });

  await prisma.$transaction(async (tx) => {
    for (const event of events) {
      await processEvent(tx, event);
    }

    // Advance cursor
    await tx.blockCursor.upsert({
      where: { contractAddress: "all-markets" },
      create: {
        contractAddress: "all-markets",
        chainId: 43113,
        lastBlock,
      },
      update: { lastBlock },
    });
  });
}
```

### Pattern 3: User Creation via connectOrCreate

**What:** When processing an event, use Prisma's `connectOrCreate` to automatically create a User record if one doesn't exist for the wallet address. This handles the case where events arrive for wallets that haven't been seen before.

**When to use:** Event-driven workers that discover users from on-chain events rather than explicit registration.

**Example:**
```typescript
// Source: Prisma docs (https://www.prisma.io/docs/orm/prisma-client/queries/relation-queries)

async function handleMintStarted(tx: PrismaTransaction, event: MintStartedLog) {
  const { orderId, user, usdcAmount, requestPrice, minTokensOut, deadline } = event.args;
  const caliber = addressToCaliber(event.address);

  await tx.order.upsert({
    where: {
      // Composite uniqueness: caliber + onChainOrderId
      // Since onChainOrderId is per-contract, not global
      txHash: event.transactionHash,
    },
    create: {
      type: "MINT",
      status: "PENDING",
      caliber: CALIBER_TO_PRISMA[caliber],
      amount: usdcAmount,
      onChainOrderId: orderId.toString(),
      walletAddress: user,
      txHash: event.transactionHash,
      chainId: 43113,
      user: {
        connectOrCreate: {
          where: { walletAddress: user },
          create: { walletAddress: user },
        },
      },
    },
    update: {}, // No-op if already exists (idempotent)
  });
}
```

### Pattern 4: Address-to-Caliber Reverse Lookup

**What:** Map a contract address back to its caliber identifier so events from different market contracts are correctly tagged.

**When to use:** When processing events from multiple contracts that share the same ABI.

**Example:**
```typescript
// Source: Existing CONTRACT_ADDRESSES config

import { CONTRACT_ADDRESSES, CALIBER_TO_PRISMA } from "@ammo-exchange/shared";
import type { Caliber } from "@ammo-exchange/shared";

// Build reverse lookup: address -> caliber
const ADDRESS_TO_CALIBER: Record<string, Caliber> = {};
for (const [caliber, addrs] of Object.entries(CONTRACT_ADDRESSES.fuji.calibers)) {
  ADDRESS_TO_CALIBER[addrs.market.toLowerCase()] = caliber as Caliber;
}

function addressToCaliber(address: string): Caliber {
  const caliber = ADDRESS_TO_CALIBER[address.toLowerCase()];
  if (!caliber) throw new Error(`Unknown market address: ${address}`);
  return caliber;
}
```

### Anti-Patterns to Avoid

- **Processing events outside a transaction:** If you write Order records but crash before updating BlockCursor, the next startup will re-fetch and re-process the same events. Always write events AND cursor atomically in one transaction.
- **Using `watchContractEvent` for the polling worker:** The roadmap explicitly decided on polling-based `getContractEvents` over `watchContractEvent` for reliability. `watchContractEvent` uses WebSocket subscriptions (or internal polling) which can silently drop events on reconnect.
- **Separate BlockCursor per contract:** The phase 1 schema has `contractAddress` as unique key. Since all 4 markets are queried with the same block range, use a single cursor row (e.g., `contractAddress: "all-markets"`) to avoid complex coordination across 4 independent cursors.
- **Not sorting events before processing:** Events from `getContractEvents` may not be in strict block+logIndex order when querying multiple addresses. Always sort before processing to ensure MintStarted is processed before MintFinalized for the same order.
- **Blocking the polling loop with large backfills:** On first startup or after long downtime, the backfill may span thousands of blocks. Process in batches of 2,000 blocks (the public RPC limit) and commit after each batch to provide incremental progress and avoid memory issues.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Event decoding | Manual topic/data parsing | viem `getContractEvents` with ABI | ABI-driven type inference, handles indexed vs. non-indexed args automatically |
| Atomic cursor + writes | Two separate DB calls | Prisma `$transaction` (interactive) | Prevents partial processing on crash -- cursor only advances if all writes succeed |
| User auto-creation | Check-then-create pattern | Prisma `connectOrCreate` | Race-condition-free, single operation, handles concurrent event processing |
| Block range pagination | Custom retry/pagination logic | Simple while loop with `BATCH_SIZE` constant | Avalanche public RPC limit is 2,048 blocks; a 2,000-block batch is safe and simple |
| Caliber address mapping | Hardcoded switch statement | Computed reverse lookup from `CONTRACT_ADDRESSES` | Stays in sync when addresses change, single source of truth |

**Key insight:** viem's `getContractEvents` + Prisma interactive transactions handle 90% of the complexity. The indexer logic itself is glue code: fetch events, map to database records, commit atomically.

## Common Pitfalls

### Pitfall 1: On-Chain Order IDs Are Per-Contract, Not Global

**What goes wrong:** Storing `onChainOrderId` as "42" assumes it is globally unique, but each CaliberMarket has its own `nextOrderId` counter starting from 1. Order ID 1 in the 9MM market is a completely different order from order ID 1 in the 556 market.
**Why it happens:** The CaliberMarket contract uses a simple incrementing counter (`nextOrderId`), independent per contract deployment.
**How to avoid:** Either: (a) use `txHash` as the unique identifier for initial creation (each event has a unique transaction hash), or (b) store a composite key like `"9MM:1"` in `onChainOrderId`. The schema already has `txHash String? @unique` which provides event-level deduplication.
**Warning signs:** Duplicate key errors when processing events from different caliber markets with the same order ID.

### Pitfall 2: MintFinalized Arrives Before MintStarted in Database

**What goes wrong:** If events are processed out of order, a MintFinalized handler tries to update an Order record that does not yet exist.
**Why it happens:** If MintStarted and MintFinalized happen in the same block (or adjacent blocks in the same batch), the processing order depends on the event array ordering.
**How to avoid:** Sort all events by `blockNumber` then `logIndex` before processing. Within a single transaction, MintStarted always emits before MintFinalized because `startMint()` must complete before `finalizeMint()` can be called (different transactions, different blocks). But if backfilling a large range, events from different blocks may interleave.
**Warning signs:** "Record to update not found" errors from Prisma when processing finalization events.

### Pitfall 3: BigInt Comparison Between viem and Prisma

**What goes wrong:** viem returns `blockNumber` as `bigint`. Prisma's `BlockCursor.lastBlock` is also `BigInt`. But comparing or doing arithmetic between them can fail silently if one value is accidentally a `number` or `string`.
**Why it happens:** JavaScript's loose typing allows `1n > 0` (works) but `1n > "0"` (type error in strict mode).
**How to avoid:** Always use `BigInt()` constructor when reading from database. Prisma returns BigInt natively for BigInt fields, so `cursor.lastBlock` is already a `bigint`. Keep all block-number arithmetic in `bigint` domain.
**Warning signs:** TypeScript errors comparing `bigint` and `number`, or unexpected behavior in block range calculations.

### Pitfall 4: Public RPC Rate Limiting on Fuji

**What goes wrong:** The worker makes too many RPC calls per second and gets rate-limited (429 responses) or silently throttled.
**Why it happens:** Avalanche public RPC (`api.avax-test.network`) has rate limits. Fetching 4 event types in parallel = 4 RPC calls per poll tick. At 1-second intervals, that is 4 req/s minimum.
**How to avoid:** Use a 4-second polling interval (gives 1 req/s average). During backfill, add a small delay between batches. Use `FUJI_RPC_URL` env var to allow switching to a dedicated RPC provider if needed.
**Warning signs:** Empty event arrays when events should exist, connection errors, timeouts.

### Pitfall 5: Worker Process Exits When Polling Loop Throws

**What goes wrong:** An unhandled error in the polling loop (RPC timeout, database connection error) kills the Bun process.
**Why it happens:** `setInterval` callbacks that throw unhandled exceptions crash the process. Unlike Express/Next.js, there is no framework-level error boundary.
**How to avoid:** Wrap the entire polling tick in a try/catch that logs the error and continues. Only exit on truly fatal errors (database permanently unreachable, invalid configuration).
**Warning signs:** Worker restarts frequently in production, events are missed during outage windows.

### Pitfall 6: eth_getLogs Block Range Limit Exceeded

**What goes wrong:** Requesting events across more than 2,048 blocks from the public Avalanche RPC returns an error.
**Why it happens:** The Avalanche public API server has `api-max-blocks-per-request = 2048` as a default limit.
**How to avoid:** Batch requests to at most 2,000 blocks per call. During backfill, iterate through the block range in 2,000-block chunks.
**Warning signs:** RPC error: "exceed maximum block range" or similar.

### Pitfall 7: Worker Uses Mainnet Chain Instead of Fuji

**What goes wrong:** The existing `apps/worker/src/index.ts` imports `avalanche` (mainnet, chain ID 43114) instead of `avalancheFuji` (chain ID 43113). All event queries return empty results because contracts are on Fuji.
**Why it happens:** The existing worker boilerplate was written before Phase 1 deployed to Fuji.
**How to avoid:** Import `avalancheFuji` from `viem/chains` and pass it to `createPublicClient`. Verify chain ID matches the BlockCursor's `chainId` field.
**Warning signs:** `getBlockNumber()` returns mainnet block numbers (much higher), all event queries return empty arrays.

## Code Examples

Verified patterns from official sources:

### getContractEvents with Multiple Addresses and Block Range
```typescript
// Source: viem docs (https://v1.viem.sh/docs/contract/getContractEvents.html)

import { createPublicClient, http } from "viem";
import { avalancheFuji } from "viem/chains";
import { CaliberMarketAbi } from "@ammo-exchange/contracts";

const client = createPublicClient({
  chain: avalancheFuji,
  transport: http(process.env.FUJI_RPC_URL),
});

// Query all 4 CaliberMarket contracts in one call
const logs = await client.getContractEvents({
  abi: CaliberMarketAbi,
  address: [
    "0x5aFFA4CfF4920627C2061D211C44B1100E3a8Fe1", // 9MM market
    "0xe082bDd7139eF03E8db1B9155f53aB60E5EF7e03", // 556 market
    "0xF1B4a75C77b8a9bFB52F9B800C3f26547eDD442b", // 22LR market
    "0x326b5AAc6C97918716264E307923c6D2c95cA440", // 308 market
  ],
  eventName: "MintStarted",
  fromBlock: 12345678n,
  toBlock: 12347678n,
  strict: true,
});

// Each log has typed args based on the ABI
for (const log of logs) {
  console.log(log.args.orderId);       // bigint
  console.log(log.args.user);          // `0x${string}`
  console.log(log.args.usdcAmount);    // bigint
  console.log(log.blockNumber);        // bigint
  console.log(log.transactionHash);    // `0x${string}`
  console.log(log.address);            // which contract emitted the event
}
```

### Prisma Interactive Transaction for Atomic Writes
```typescript
// Source: Prisma docs (https://www.prisma.io/docs/orm/prisma-client/queries/transactions)

import { prisma } from "@ammo-exchange/db";
import type { Prisma, PrismaClient } from "@ammo-exchange/db";

type PrismaTx = Parameters<Parameters<PrismaClient["$transaction"]>[0]>[0];

async function processAndCommit(events: ParsedEvent[], lastBlock: bigint) {
  await prisma.$transaction(
    async (tx) => {
      for (const event of events) {
        switch (event.eventName) {
          case "MintStarted":
            await handleMintStarted(tx, event);
            break;
          case "MintFinalized":
            await handleMintFinalized(tx, event);
            break;
          case "RedeemRequested":
            await handleRedeemRequested(tx, event);
            break;
          case "RedeemFinalized":
            await handleRedeemFinalized(tx, event);
            break;
        }
      }

      // Atomically update cursor
      await tx.blockCursor.upsert({
        where: { contractAddress: "all-markets" },
        create: {
          contractAddress: "all-markets",
          chainId: 43113,
          lastBlock,
        },
        update: { lastBlock },
      });
    },
    {
      timeout: 30_000, // 30s timeout for large batches
    }
  );
}
```

### Event Handler with connectOrCreate for User
```typescript
// Source: Prisma relation queries (https://www.prisma.io/docs/orm/prisma-client/queries/relation-queries)
// + viem Log type (https://github.com/wevm/viem/blob/main/src/types/log.ts)

import { CALIBER_TO_PRISMA } from "@ammo-exchange/shared";
import type { Caliber as PrismaCaliber } from "@ammo-exchange/db";

async function handleMintStarted(tx: PrismaTx, event: MintStartedEvent) {
  const { orderId, user, usdcAmount, requestPrice, minTokensOut, deadline } =
    event.args;
  const caliber = addressToCaliber(event.address);
  const prismaCaliber = CALIBER_TO_PRISMA[caliber] as PrismaCaliber;

  await tx.order.upsert({
    where: { txHash: event.transactionHash },
    create: {
      type: "MINT",
      status: "PENDING",
      caliber: prismaCaliber,
      amount: usdcAmount,
      onChainOrderId: orderId.toString(),
      walletAddress: user.toLowerCase(),
      txHash: event.transactionHash,
      chainId: 43113,
      user: {
        connectOrCreate: {
          where: { walletAddress: user.toLowerCase() },
          create: { walletAddress: user.toLowerCase() },
        },
      },
    },
    update: {}, // Idempotent: no-op if already processed
  });
}

async function handleMintFinalized(tx: PrismaTx, event: MintFinalizedEvent) {
  const { orderId, user, tokenAmount, priceUsed } = event.args;
  const caliber = addressToCaliber(event.address);
  const prismaCaliber = CALIBER_TO_PRISMA[caliber] as PrismaCaliber;

  // Find the existing PENDING order and update to COMPLETED
  await tx.order.updateMany({
    where: {
      onChainOrderId: orderId.toString(),
      caliber: prismaCaliber,
      type: "MINT",
      status: "PENDING",
    },
    data: {
      status: "COMPLETED",
    },
  });
}
```

### Graceful Polling Loop with Error Handling
```typescript
// Source: Bun docs (https://bun.com/docs/runtime/workers) + standard patterns

let isProcessing = false;

function startPolling() {
  const intervalId = setInterval(async () => {
    if (isProcessing) return; // Skip if previous tick is still running
    isProcessing = true;

    try {
      await pollEvents();
    } catch (error) {
      console.error("[worker] Polling error (will retry):", error);
      // Do NOT exit -- retry on next tick
    } finally {
      isProcessing = false;
    }
  }, POLL_INTERVAL_MS);

  // Handle graceful shutdown
  process.on("SIGTERM", () => {
    console.log("[worker] Received SIGTERM, shutting down...");
    clearInterval(intervalId);
    process.exit(0);
  });

  process.on("SIGINT", () => {
    console.log("[worker] Received SIGINT, shutting down...");
    clearInterval(intervalId);
    process.exit(0);
  });
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `watchContractEvent` (WebSocket) | `getContractEvents` (polling) | Project decision | Explicit block ranges, no missed events on reconnect, deterministic behavior |
| Per-contract event filters | Multi-address `getContractEvents` | viem 1.x+ | Single RPC call for all 4 markets instead of 4 separate calls |
| Sequential Prisma writes + separate cursor update | Interactive `$transaction` with atomic cursor | Prisma 4.7+ (stable since 2023) | Crash-safe: cursor only advances if all writes succeed |
| Custom ERC20 event parsing | ABI-typed `getContractEvents` with `strict: true` | viem 1.x+ | TypeScript infers exact arg types from ABI, no manual decoding |

**Deprecated/outdated:**
- `createContractEventFilter` + `getFilterLogs`: Older viem pattern; `getContractEvents` is the direct replacement that combines both steps
- `process.on('unhandledRejection')` for crash handling: Still works, but wrapping polling in try/catch is more explicit and Bun-compatible

## Open Questions

1. **Single cursor vs. per-contract cursors**
   - What we know: The BlockCursor schema has `contractAddress` as unique key, designed for per-contract tracking. But the roadmap suggests querying all markets with the same block range.
   - What's unclear: Whether to use one cursor row ("all-markets") or four rows (one per CaliberMarket address). One cursor is simpler; four cursors allow independent progress if one contract has errors.
   - Recommendation: Use a single cursor ("all-markets"). All four contracts are queried in the same block range and processed in the same transaction. If this proves insufficient, switching to per-contract cursors is a straightforward refactor.

2. **Order uniqueness: txHash vs. caliber+onChainOrderId**
   - What we know: The schema has `txHash String? @unique`. But MintStarted and MintFinalized are different events (different txHashes) for the same order. The initial MintStarted creates the Order record, and MintFinalized updates its status.
   - What's unclear: How to correlate finalization events to the original order if we use txHash as the unique key for creation.
   - Recommendation: Use `txHash` for idempotent creation of ORDER records (prevents duplicates from reprocessing). Use `caliber + onChainOrderId + type` as the lookup key for status updates (MintFinalized finds the MINT order with matching caliber and onChainOrderId). Consider adding a composite unique index `@@unique([caliber, onChainOrderId, type])` to the schema if needed.

3. **Schema changes needed for Phase 2**
   - What we know: The current schema requires a `userId` (non-nullable) on Order, and User records may not exist when events are first processed.
   - What's unclear: Whether `connectOrCreate` can handle this cleanly given the `userId` is required.
   - Recommendation: `connectOrCreate` on the `user` relation handles this: it creates a User with the wallet address if one does not exist, and connects the Order to it. This is well-supported in Prisma and does not require schema changes. May also need to add a `blockNumber` field to Order for query/display purposes, since the schema currently lacks it.

4. **Polling interval tuning**
   - What we know: Avalanche blocks finalize in approximately 1 second. The worker fetches 4 event types per tick.
   - What's unclear: Optimal interval for Fuji public RPC without hitting rate limits.
   - Recommendation: Start with 4 seconds (approximately 2-4 blocks per tick). This gives ~1 RPC call per second average (4 calls every 4 seconds). Configurable via environment variable for tuning.

## Sources

### Primary (HIGH confidence)
- viem `getContractEvents` docs: https://v1.viem.sh/docs/contract/getContractEvents.html -- parameters, return type, address array support, block range
- viem Log type source: https://github.com/wevm/viem/blob/main/src/types/log.ts -- exact TypeScript type definition
- Prisma interactive transactions: https://www.prisma.io/docs/orm/prisma-client/queries/transactions -- `$transaction` with async function, timeout config, isolation levels
- Prisma `connectOrCreate`: https://www.prisma.io/docs/orm/prisma-client/queries/relation-queries -- creating related records on-the-fly
- Existing codebase: `packages/contracts/src/abis/CaliberMarket.ts` -- ABI with all 4 event definitions and their fields
- Existing codebase: `packages/db/prisma/schema.prisma` -- Order, User, BlockCursor models
- Existing codebase: `packages/shared/src/config/index.ts` -- Fuji contract addresses
- Existing codebase: `packages/shared/src/constants/index.ts` -- CALIBER_TO_PRISMA mapping
- Avalanche reorg FAQ: https://support.avax.network/en/articles/7329750-are-there-reorgs-on-avalanche -- finality in ~1s, no practical reorg risk

### Secondary (MEDIUM confidence)
- Avalanche eth_getLogs block range limit: https://docs.chainstack.com/docs/understanding-eth-getlogs-limitations -- 100,000 blocks per Chainstack docs, but public RPC may be 2,048 blocks per AvalancheGo default `api-max-blocks-per-request`
- AvalancheGo C-Chain RPC docs: https://build.avax.network/docs/rpcs/c-chain -- confirms `api-max-blocks-per-request` default of 2,048
- viem `avalancheFuji` chain: https://viem.sh/docs/chains/introduction -- chain definition import path
- Avalanche block time: https://chainspect.app/chain/avalanche -- approximately 1.1-2 seconds

### Tertiary (LOW confidence)
- Bun setInterval behavior in long-running processes: https://github.com/oven-sh/bun/issues/17725 -- potential slowdown with long-running setInterval, needs validation with actual worker

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all libraries already installed and used in Phase 1, versions verified from package.json
- Architecture: HIGH -- patterns verified against official viem and Prisma documentation, cross-referenced with existing codebase structure
- Pitfalls: HIGH -- derived from actual ABI inspection (per-contract order IDs), schema analysis (userId required), and Avalanche RPC limits documentation
- Code examples: HIGH -- constructed from verified API signatures in official docs, tested against existing ABI types

**Research date:** 2026-02-11
**Valid until:** 2026-03-11 (30 days -- stable stack, viem and Prisma APIs are mature)
