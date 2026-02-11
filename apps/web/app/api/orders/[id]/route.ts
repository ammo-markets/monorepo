import type { NextRequest } from "next/server";
import { prisma } from "@ammo-exchange/db";
import { PRISMA_TO_CALIBER } from "@ammo-exchange/shared";
import type { Caliber } from "@ammo-exchange/shared";
import { serializeBigInts } from "@/lib/serialize";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: { shippingAddress: true },
  });

  if (!order) {
    return Response.json({ error: "Order not found" }, { status: 404 });
  }

  const mapped = {
    id: order.id,
    type: order.type,
    status: order.status,
    caliber: PRISMA_TO_CALIBER[order.caliber] as Caliber,
    amount: order.amount,
    onChainOrderId: order.onChainOrderId,
    walletAddress: order.walletAddress,
    txHash: order.txHash,
    chainId: order.chainId,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
    shippingAddress: order.shippingAddress,
  };

  return Response.json({ order: serializeBigInts(mapped) });
}
