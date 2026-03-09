import type { PrismaTx } from "../lib/cursor";
import type { EventMeta } from "../lib/constants";
import { addressToCaliber } from "../lib/constants";
import { CALIBER_TO_PRISMA } from "@ammo-exchange/shared";
import type { Caliber as PrismaCaliber } from "@ammo-exchange/db";

// ── Handlers ────────────────────────────────────────────────────────
// These handlers persist market config changes to the MarketConfig table
// so the frontend can read current fees/settings from the database
// instead of hardcoded constants.

export async function handlePaused(
  tx: PrismaTx,
  meta: EventMeta,
  _args: { by: `0x${string}` },
): Promise<void> {
  const caliber = addressToCaliber(meta.address);
  const prismaCaliber = CALIBER_TO_PRISMA[caliber] as PrismaCaliber;

  await tx.marketConfig.upsert({
    where: { caliber: prismaCaliber },
    create: { caliber: prismaCaliber, paused: true },
    update: { paused: true },
  });

  console.log(
    `[lifecycle] Market PAUSED at block ${meta.blockNumber} (contract: ${meta.address})`,
  );
}

export async function handleUnpaused(
  tx: PrismaTx,
  meta: EventMeta,
  _args: { by: `0x${string}` },
): Promise<void> {
  const caliber = addressToCaliber(meta.address);
  const prismaCaliber = CALIBER_TO_PRISMA[caliber] as PrismaCaliber;

  await tx.marketConfig.upsert({
    where: { caliber: prismaCaliber },
    create: { caliber: prismaCaliber, paused: false },
    update: { paused: false },
  });

  console.log(
    `[lifecycle] Market UNPAUSED at block ${meta.blockNumber} (contract: ${meta.address})`,
  );
}

export async function handleMintFeeUpdated(
  tx: PrismaTx,
  meta: EventMeta,
  args: { oldBps: bigint; newBps: bigint },
): Promise<void> {
  const caliber = addressToCaliber(meta.address);
  const prismaCaliber = CALIBER_TO_PRISMA[caliber] as PrismaCaliber;

  await tx.marketConfig.upsert({
    where: { caliber: prismaCaliber },
    create: { caliber: prismaCaliber, mintFeeBps: Number(args.newBps) },
    update: { mintFeeBps: Number(args.newBps) },
  });

  console.log(
    `[lifecycle] MintFee updated ${args.oldBps} -> ${args.newBps} bps (contract: ${meta.address})`,
  );
}

export async function handleRedeemFeeUpdated(
  tx: PrismaTx,
  meta: EventMeta,
  args: { oldBps: bigint; newBps: bigint },
): Promise<void> {
  const caliber = addressToCaliber(meta.address);
  const prismaCaliber = CALIBER_TO_PRISMA[caliber] as PrismaCaliber;

  await tx.marketConfig.upsert({
    where: { caliber: prismaCaliber },
    create: { caliber: prismaCaliber, redeemFeeBps: Number(args.newBps) },
    update: { redeemFeeBps: Number(args.newBps) },
  });

  console.log(
    `[lifecycle] RedeemFee updated ${args.oldBps} -> ${args.newBps} bps (contract: ${meta.address})`,
  );
}

export async function handleMinRedeemUpdated(
  tx: PrismaTx,
  meta: EventMeta,
  args: { oldMin: bigint; newMin: bigint },
): Promise<void> {
  const caliber = addressToCaliber(meta.address);
  const prismaCaliber = CALIBER_TO_PRISMA[caliber] as PrismaCaliber;

  await tx.marketConfig.upsert({
    where: { caliber: prismaCaliber },
    create: { caliber: prismaCaliber, minMintRounds: Number(args.newMin) },
    update: { minMintRounds: Number(args.newMin) },
  });

  console.log(
    `[lifecycle] MinRedeem updated ${args.oldMin} -> ${args.newMin} (contract: ${meta.address})`,
  );
}
