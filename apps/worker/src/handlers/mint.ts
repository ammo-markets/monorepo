import type { PrismaTx } from "../lib/cursor";
import type { EventMeta } from "../lib/constants";
import { addressToCaliber, CHAIN_ID } from "../lib/constants";
import { CALIBER_TO_PRISMA } from "@ammo-exchange/shared";
import type { Caliber as PrismaCaliber } from "@ammo-exchange/db";

// ── Event Argument Types ────────────────────────────────────────────

export interface MintStartedArgs {
  orderId: bigint;
  user: `0x${string}`;
  usdcAmount: bigint;
  requestPrice: bigint;
  minTokensOut: bigint;
  deadline: bigint;
}

export interface MintFinalizedArgs {
  orderId: bigint;
  user: `0x${string}`;
  tokenAmount: bigint;
  priceUsed: bigint;
}

// ── Handlers ────────────────────────────────────────────────────────

/**
 * Handle a MintStarted event by creating a PENDING MINT order.
 *
 * Uses txHash-based upsert for idempotency (safe to reprocess).
 * Auto-creates User records via connectOrCreate for new wallets.
 */
export async function handleMintStarted(
  tx: PrismaTx,
  args: MintStartedArgs,
  meta: EventMeta,
): Promise<void> {
  const caliber = addressToCaliber(meta.address);
  const prismaCaliber = CALIBER_TO_PRISMA[caliber] as PrismaCaliber;
  const userAddress = args.user.toLowerCase();

  await tx.order.upsert({
    where: { txHash: meta.transactionHash },
    create: {
      type: "MINT",
      status: "PENDING",
      caliber: prismaCaliber,
      amount: args.usdcAmount.toString(),
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
 * Handle a MintFinalized event by updating the matching PENDING MINT order
 * to COMPLETED status.
 *
 * Uses updateMany because onChainOrderId is not a unique field --
 * the lookup is by (onChainOrderId, caliber, type, status).
 */
export async function handleMintFinalized(
  tx: PrismaTx,
  args: MintFinalizedArgs,
  meta: EventMeta,
): Promise<void> {
  const caliber = addressToCaliber(meta.address);
  const prismaCaliber = CALIBER_TO_PRISMA[caliber] as PrismaCaliber;

  const { count } = await tx.order.updateMany({
    where: {
      onChainOrderId: args.orderId.toString(),
      caliber: prismaCaliber,
      type: "MINT",
      status: "PENDING",
    },
    data: {
      status: "COMPLETED",
    },
  });

  // Write ActivityLog entry for completed mint
  if (count > 0) {
    try {
      const order = await tx.order.findFirst({
        where: {
          onChainOrderId: args.orderId.toString(),
          caliber: prismaCaliber,
          type: "MINT",
          status: "COMPLETED",
        },
        select: { id: true, caliber: true, amount: true, walletAddress: true },
      });

      if (order) {
        await tx.activityLog.create({
          data: {
            type: "MINT",
            caliber: order.caliber,
            amount: order.amount,
            txHash: meta.transactionHash,
            walletAddress: order.walletAddress ?? "",
            createdAt: new Date(),
          },
        });
        console.log(`[mint] Created ActivityLog entry for mint ${order.id}`);
      }
    } catch (error) {
      console.error("[mint] Failed to create ActivityLog entry:", error);
    }
  }
}
