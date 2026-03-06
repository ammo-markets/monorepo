import type { PrismaTx } from "../lib/cursor";
import type { EventMeta } from "../lib/constants";
import { addressToCaliber, CHAIN_ID } from "../lib/constants";
import { CALIBER_TO_PRISMA } from "@ammo-exchange/shared";
import type { Caliber as PrismaCaliber } from "@ammo-exchange/db";

// ── Event Argument Types ────────────────────────────────────────────

export interface MintedArgs {
  user: `0x${string}`;
  caliberId: `0x${string}`;
  usdcAmount: bigint;
  tokenAmount: bigint;
  priceUsed: bigint;
  refundAmount: bigint;
}

// ── Handlers ────────────────────────────────────────────────────────

/**
 * Handle a Minted event from the 1-step mint flow.
 *
 * Creates a COMPLETED order directly — no PENDING→COMPLETED transition needed.
 * Uses composite (txHash, logIndex) upsert for idempotency (safe to reprocess).
 * Auto-creates User records via connectOrCreate for new wallets.
 */
export async function handleMinted(
  tx: PrismaTx,
  args: MintedArgs,
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
      type: "MINT",
      status: "COMPLETED",
      caliber: prismaCaliber,
      usdcAmount: args.usdcAmount.toString(),
      tokenAmount: args.tokenAmount.toString(),
      mintPrice: args.priceUsed.toString(),
      refundAmount: args.refundAmount.toString(),
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

  // Write ActivityLog entry for completed mint (idempotent via txHash+logIndex)
  try {
    await tx.activityLog.upsert({
      where: {
        txHash_logIndex: {
          txHash: meta.transactionHash,
          logIndex: meta.logIndex,
        },
      },
      create: {
        type: "MINT",
        caliber: prismaCaliber,
        amount: args.usdcAmount.toString(),
        txHash: meta.transactionHash,
        logIndex: meta.logIndex,
        walletAddress: userAddress,
        createdAt: meta.blockTimestamp,
      },
      update: {},
    });
  } catch (error) {
    console.error("[mint] Failed to create ActivityLog entry:", error);
  }
}
