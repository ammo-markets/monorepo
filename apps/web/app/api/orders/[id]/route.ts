import type { NextRequest } from "next/server";
import { prisma } from "@ammo-exchange/db";
import { PRISMA_TO_CALIBER } from "@ammo-exchange/shared";
import type { Caliber } from "@ammo-exchange/shared";
import { serializeBigInts } from "@/lib/serialize";
import { requireSession } from "@/lib/auth";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireSession();
    const { id } = await params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: { shippingAddress: true },
    });

    if (!order) {
      return Response.json({ error: "Order not found" }, { status: 404 });
    }

    // Verify caller owns this order
    if (order.walletAddress?.toLowerCase() !== session.address.toLowerCase()) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const mapped = {
      id: order.id,
      type: order.type,
      status: order.status,
      caliber: PRISMA_TO_CALIBER[order.caliber] as Caliber,
      usdcAmount: order.usdcAmount,
      tokenAmount: order.tokenAmount,
      onChainOrderId: order.onChainOrderId,
      walletAddress: order.walletAddress,
      txHash: order.txHash,
      chainId: order.chainId,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
      shippingAddress: order.shippingAddress,
    };

    return Response.json({ order: serializeBigInts(mapped) });
  } catch (error) {
    if (error instanceof Response) return error;
    throw error;
  }
}
