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
 * Uses a serializable transaction to prevent race conditions from
 * rapid connect/disconnect cycles creating duplicate records.
 *
 * NOTE: This endpoint remains for backward compatibility (worker fallback)
 * but is no longer called from the frontend. Registration is now handled
 * server-side in POST /api/auth/verify.
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

  try {
    const user = await prisma.$transaction(
      async (tx) => {
        return tx.user.upsert({
          where: { walletAddress: normalizedWallet },
          create: { walletAddress: normalizedWallet },
          update: {},
        });
      },
      { isolationLevel: "Serializable" },
    );

    return Response.json({
      walletAddress: user.walletAddress,
      kycStatus: user.kycStatus,
    });
  } catch (err) {
    const code = (err as { code?: string }).code;
    console.error("register: prisma upsert failed", { code, err });

    if (code === "ECONNREFUSED") {
      return Response.json(
        { error: "Database unavailable" },
        { status: 503 },
      );
    }

    return Response.json(
      { error: "Registration failed" },
      { status: 500 },
    );
  }
}
