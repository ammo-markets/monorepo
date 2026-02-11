import { parseUnits, formatUnits } from "viem";

/** Default deadline: 24 hours from now (as a Unix timestamp in seconds). */
export function getDeadline(hoursFromNow = 24): bigint {
  return BigInt(Math.floor(Date.now() / 1000) + hoursFromNow * 3600);
}

/** Default slippage tolerance: 5 % (500 basis points). */
export const DEFAULT_SLIPPAGE_BPS = BigInt(500);

/* ── USDC helpers (6 decimals) ── */

export function parseUsdc(amount: string): bigint {
  return parseUnits(amount, 6);
}

export function formatUsdc(amount: bigint): string {
  return formatUnits(amount, 6);
}

/* ── AmmoToken helpers (18 decimals) ── */

export function parseTokenAmount(rounds: string): bigint {
  return parseUnits(rounds, 18);
}

export function formatTokenAmount(amount: bigint): string {
  return formatUnits(amount, 18);
}
