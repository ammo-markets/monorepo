import type { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@ammo-exchange/db";
import { requireKeeper } from "@/lib/auth";

const cancelReasonSchema = z.object({
  reason: z.string().min(1, "Reason is required").max(500),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireKeeper();
    const { id } = await params;

    const body = await request.json().catch(() => null);

    if (!body) {
      return Response.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const parsed = cancelReasonSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const order = await prisma.order.findUnique({ where: { id } });

    if (!order) {
      return Response.json({ error: "Order not found" }, { status: 404 });
    }

    // Accept reason for PENDING or CANCELLED orders — the on-chain cancel tx
    // may have confirmed but the worker hasn't updated the DB status yet.
    if (order.status !== "CANCELLED" && order.status !== "PENDING") {
      return Response.json(
        { error: "Order cannot be cancelled in its current state" },
        { status: 400 },
      );
    }

    await prisma.order.update({
      where: { id },
      data: { cancellationReason: parsed.data.reason },
    });

    return Response.json({ success: true });
  } catch (error) {
    if (error instanceof Response) return error;
    throw error;
  }
}
