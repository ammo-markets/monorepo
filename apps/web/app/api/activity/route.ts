import { prisma } from "@ammo-exchange/db";
import { PRISMA_TO_CALIBER } from "@ammo-exchange/shared";
import type { Caliber } from "@ammo-exchange/shared";
import { serializeBigInts } from "@/lib/serialize";

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      where: { status: "COMPLETED" },
      orderBy: { updatedAt: "desc" },
      take: 10,
      select: {
        id: true,
        type: true,
        amount: true,
        walletAddress: true,
        caliber: true,
        updatedAt: true,
      },
    });

    const activity = orders.map((order) => ({
      id: order.id,
      type: order.type as "MINT" | "REDEEM",
      amount: order.amount,
      walletAddress: order.walletAddress ?? "0x0000...0000",
      caliber: PRISMA_TO_CALIBER[order.caliber] as Caliber,
      updatedAt: order.updatedAt.toISOString(),
    }));

    return Response.json({ activity: serializeBigInts(activity) });
  } catch {
    return Response.json(
      { error: "Failed to fetch activity" },
      { status: 500 },
    );
  }
}
