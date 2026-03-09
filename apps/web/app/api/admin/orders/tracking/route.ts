import { prisma } from "@ammo-exchange/db";
import { requireKeeper } from "@/lib/auth";

export async function PATCH(request: Request) {
  try {
    await requireKeeper();

    const body = (await request.json()) as {
      orderId?: string;
      trackingId?: string;
    };

    if (!body.orderId || typeof body.orderId !== "string") {
      return Response.json(
        { error: "orderId is required" },
        { status: 400 },
      );
    }

    if (!body.trackingId || typeof body.trackingId !== "string") {
      return Response.json(
        { error: "trackingId is required" },
        { status: 400 },
      );
    }

    const order = await prisma.order.findUnique({
      where: { id: body.orderId },
      select: { id: true, type: true, status: true },
    });

    if (!order) {
      return Response.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.type !== "REDEEM") {
      return Response.json(
        { error: "Tracking ID can only be set on REDEEM orders" },
        { status: 400 },
      );
    }

    const updated = await prisma.order.update({
      where: { id: body.orderId },
      data: { trackingId: body.trackingId.trim() },
      select: { id: true, trackingId: true },
    });

    return Response.json(updated);
  } catch (error) {
    if (error instanceof Response) return error;
    throw error;
  }
}
