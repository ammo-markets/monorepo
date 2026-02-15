import type { NextRequest } from "next/server";
import { prisma } from "@ammo-exchange/db";
import { PRISMA_TO_CALIBER } from "@ammo-exchange/shared";
import type { Caliber } from "@ammo-exchange/shared";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get("limit");
    const limit = Math.min(Math.max(Number(limitParam) || 5, 1), 50);

    const rows = await prisma.activityLog.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    const activity = rows.map((row) => ({
      id: row.id,
      type: row.type as "MINT" | "REDEEM",
      caliber: PRISMA_TO_CALIBER[row.caliber] as Caliber,
      amount: row.amount,
      txHash: row.txHash,
      walletAddress: row.walletAddress,
      createdAt: row.createdAt.toISOString(),
    }));

    return Response.json({ activity });
  } catch {
    return Response.json(
      { error: "Failed to fetch activity" },
      { status: 500 },
    );
  }
}
