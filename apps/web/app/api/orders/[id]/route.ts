import type { NextRequest } from "next/server";
import { prisma } from "@ammo-exchange/db";
import { PRISMA_TO_CALIBER } from "@ammo-exchange/shared";
import type { Caliber } from "@ammo-exchange/shared";
import { serializeBigInts } from "@/lib/serialize";
import { isAddress } from "viem";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const address = request.nextUrl.searchParams.get("address");
    const { id } = await params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: { shippingAddress: true },
    });

    if (!order) {
      return Response.json({ error: "Order not found" }, { status: 404 });
    }

    // If caller provides address, verify ownership; otherwise omit shipping
    const isOwner =
      address &&
      isAddress(address) &&
      order.walletAddress?.toLowerCase() === address.toLowerCase();

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
      trackingId: order.trackingId,
      chainId: order.chainId,
      mintPrice: order.mintPrice,
      refundAmount: order.refundAmount,
      feeAmount: order.feeAmount,
      cancellationReason: order.cancellationReason,
      deadline: order.deadline?.toISOString() ?? null,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
      shippingAddress: isOwner ? order.shippingAddress : null,
    };

    return Response.json({ order: serializeBigInts(mapped) });
  } catch (error) {
    if (error instanceof Response) return error;
    throw error;
  }
}
