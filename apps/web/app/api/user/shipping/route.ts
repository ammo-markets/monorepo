import type { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@ammo-exchange/db";
import { RESTRICTED_STATES, VALID_US_STATE_CODES } from "@ammo-exchange/shared";
import { requireSession } from "@/lib/auth";

const defaultShippingSchema = z.object({
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

/** Save or update the user's default shipping address. */
export async function POST(request: NextRequest) {
  try {
    const { address: walletAddress } = await requireSession();

    const body = await request.json().catch(() => null);

    if (!body) {
      return Response.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const parsed = defaultShippingSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    await prisma.user.update({
      where: { walletAddress: walletAddress.toLowerCase() },
      data: {
        defaultShippingName: parsed.data.name,
        defaultShippingLine1: parsed.data.line1,
        defaultShippingLine2: parsed.data.line2 ?? null,
        defaultShippingCity: parsed.data.city,
        defaultShippingState: parsed.data.state,
        defaultShippingZip: parsed.data.zip,
      },
    });

    return Response.json({ success: true });
  } catch (error) {
    if (error instanceof Response) return error;
    throw error;
  }
}
