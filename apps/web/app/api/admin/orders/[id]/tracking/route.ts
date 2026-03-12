import type { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@ammo-exchange/db";
import { requireKeeper } from "@/lib/auth";

const trackingSchema = z.object({
  trackingId: z.string().min(1).max(100),
  carrier: z.string().max(50).optional().default("UPS"),
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

    const parsed = trackingSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const order = await prisma.order.findUnique({ where: { id } });

    if (!order || order.type !== "REDEEM") {
      return Response.json(
        { error: "Redeem order not found" },
        { status: 404 },
      );
    }

    const updated = await prisma.order.update({
      where: { id },
      data: { trackingId: parsed.data.trackingId },
    });

    return Response.json({
      trackingId: updated.trackingId,
      carrier: parsed.data.carrier,
    });
  } catch (error) {
    if (error instanceof Response) return error;
    throw error;
  }
}
