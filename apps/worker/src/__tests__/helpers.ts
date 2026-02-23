/**
 * Test helpers for worker handler unit tests.
 *
 * Provides a mock PrismaTx factory and event argument builders
 * so tests can exercise handlers without a real database.
 */

import type { EventMeta } from "../lib/constants";
import type { MintStartedArgs, MintFinalizedArgs } from "../handlers/mint";
import type {
  RedeemRequestedArgs,
  RedeemFinalizedArgs,
} from "../handlers/redeem";
import { CONTRACT_ADDRESSES } from "@ammo-exchange/shared";

// ── Default Values ──────────────────────────────────────────────────

const DEFAULT_TX_HASH =
  "0xabc0000000000000000000000000000000000000000000000000000000000001" as const;

const DEFAULT_USER = "0x1234567890abcdef1234567890abcdef12345678" as const;

/** First caliber market address (9MM on Fuji) */
const DEFAULT_MARKET_ADDRESS = CONTRACT_ADDRESSES.fuji.calibers["9MM"].market;

// ── Mock PrismaTx ───────────────────────────────────────────────────

export interface UpsertCall {
  where: Record<string, unknown>;
  create: Record<string, unknown>;
  update: Record<string, unknown>;
}

export interface MockPrismaTx {
  order: {
    upsert: (args: UpsertCall) => Promise<Record<string, unknown>>;
    updateMany: (args: Record<string, unknown>) => Promise<{ count: number }>;
    findFirst: (
      args: Record<string, unknown>,
    ) => Promise<Record<string, unknown> | null>;
    /** All upsert calls made during the test */
    _upsertCalls: UpsertCall[];
    /** In-memory store keyed by composite "txHash_logIndex" */
    _store: Map<string, Record<string, unknown>>;
    /** Configure updateMany return value */
    _updateManyResult: { count: number };
    /** Configure findFirst return value */
    _findFirstResult: Record<string, unknown> | null;
  };
  activityLog: {
    create: (args: Record<string, unknown>) => Promise<Record<string, unknown>>;
    _createCalls: Record<string, unknown>[];
  };
  blockCursor: {
    findUnique: (args: Record<string, unknown>) => Promise<null>;
    upsert: (args: Record<string, unknown>) => Promise<Record<string, unknown>>;
  };
}

/**
 * Create a mock PrismaTx that tracks all calls and simulates upsert semantics
 * with an in-memory Map keyed by composite "txHash_logIndex".
 */
export function createMockPrismaTx(): MockPrismaTx {
  const store = new Map<string, Record<string, unknown>>();
  const upsertCalls: UpsertCall[] = [];
  const activityLogCalls: Record<string, unknown>[] = [];

  const mock: MockPrismaTx = {
    order: {
      _upsertCalls: upsertCalls,
      _store: store,
      _updateManyResult: { count: 0 },
      _findFirstResult: null,

      async upsert(args: UpsertCall) {
        upsertCalls.push(args);

        // Extract composite key from where clause
        const whereKey = args.where as {
          txHash_logIndex?: { txHash: string; logIndex: number };
        };
        const composite = whereKey.txHash_logIndex;
        if (!composite) {
          throw new Error(
            "Mock upsert expects txHash_logIndex in where clause",
          );
        }

        const key = `${composite.txHash}_${composite.logIndex}`;
        const existing = store.get(key);

        if (existing) {
          // Apply update (which is typically {} for idempotent handlers)
          const updated = { ...existing, ...args.update };
          store.set(key, updated);
          return updated;
        }

        // Create new entry
        const created = { id: `mock-${store.size + 1}`, ...args.create };
        store.set(key, created);
        return created;
      },

      async updateMany(_args: Record<string, unknown>) {
        return mock.order._updateManyResult;
      },

      async findFirst(_args: Record<string, unknown>) {
        return mock.order._findFirstResult;
      },
    },

    activityLog: {
      _createCalls: activityLogCalls,
      async create(args: Record<string, unknown>) {
        activityLogCalls.push(args);
        return { id: `activity-${activityLogCalls.length}`, ...args };
      },
    },

    blockCursor: {
      async findUnique(_args: Record<string, unknown>) {
        return null;
      },
      async upsert(args: Record<string, unknown>) {
        return { id: "cursor-1", ...args };
      },
    },
  };

  return mock;
}

// ── Event Builders ──────────────────────────────────────────────────

/**
 * Build an EventMeta with sensible defaults. All fields are overridable.
 */
export function buildEventMeta(overrides: Partial<EventMeta> = {}): EventMeta {
  return {
    address: DEFAULT_MARKET_ADDRESS,
    transactionHash: DEFAULT_TX_HASH,
    blockNumber: 100n,
    logIndex: 0,
    ...overrides,
  };
}

/**
 * Build MintStartedArgs with sensible defaults.
 */
export function buildMintStartedArgs(
  overrides: Partial<MintStartedArgs> = {},
): MintStartedArgs {
  return {
    orderId: 1n,
    user: DEFAULT_USER,
    usdcAmount: 50_000_000n, // 50 USDC (6 decimals)
    requestPrice: 1_000_000n,
    minTokensOut: 45n,
    deadline: BigInt(Math.floor(Date.now() / 1000) + 3600),
    ...overrides,
  };
}

/**
 * Build MintFinalizedArgs with sensible defaults.
 */
export function buildMintFinalizedArgs(
  overrides: Partial<MintFinalizedArgs> = {},
): MintFinalizedArgs {
  return {
    orderId: 1n,
    user: DEFAULT_USER,
    tokenAmount: 50_000_000_000_000_000_000n, // 50 tokens (18 decimals)
    priceUsed: 1_000_000n,
    ...overrides,
  };
}

/**
 * Build RedeemRequestedArgs with sensible defaults.
 */
export function buildRedeemRequestedArgs(
  overrides: Partial<RedeemRequestedArgs> = {},
): RedeemRequestedArgs {
  return {
    orderId: 1n,
    user: DEFAULT_USER,
    tokenAmount: 50_000_000_000_000_000_000n, // 50 tokens (18 decimals)
    deadline: BigInt(Math.floor(Date.now() / 1000) + 3600),
    ...overrides,
  };
}

/**
 * Build RedeemFinalizedArgs with sensible defaults.
 */
export function buildRedeemFinalizedArgs(
  overrides: Partial<RedeemFinalizedArgs> = {},
): RedeemFinalizedArgs {
  return {
    orderId: 1n,
    user: DEFAULT_USER,
    burnedTokens: 49_250_000_000_000_000_000n, // 49.25 tokens after fee
    feeTokens: 750_000_000_000_000_000n, // 0.75 tokens fee
    ...overrides,
  };
}
