import type { PrismaTx } from "../lib/cursor";
import type { EventMeta } from "../lib/constants";
import { addressToCaliber, CHAIN_ID } from "../lib/constants";
import { CALIBER_TO_PRISMA } from "@ammo-exchange/shared";
import type { Caliber as PrismaCaliber } from "@ammo-exchange/db";

// Re-export EventMeta for external consumers
export type { EventMeta } from "../lib/constants";

// ── Event Argument Types ────────────────────────────────────────────

export interface RedeemRequestedArgs {
  orderId: bigint;
  user: `0x${string}`;
  tokenAmount: bigint;
  deadline: bigint;
}

export interface RedeemFinalizedArgs {
  orderId: bigint;
  user: `0x${string}`;
  burnedTokens: bigint;
  feeTokens: bigint;
}

// ── Handlers ────────────────────────────────────────────────────────

/**
 * Handle a RedeemRequested event by creating a PENDING REDEEM order.
 *
 * Uses txHash-based upsert for idempotency (safe to reprocess).
 * Auto-creates User records via connectOrCreate for new wallets.
 */
export async function handleRedeemRequested(
  tx: PrismaTx,
  args: RedeemRequestedArgs,
  meta: EventMeta,
): Promise<void> {
  const caliber = addressToCaliber(meta.address);
  const prismaCaliber = CALIBER_TO_PRISMA[caliber] as PrismaCaliber;
  const userAddress = args.user.toLowerCase();

  await tx.order.upsert({
    where: { txHash: meta.transactionHash },
    create: {
      type: "REDEEM",
      status: "PENDING",
      caliber: prismaCaliber,
      amount: args.tokenAmount,
      onChainOrderId: args.orderId.toString(),
      walletAddress: userAddress,
      txHash: meta.transactionHash,
      chainId: CHAIN_ID,
      user: {
        connectOrCreate: {
          where: { walletAddress: userAddress },
          create: { walletAddress: userAddress },
        },
      },
    },
    update: {}, // No-op if already exists (idempotent)
  });
}

/**
 * Handle a RedeemFinalized event by updating the matching PENDING REDEEM order
 * to COMPLETED status.
 *
 * Uses updateMany because onChainOrderId is not a unique field --
 * the lookup is by (onChainOrderId, caliber, type, status).
 */
export async function handleRedeemFinalized(
  tx: PrismaTx,
  args: RedeemFinalizedArgs,
  meta: EventMeta,
): Promise<void> {
  const caliber = addressToCaliber(meta.address);
  const prismaCaliber = CALIBER_TO_PRISMA[caliber] as PrismaCaliber;

  await tx.order.updateMany({
    where: {
      onChainOrderId: args.orderId.toString(),
      caliber: prismaCaliber,
      type: "REDEEM",
      status: "PENDING",
    },
    data: {
      status: "COMPLETED",
    },
  });
}
