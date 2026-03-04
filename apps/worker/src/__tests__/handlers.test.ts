/**
 * Worker handler unit tests for idempotent replay and composite uniqueness.
 *
 * TEST-01: Same event replayed (identical txHash + logIndex) = exactly 1 order
 * TEST-02: Two events in same tx (same txHash, different logIndex) = 2 orders
 *
 * Uses vitest with mock PrismaTx (no real database).
 */

import { describe, test, expect, beforeEach } from "vitest";
import { handleMinted } from "../handlers/mint";
import { handleRedeemRequested } from "../handlers/redeem";
import type { PrismaTx } from "../lib/cursor";
import {
  createMockPrismaTx,
  buildEventMeta,
  buildMintedArgs,
  buildRedeemRequestedArgs,
} from "./helpers";
import type { MockPrismaTx } from "./helpers";

// ── Minted Idempotency (TEST-01, TEST-02) ────────────────────────

describe("handleMinted - idempotency (TEST-01)", () => {
  let mockTx: MockPrismaTx;

  beforeEach(() => {
    mockTx = createMockPrismaTx();
  });

  test("processes event once -- creates one order", async () => {
    const args = buildMintedArgs();
    const meta = buildEventMeta();

    await handleMinted(mockTx as unknown as PrismaTx, args, meta);

    expect(mockTx.order._upsertCalls.length).toBe(1);
    expect(mockTx.order._store.size).toBe(1);

    // Verify composite key was used
    const call = mockTx.order._upsertCalls[0]!;
    expect(call.where).toEqual({
      txHash_logIndex: {
        txHash: meta.transactionHash,
        logIndex: meta.logIndex,
      },
    });
  });

  test("replaying same event -- still results in one order", async () => {
    const args = buildMintedArgs();
    const meta = buildEventMeta();

    // Process same event twice
    await handleMinted(mockTx as unknown as PrismaTx, args, meta);
    await handleMinted(mockTx as unknown as PrismaTx, args, meta);

    // Two upsert calls were made, but store has exactly 1 entry
    expect(mockTx.order._upsertCalls.length).toBe(2);
    expect(mockTx.order._store.size).toBe(1);
  });

  test("same txHash different logIndex -- creates two orders (TEST-02)", async () => {
    const args = buildMintedArgs();
    const txHash =
      "0xdef0000000000000000000000000000000000000000000000000000000000002" as const;

    const meta0 = buildEventMeta({ transactionHash: txHash, logIndex: 0 });
    const meta1 = buildEventMeta({ transactionHash: txHash, logIndex: 1 });

    await handleMinted(mockTx as unknown as PrismaTx, args, meta0);
    await handleMinted(mockTx as unknown as PrismaTx, args, meta1);

    // Two distinct entries in the store
    expect(mockTx.order._store.size).toBe(2);
    expect(mockTx.order._upsertCalls.length).toBe(2);
  });
});

// ── RedeemRequested Idempotency (TEST-01, TEST-02) ──────────────────

describe("handleRedeemRequested - idempotency (TEST-01)", () => {
  let mockTx: MockPrismaTx;

  beforeEach(() => {
    mockTx = createMockPrismaTx();
  });

  test("processes event once -- creates one order", async () => {
    const args = buildRedeemRequestedArgs();
    const meta = buildEventMeta();

    await handleRedeemRequested(mockTx as unknown as PrismaTx, args, meta);

    expect(mockTx.order._upsertCalls.length).toBe(1);
    expect(mockTx.order._store.size).toBe(1);

    const call = mockTx.order._upsertCalls[0]!;
    expect(call.where).toEqual({
      txHash_logIndex: {
        txHash: meta.transactionHash,
        logIndex: meta.logIndex,
      },
    });
  });

  test("replaying same event -- still results in one order", async () => {
    const args = buildRedeemRequestedArgs();
    const meta = buildEventMeta();

    await handleRedeemRequested(mockTx as unknown as PrismaTx, args, meta);
    await handleRedeemRequested(mockTx as unknown as PrismaTx, args, meta);

    expect(mockTx.order._upsertCalls.length).toBe(2);
    expect(mockTx.order._store.size).toBe(1);
  });

  test("same txHash different logIndex -- creates two orders (TEST-02)", async () => {
    const args = buildRedeemRequestedArgs();
    const txHash =
      "0xfed0000000000000000000000000000000000000000000000000000000000003" as const;

    const meta0 = buildEventMeta({ transactionHash: txHash, logIndex: 0 });
    const meta1 = buildEventMeta({ transactionHash: txHash, logIndex: 1 });

    await handleRedeemRequested(mockTx as unknown as PrismaTx, args, meta0);
    await handleRedeemRequested(mockTx as unknown as PrismaTx, args, meta1);

    expect(mockTx.order._store.size).toBe(2);
    expect(mockTx.order._upsertCalls.length).toBe(2);
  });
});

// ── Minted Data Correctness ─────────────────────────────────────────

describe("handleMinted - data correctness", () => {
  let mockTx: MockPrismaTx;

  beforeEach(() => {
    mockTx = createMockPrismaTx();
  });

  test("stores usdcAmount from event args", async () => {
    const usdcAmount = 100_000_000n; // 100 USDC
    const args = buildMintedArgs({ usdcAmount });
    const meta = buildEventMeta();

    await handleMinted(mockTx as unknown as PrismaTx, args, meta);

    const call = mockTx.order._upsertCalls[0]!;
    expect(call.create).toHaveProperty("usdcAmount", usdcAmount.toString());
  });

  test("stores caliber resolved from contract address", async () => {
    const meta = buildEventMeta(); // Uses 9MM_PRACTICE market address by default
    const args = buildMintedArgs();

    await handleMinted(mockTx as unknown as PrismaTx, args, meta);

    const call = mockTx.order._upsertCalls[0]!;
    // 9MM_PRACTICE maps to NINE_MM_PRACTICE in Prisma
    expect(call.create).toHaveProperty("caliber", "NINE_MM_PRACTICE");
  });

  test("creates order with COMPLETED status", async () => {
    const args = buildMintedArgs();
    const meta = buildEventMeta();

    await handleMinted(mockTx as unknown as PrismaTx, args, meta);

    const call = mockTx.order._upsertCalls[0]!;
    expect(call.create).toHaveProperty("status", "COMPLETED");
  });

  test("stores mintPrice and refundAmount", async () => {
    const args = buildMintedArgs({ priceUsed: 570000n, refundAmount: 1234n });
    const meta = buildEventMeta();

    await handleMinted(mockTx as unknown as PrismaTx, args, meta);

    const call = mockTx.order._upsertCalls[0]!;
    expect(call.create).toHaveProperty("mintPrice", "570000");
    expect(call.create).toHaveProperty("refundAmount", "1234");
  });
});

// ── RedeemRequested Data Correctness ────────────────────────────────

describe("handleRedeemRequested - data correctness", () => {
  let mockTx: MockPrismaTx;

  beforeEach(() => {
    mockTx = createMockPrismaTx();
  });

  test("stores tokenAmount from event args", async () => {
    const tokenAmount = 25_000_000_000_000_000_000n; // 25 tokens
    const args = buildRedeemRequestedArgs({ tokenAmount });
    const meta = buildEventMeta();

    await handleRedeemRequested(mockTx as unknown as PrismaTx, args, meta);

    const call = mockTx.order._upsertCalls[0]!;
    expect(call.create).toHaveProperty("tokenAmount", tokenAmount.toString());
  });
});
