import type { NextRequest } from "next/server";
import { prisma } from "@ammo-exchange/db";
import { PRISMA_TO_CALIBER } from "@ammo-exchange/shared";
import type { Caliber } from "@ammo-exchange/shared";
import { serializeBigInts } from "@/lib/serialize";

export async function GET(request: NextRequest) {
  const typeParam = request.nextUrl.searchParams.get("type");

  // Validate type param if provided
  if (typeParam && typeParam !== "MINT" && typeParam !== "REDEEM") {
    return Response.json(
      { error: 'Invalid type. Must be "MINT" or "REDEEM".' },
      { status: 400 },
    );
  }

  const orders = await prisma.order.findMany({
    where: {
      status: "PENDING",
      ...(typeParam ? { type: typeParam as "MINT" | "REDEEM" } : {}),
    },
    orderBy: { createdAt: "desc" },
    include: {
      shippingAddress: true,
      user: { select: { kycStatus: true } },
    },
  });

  const mappedOrders = orders.map((order) => ({
    ...order,
    caliber: PRISMA_TO_CALIBER[order.caliber] as Caliber,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
  }));

  return Response.json({ orders: serializeBigInts(mappedOrders) });
}
