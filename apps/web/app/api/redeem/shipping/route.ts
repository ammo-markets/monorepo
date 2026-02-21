import type { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@ammo-exchange/db";
import { RESTRICTED_STATES, VALID_US_STATE_CODES } from "@ammo-exchange/shared";
import { requireSession } from "@/lib/auth";

const shippingSchema = z.object({
  orderId: z.string().min(1),
  name: z.string().min(1).max(100),
  line1: z.string().min(1).max(200),
  line2: z.string().max(200).optional(),
  city: z.string().min(1).max(100),
  state: z
    .string()
    .length(2)
    .transform((s) => s.toUpperCase())
    .refine((s) => VALID_US_STATE_CODES.has(s), {
      message: "Invalid US state code",
    })
    .refine(
      (s) =>
        !RESTRICTED_STATES.includes(s as (typeof RESTRICTED_STATES)[number]),
      { message: "Shipping to this state is restricted" },
    ),
  zip: z.string().regex(/^\d{5}(-\d{4})?$/),
});

export async function POST(request: NextRequest) {
  try {
    const session = await requireSession();

    const body = await request.json().catch(() => null);

    if (!body) {
      return Response.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const parsed = shippingSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { orderId, ...address } = parsed.data;

    // Verify order exists and is a REDEEM order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order || order.type !== "REDEEM") {
      return Response.json(
        { error: "Redeem order not found" },
        { status: 404 },
      );
    }

    // AUTH-05: Verify caller owns this order
    if (order.walletAddress?.toLowerCase() !== session.address.toLowerCase()) {
      return Response.json({ error: "Not your order" }, { status: 403 });
    }

    const shipping = await prisma.shippingAddress.upsert({
      where: { orderId },
      create: { orderId, ...address },
      update: address,
    });

    return Response.json({ shipping }, { status: 201 });
  } catch (error) {
    if (error instanceof Response) return error;
    throw error;
  }
}
