import type { NextRequest } from "next/server";
import { prisma } from "@ammo-exchange/db";
import { PRISMA_TO_CALIBER } from "@ammo-exchange/shared";
import type { Caliber } from "@ammo-exchange/shared";
import { serializeBigInts } from "@/lib/serialize";
import { isAddress } from "viem";

export async function GET(request: NextRequest) {
  try {
    const address = request.nextUrl.searchParams.get("address");

    if (!address || !isAddress(address)) {
      return Response.json(
        { error: "Valid address query parameter required" },
        { status: 400 },
      );
    }

    const typeParam = request.nextUrl.searchParams.get("type");

    const orders = await prisma.order.findMany({
      where: {
        walletAddress: address.toLowerCase(),
        ...(typeParam && (typeParam === "MINT" || typeParam === "REDEEM")
          ? { type: typeParam }
          : {}),
      },
      orderBy: { createdAt: "desc" },
      include: { shippingAddress: true },
    });

    const mappedOrders = orders.map((order) => ({
      ...order,
      caliber: PRISMA_TO_CALIBER[order.caliber] as Caliber,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
    }));

    return Response.json({ orders: serializeBigInts(mappedOrders) });
  } catch (error) {
    if (error instanceof Response) return error;
    throw error;
  }
}
