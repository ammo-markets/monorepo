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

export interface RedeemApprovedArgs {
  orderId: bigint;
  user: `0x${string}`;
  shippingCost: bigint;
  protocolFee: bigint;
}

export interface RedeemPaidArgs {
  orderId: bigint;
  user: `0x${string}`;
  shippingCost: bigint;
  protocolFee: bigint;
}

export interface RedeemFinalizedArgs {
  orderId: bigint;
  user: `0x${string}`;
  burnedTokens: bigint;
}

// ── Handlers ────────────────────────────────────────────────────────

/**
 * Handle a RedeemRequested event by creating a PENDING REDEEM order.
 *
 * Uses composite (txHash, logIndex) upsert for idempotency (safe to reprocess).
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
    where: {
      txHash_logIndex: {
        txHash: meta.transactionHash,
        logIndex: meta.logIndex,
      },
    },
    create: {
      type: "REDEEM",
      status: "PENDING",
      caliber: prismaCaliber,
      tokenAmount: args.tokenAmount.toString(),
      onChainOrderId: args.orderId.toString(),
      walletAddress: userAddress,
      txHash: meta.transactionHash,
      logIndex: meta.logIndex,
      chainId: CHAIN_ID,
      createdAt: meta.blockTimestamp,
      user: {
        connectOrCreate: {
          where: { walletAddress: userAddress },
          create: { walletAddress: userAddress },
        },
      },
    },
    update: {}, // No-op if already exists (idempotent)
  });

  // Copy the user's default shipping address to the order (if available).
  // This is best-effort — a missing address should not fail order creation.
  try {
    const order = await tx.order.findUnique({
      where: {
        txHash_logIndex: {
          txHash: meta.transactionHash,
          logIndex: meta.logIndex,
        },
      },
      select: { id: true },
    });
    const user = await tx.user.findUnique({
      where: { walletAddress: userAddress },
      select: {
        defaultShippingName: true,
        defaultShippingLine1: true,
        defaultShippingLine2: true,
        defaultShippingCity: true,
        defaultShippingState: true,
        defaultShippingZip: true,
      },
    });
    if (
      order &&
      user?.defaultShippingName &&
      user?.defaultShippingLine1 &&
      user?.defaultShippingCity &&
      user?.defaultShippingState &&
      user?.defaultShippingZip
    ) {
      await tx.shippingAddress.upsert({
        where: { orderId: order.id },
        create: {
          orderId: order.id,
          name: user.defaultShippingName,
          line1: user.defaultShippingLine1,
          line2: user.defaultShippingLine2 ?? "",
          city: user.defaultShippingCity,
          state: user.defaultShippingState,
          zip: user.defaultShippingZip,
        },
        update: {}, // don't overwrite if updated via API later
      });
    }
  } catch (err) {
    console.error("[redeem] Failed to copy shipping address:", err);
  }
}

/**
 * Handle a RedeemApproved event by updating the matching PENDING REDEEM order
 * to APPROVED status with shipping cost and protocol fee.
 */
export async function handleRedeemApproved(
  tx: PrismaTx,
  args: RedeemApprovedArgs,
  meta: EventMeta,
): Promise<void> {
  const caliber = addressToCaliber(meta.address);
  const prismaCaliber = CALIBER_TO_PRISMA[caliber] as PrismaCaliber;

  await tx.order.updateMany({
    where: {
      onChainOrderId: args.orderId.toString(),
      caliber: prismaCaliber,
      type: "REDEEM",
      status: { in: ["PENDING", "APPROVED"] },
    },
    data: {
      status: "APPROVED",
      shippingCost: args.shippingCost.toString(),
      protocolFee: args.protocolFee.toString(),
    },
  });

  console.log(
    `[redeem] RedeemApproved orderId=${args.orderId} shipping=${args.shippingCost} fee=${args.protocolFee}`,
  );
}

/**
 * Handle a RedeemPaid event by updating the matching APPROVED REDEEM order
 * to PAID status with the payment timestamp.
 */
export async function handleRedeemPaid(
  tx: PrismaTx,
  args: RedeemPaidArgs,
  meta: EventMeta,
): Promise<void> {
  const caliber = addressToCaliber(meta.address);
  const prismaCaliber = CALIBER_TO_PRISMA[caliber] as PrismaCaliber;

  await tx.order.updateMany({
    where: {
      onChainOrderId: args.orderId.toString(),
      caliber: prismaCaliber,
      type: "REDEEM",
      status: { in: ["APPROVED", "PAID"] },
    },
    data: {
      status: "PAID",
      paidAt: meta.blockTimestamp,
    },
  });

  console.log(
    `[redeem] RedeemPaid orderId=${args.orderId} shipping=${args.shippingCost} fee=${args.protocolFee}`,
  );
}

/**
 * Handle a RedeemFinalized event by updating the matching PAID REDEEM order
 * to COMPLETED status with final burned token amount.
 *
 * Uses updateMany because onChainOrderId is not a unique field --
 * the lookup is by (onChainOrderId, caliber, type, status).
 *
 * Self-healing: if no pending order exists (e.g. RedeemRequested was missed),
 * creates the order from the finalization event directly.
 */
export async function handleRedeemFinalized(
  tx: PrismaTx,
  args: RedeemFinalizedArgs,
  meta: EventMeta,
): Promise<void> {
  const caliber = addressToCaliber(meta.address);
  const prismaCaliber = CALIBER_TO_PRISMA[caliber] as PrismaCaliber;

  const { count } = await tx.order.updateMany({
    where: {
      onChainOrderId: args.orderId.toString(),
      caliber: prismaCaliber,
      type: "REDEEM",
      status: { in: ["PAID", "PENDING", "APPROVED", "COMPLETED"] },
    },
    data: {
      status: "COMPLETED",
      tokenAmount: args.burnedTokens.toString(),
    },
  });

  // Self-healing: if no pending order exists, create from finalization event
  if (count === 0) {
    const userAddress = args.user.toLowerCase();
    await tx.order.upsert({
      where: {
        txHash_logIndex: {
          txHash: meta.transactionHash,
          logIndex: meta.logIndex,
        },
      },
      create: {
        type: "REDEEM",
        status: "COMPLETED",
        caliber: prismaCaliber,
        tokenAmount: args.burnedTokens.toString(),
        // usdcAmount unknown from finalization event alone -- leave null
        onChainOrderId: args.orderId.toString(),
        walletAddress: userAddress,
        txHash: meta.transactionHash,
        logIndex: meta.logIndex,
        chainId: CHAIN_ID,
        createdAt: meta.blockTimestamp,
        user: {
          connectOrCreate: {
            where: { walletAddress: userAddress },
            create: { walletAddress: userAddress },
          },
        },
      },
      update: {},
    });
  }

  // Write ActivityLog entry for completed redeem
  try {
    const order = await tx.order.findFirst({
      where: {
        onChainOrderId: args.orderId.toString(),
        caliber: prismaCaliber,
        type: "REDEEM",
        status: "COMPLETED",
      },
      select: {
        id: true,
        caliber: true,
        usdcAmount: true,
        tokenAmount: true,
        walletAddress: true,
      },
    });

    if (order) {
      await tx.activityLog.upsert({
        where: {
          txHash_logIndex: {
            txHash: meta.transactionHash,
            logIndex: meta.logIndex,
          },
        },
        create: {
          type: "REDEEM",
          caliber: order.caliber,
          amount: order.usdcAmount ?? order.tokenAmount ?? "0",
          txHash: meta.transactionHash,
          logIndex: meta.logIndex,
          walletAddress: order.walletAddress ?? "",
          createdAt: meta.blockTimestamp,
        },
        update: {},
      });
      console.log(`[redeem] Created ActivityLog entry for redeem ${order.id}`);
    }
  } catch (error) {
    console.error("[redeem] Failed to create ActivityLog entry:", error);
  }
}
