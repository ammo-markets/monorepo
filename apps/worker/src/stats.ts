import { prisma } from "@ammo-exchange/db";

import { CALIBERS } from "./lib/constants";

/**
 * Gap-aware backfill: populate ActivityLog from completed orders.
 * Runs on worker startup. Detects time gaps and fills missing windows
 * instead of skipping when rows already exist.
 * Never throws -- logs errors and returns so the worker continues.
 */
export async function backfillActivityLog(): Promise<void> {
  try {
    // Find the latest ActivityLog entry timestamp
    const latestLog = await prisma.activityLog.findFirst({
      orderBy: { createdAt: "desc" },
      select: { createdAt: true },
    });

    // Query completed orders that are newer than the latest log entry
    // If no log entries exist, backfill ALL completed orders
    const where: Record<string, unknown> = { status: "COMPLETED" };
    if (latestLog) {
      where.createdAt = { gt: latestLog.createdAt };
    }

    const orders = await prisma.order.findMany({
      where,
      select: {
        type: true,
        caliber: true,
        usdcAmount: true,
        tokenAmount: true,
        txHash: true,
        logIndex: true,
        walletAddress: true,
        createdAt: true,
      },
    });

    if (orders.length === 0) {
      if (!latestLog) {
        console.log("[backfill] No completed orders to backfill");
      } else {
        console.log("[backfill] ActivityLog up to date, no gaps found");
      }
      return;
    }

    // Use createMany with skipDuplicates to handle idempotency
    // (same txHash may already exist if partially backfilled)
    const result = await prisma.activityLog.createMany({
      data: orders
        .filter((order) => order.txHash !== null)
        .map((order) => ({
          type: order.type,
          caliber: order.caliber,
          amount: order.usdcAmount ?? order.tokenAmount ?? "0",
          txHash: order.txHash!,
          logIndex: order.logIndex,
          walletAddress: order.walletAddress ?? "",
          createdAt: order.createdAt,
        })),
      skipDuplicates: true,
    });

    console.log(
      `[backfill] Backfilled ${result.count} activity log entries${latestLog ? " (gap fill)" : " (initial)"}`,
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

    console.log(
      `[stats] Computed protocol stats for ${CALIBERS.length} calibers`,
    );
  } catch (error) {
    console.error("[stats] Failed to compute stats:", error);
  }
}
