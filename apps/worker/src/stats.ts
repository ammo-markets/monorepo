import { prisma } from "@ammo-exchange/db";
import type { Caliber } from "@ammo-exchange/db";

// All 4 calibers to compute stats for
const CALIBERS: Caliber[] = [
  "NINE_MM",
  "FIVE_FIVE_SIX",
  "TWENTY_TWO_LR",
  "THREE_OH_EIGHT",
];

/**
 * One-time backfill: populate ActivityLog from completed orders.
 * Runs on worker startup. Skips if ActivityLog already has rows.
 * Never throws -- logs errors and returns so the worker continues.
 */
export async function backfillActivityLog(): Promise<void> {
  try {
    const count = await prisma.activityLog.count();

    if (count > 0) {
      console.log(
        `[backfill] ActivityLog already populated (${count} rows), skipping`,
      );
      return;
    }

    const orders = await prisma.order.findMany({
      where: { status: "COMPLETED" },
      select: {
        type: true,
        caliber: true,
        usdcAmount: true,
        tokenAmount: true,
        txHash: true,
        walletAddress: true,
        updatedAt: true,
      },
    });

    if (orders.length === 0) {
      console.log("[backfill] No completed orders to backfill");
      return;
    }

    await prisma.activityLog.createMany({
      data: orders.map((order) => ({
        type: order.type,
        caliber: order.caliber,
        amount: order.usdcAmount ?? order.tokenAmount ?? "0",
        txHash: order.txHash,
        walletAddress: order.walletAddress ?? "",
        createdAt: order.updatedAt,
      })),
    });

    console.log(
      `[backfill] Backfilled ${orders.length} completed orders into ActivityLog`,
    );
  } catch (error) {
    console.error("[backfill] Failed to backfill ActivityLog:", error);
  }
}

/**
 * Periodic stats recomputation: aggregate per-caliber metrics from completed orders.
 * Upserts ProtocolStats rows for each caliber.
 * Never throws -- logs errors and returns so the cron continues.
 */
export async function computeStats(): Promise<void> {
  try {
    for (const caliber of CALIBERS) {
      const completedOrders = await prisma.order.findMany({
        where: { caliber, status: "COMPLETED" },
        select: {
          type: true,
          usdcAmount: true,
          tokenAmount: true,
          walletAddress: true,
        },
      });

      let totalMinted = 0n;
      let totalRedeemed = 0n;
      const uniqueWallets = new Set<string>();

      for (const order of completedOrders) {
        // Use tokenAmount (18-dec token-wei) for consistent units.
        // Orders created before the migration won't have tokenAmount — skip them (contribute 0).
        const tokenWei = order.tokenAmount ? BigInt(order.tokenAmount) : 0n;
        if (order.type === "MINT") {
          totalMinted += tokenWei;
        } else {
          totalRedeemed += tokenWei;
        }
        if (order.walletAddress) {
          uniqueWallets.add(order.walletAddress);
        }
      }

      const netSupply = totalMinted - totalRedeemed;

      await prisma.protocolStats.upsert({
        where: { caliber },
        create: {
          caliber,
          totalMinted: totalMinted.toString(),
          totalRedeemed: totalRedeemed.toString(),
          netSupply: netSupply.toString(),
          userCount: uniqueWallets.size,
          computedAt: new Date(),
        },
        update: {
          totalMinted: totalMinted.toString(),
          totalRedeemed: totalRedeemed.toString(),
          netSupply: netSupply.toString(),
          userCount: uniqueWallets.size,
          computedAt: new Date(),
        },
      });
    }

    console.log("[stats] Computed protocol stats for 4 calibers");
  } catch (error) {
    console.error("[stats] Failed to compute stats:", error);
  }
}
