import type { NextRequest } from "next/server";
import { prisma } from "@ammo-exchange/db";
import { requireKeeper } from "@/lib/auth";

/**
 * POST /api/admin/orders/[id]/backed — Mark a single mint order as backed
 */
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const keeper = await requireKeeper();
    const { id } = await params;

    const order = await prisma.order.findUnique({ where: { id } });

    if (!order || order.type !== "MINT") {
      return Response.json(
        { error: "Mint order not found" },
        { status: 404 },
      );
    }

    if (order.status !== "COMPLETED") {
      return Response.json(
        { error: "Only completed mint orders can be marked as backed" },
        { status: 400 },
      );
    }

    if (order.backedAt) {
      return Response.json(
        { error: "Order is already backed" },
        { status: 400 },
      );
    }

    const now = new Date();

    const updated = await prisma.$transaction(async (tx) => {
      const result = await tx.order.update({
        where: { id },
        data: { backedAt: now, backedBy: keeper.address },
      });

      await tx.auditLog.create({
        data: {
          action: "MARK_BACKED",
          entity: "Order",
          entityId: id,
          metadata: {
            orderId: id,
            caliber: order.caliber,
            rounds: (BigInt(order.tokenAmount ?? "0") / 10n ** 18n).toString(),
            backedBy: keeper.address,
            individual: true,
          },
        },
      });

      return result;
    });

    return Response.json({
      backedAt: updated.backedAt?.toISOString() ?? now.toISOString(),
      backedBy: keeper.address,
    });
  } catch (error) {
    if (error instanceof Response) return error;
    return Response.json(
      { error: "Failed to mark order as backed" },
      { status: 500 },
    );
  }
}
