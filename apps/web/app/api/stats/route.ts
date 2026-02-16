import { prisma } from "@ammo-exchange/db";
import { PRISMA_TO_CALIBER } from "@ammo-exchange/shared";
import type { Caliber } from "@ammo-exchange/shared";

export async function GET() {
  try {
    const [rows, registeredUsers, completedOrders] = await Promise.all([
      prisma.protocolStats.findMany(),
      prisma.user.count(),
      prisma.order.findMany({
        where: { status: "COMPLETED" },
        select: { amount: true },
      }),
    ]);

    const stats = rows.map((row) => ({
      caliber: PRISMA_TO_CALIBER[row.caliber] as Caliber,
      totalMinted: row.totalMinted,
      totalRedeemed: row.totalRedeemed,
      netSupply: row.netSupply,
      userCount: row.userCount,
      computedAt: row.computedAt.toISOString(),
    }));

    // Sum totalMinted across all calibers for rounds tokenized
    const roundsTokenized = rows.reduce(
      (sum, row) => sum + Number(row.totalMinted),
      0,
    );

    // Sum completed order amounts as total volume (in rounds traded)
    const totalVolumeRounds = completedOrders.reduce(
      (sum, order) => sum + Number(order.amount),
      0,
    );

    return Response.json({
      stats,
      totalVolumeRounds,
      registeredUsers,
      roundsTokenized,
    });
  } catch {
    return Response.json(
      { error: "Failed to fetch protocol stats" },
      { status: 500 },
    );
  }
}
