import { prisma } from "@ammo-exchange/db";
import { PRISMA_TO_CALIBER } from "@ammo-exchange/shared";
import type { Caliber } from "@ammo-exchange/shared";

export async function GET() {
  try {
    const rows = await prisma.caliberPrice.findMany();

    const prices: Record<string, string> = {};
    for (const row of rows) {
      const caliber = PRISMA_TO_CALIBER[row.caliber] as Caliber | undefined;
      if (caliber) {
        prices[caliber] = row.priceX18;
      }
    }

    return Response.json(
      { prices },
      {
        headers: {
          "Cache-Control": "s-maxage=30, stale-while-revalidate=60",
        },
      },
    );
  } catch {
    return Response.json(
      { error: "Failed to fetch prices" },
      { status: 500 },
    );
  }
}
