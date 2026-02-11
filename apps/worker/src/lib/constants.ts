import { CONTRACT_ADDRESSES } from "@ammo-exchange/shared";
import type { Caliber } from "@ammo-exchange/shared";

// ── Polling Configuration ───────────────────────────────────────────

/** Polling interval in milliseconds (~2 Avalanche blocks per tick) */
export const POLL_INTERVAL_MS = 4_000;

/** Max blocks per getContractEvents call (stays under Avalanche public RPC's 2,048 limit) */
export const BATCH_SIZE = 2_000n;

/** Single cursor key for all 4 CaliberMarket contracts */
export const CURSOR_KEY = "all-markets";

/** Avalanche Fuji testnet chain ID */
export const CHAIN_ID = 43113;

// ── Market Addresses ────────────────────────────────────────────────

/** All 4 CaliberMarket contract addresses for multi-address event queries */
export const MARKET_ADDRESSES: `0x${string}`[] = Object.values(
  CONTRACT_ADDRESSES.fuji.calibers,
).map((c) => c.market);

// ── Address-to-Caliber Reverse Lookup ───────────────────────────────

const ADDRESS_TO_CALIBER: Record<string, Caliber> = {};
for (const [caliber, addrs] of Object.entries(
  CONTRACT_ADDRESSES.fuji.calibers,
)) {
  ADDRESS_TO_CALIBER[addrs.market.toLowerCase()] = caliber as Caliber;
}

/**
 * Resolve a contract address to its Caliber identifier.
 * Performs case-insensitive comparison.
 * @throws if the address is not a known CaliberMarket contract
 */
export function addressToCaliber(address: string): Caliber {
  const caliber = ADDRESS_TO_CALIBER[address.toLowerCase()];
  if (!caliber) throw new Error(`Unknown market address: ${address}`);
  return caliber;
}

// ── Shared Event Types ──────────────────────────────────────────────

/** Metadata extracted from a viem log entry, shared across all handlers */
export interface EventMeta {
  address: `0x${string}`;
  transactionHash: `0x${string}`;
  blockNumber: bigint;
  logIndex: number;
}
