import type { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@ammo-exchange/db";

const walletSchema = z.object({
  wallet: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
});

/**
 * POST /api/users/register
 *
 * Auto-registers a user by wallet address on first connect.
 * Uses upsert so duplicate calls are idempotent (no-op update).
 */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);

  if (!body) {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = walletSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json(
      { error: "Invalid wallet address", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const normalizedWallet = parsed.data.wallet.toLowerCase();

  const user = await prisma.user.upsert({
    where: { walletAddress: normalizedWallet },
    create: { walletAddress: normalizedWallet },
    update: {},
  });

  return Response.json({
    walletAddress: user.walletAddress,
    kycStatus: user.kycStatus,
  });
}
