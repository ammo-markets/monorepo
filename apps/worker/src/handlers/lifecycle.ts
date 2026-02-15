import type { EventMeta } from "../lib/constants";

// ── Handlers ────────────────────────────────────────────────────────
// These are log-only handlers (no DB writes) for operational visibility.

export function handlePaused(
  meta: EventMeta,
  args: { by: `0x${string}` },
): void {
  console.log(
    `[lifecycle] Market PAUSED by ${args.by} at block ${meta.blockNumber} (contract: ${meta.address})`,
  );
}

export function handleUnpaused(
  meta: EventMeta,
  args: { by: `0x${string}` },
): void {
  console.log(
    `[lifecycle] Market UNPAUSED by ${args.by} at block ${meta.blockNumber} (contract: ${meta.address})`,
  );
}

export function handleMintFeeUpdated(
  meta: EventMeta,
  args: { oldBps: bigint; newBps: bigint },
): void {
  console.log(
    `[lifecycle] MintFee updated ${args.oldBps} -> ${args.newBps} bps (contract: ${meta.address})`,
  );
}

export function handleRedeemFeeUpdated(
  meta: EventMeta,
  args: { oldBps: bigint; newBps: bigint },
): void {
  console.log(
    `[lifecycle] RedeemFee updated ${args.oldBps} -> ${args.newBps} bps (contract: ${meta.address})`,
  );
}

export function handleMinMintUpdated(
  meta: EventMeta,
  args: { oldMin: bigint; newMin: bigint },
): void {
  console.log(
    `[lifecycle] MinMint updated ${args.oldMin} -> ${args.newMin} (contract: ${meta.address})`,
  );
}
