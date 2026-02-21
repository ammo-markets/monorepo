import type { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@ammo-exchange/db";
import { VALID_US_STATE_CODES } from "@ammo-exchange/shared";
import { requireSession } from "@/lib/auth";

const addressSchema = z.object({
  defaultShippingName: z.string().min(1).max(100),
  defaultShippingLine1: z.string().min(1).max(200),
  defaultShippingLine2: z.string().max(200).optional().nullable(),
  defaultShippingCity: z.string().min(1).max(100),
  defaultShippingState: z
    .string()
    .length(2)
    .transform((s) => s.toUpperCase())
    .refine((s) => VALID_US_STATE_CODES.has(s), {
      message: "Invalid US state code",
    }),
  defaultShippingZip: z.string().regex(/^\d{5}(-\d{4})?$/),
});

const profileSelect = {
  walletAddress: true,
  kycStatus: true,
  defaultShippingName: true,
  defaultShippingLine1: true,
  defaultShippingLine2: true,
  defaultShippingCity: true,
  defaultShippingState: true,
  defaultShippingZip: true,
} as const;

export async function GET() {
  try {
    const session = await requireSession();

    const user = await prisma.user.findUnique({
      where: { walletAddress: session.address.toLowerCase() },
      select: profileSelect,
    });

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    return Response.json(user);
  } catch (error) {
    if (error instanceof Response) return error;
    throw error;
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await requireSession();

    const body = await request.json().catch(() => null);

    if (!body) {
      return Response.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const parsed = addressSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const user = await prisma.user.update({
      where: { walletAddress: session.address.toLowerCase() },
      data: parsed.data,
      select: profileSelect,
    });

    return Response.json(user);
  } catch (error) {
    if (error instanceof Response) return error;
    throw error;
  }
}
