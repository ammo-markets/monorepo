import { prisma } from "@ammo-exchange/db";
import { PRISMA_TO_CALIBER } from "@ammo-exchange/shared";
import type { Caliber } from "@ammo-exchange/shared";

export async function GET() {
  try {
    const [rows, registeredUsers, mintOrders] = await Promise.all([
      prisma.protocolStats.findMany(),
      prisma.user.count(),
      prisma.order.findMany({
        where: { type: "MINT", status: "COMPLETED" },
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

    // Trading volume: sum USDC-wei from completed MINT orders, convert to USD (6 decimals)
    const totalVolumeUsd = mintOrders.reduce(
      (sum, order) => sum + Number(BigInt(order.amount)) / 1e6,
      0,
    );

    // Rounds tokenized: sum totalMinted across calibers (now in token-wei), convert to human count (18 decimals)
    const roundsTokenized = rows.reduce(
      (sum, row) => sum + Number(BigInt(row.totalMinted)) / 1e18,
      0,
    );

    return Response.json(
      {
        stats,
        totalVolumeUsd,
        registeredUsers,
        roundsTokenized,
      },
      {
        headers: {
          "Cache-Control": "s-maxage=60, stale-while-revalidate=300",
        },
      },
    );
  } catch {
    return Response.json(
      { error: "Failed to fetch protocol stats" },
      { status: 500 },
    );
  }
}
