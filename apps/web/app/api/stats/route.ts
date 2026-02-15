import { prisma } from "@ammo-exchange/db";
import { PRISMA_TO_CALIBER } from "@ammo-exchange/shared";
import type { Caliber } from "@ammo-exchange/shared";

export async function GET() {
  try {
    const rows = await prisma.protocolStats.findMany();

    const stats = rows.map((row) => ({
      caliber: PRISMA_TO_CALIBER[row.caliber] as Caliber,
      totalMinted: row.totalMinted,
      totalRedeemed: row.totalRedeemed,
      netSupply: row.netSupply,
      userCount: row.userCount,
      computedAt: row.computedAt.toISOString(),
    }));

    return Response.json({ stats });
  } catch {
    return Response.json(
      { error: "Failed to fetch protocol stats" },
      { status: 500 },
    );
  }
}
