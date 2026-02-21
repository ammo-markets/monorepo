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
        select: { usdcAmount: true },
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
    // Use BigInt accumulation to avoid Number truncation, return as string
    const totalVolumeUsdBigInt = mintOrders.reduce(
      (sum, order) =>
        sum + (order.usdcAmount ? BigInt(order.usdcAmount) : BigInt(0)),
      BigInt(0),
    );
    const totalVolumeUsd = (
      totalVolumeUsdBigInt / BigInt(1_000_000)
    ).toString();

    // Rounds tokenized: sum totalMinted across calibers (now in token-wei), convert to human count (18 decimals)
    // Use BigInt accumulation, return as string
    const roundsTokenizedBigInt = rows.reduce(
      (sum, row) => sum + BigInt(row.totalMinted),
      BigInt(0),
    );
    const roundsTokenized = (
      roundsTokenizedBigInt / BigInt(10) ** BigInt(18)
    ).toString();

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
