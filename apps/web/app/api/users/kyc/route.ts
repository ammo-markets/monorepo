import type { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@ammo-exchange/db";

const walletSchema = z.object({
  wallet: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
});

/**
 * GET /api/users/kyc?wallet=0x...
 *
 * Returns the KYC status for a wallet address.
 */
export async function GET(request: NextRequest) {
  const wallet = request.nextUrl.searchParams.get("wallet") ?? "";

  const parsed = walletSchema.safeParse({ wallet });

  if (!parsed.success) {
    return Response.json(
      { error: "Invalid wallet address", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const user = await prisma.user.findUnique({
    where: { walletAddress: parsed.data.wallet.toLowerCase() },
    select: { kycStatus: true },
  });

  return Response.json({ kycStatus: user?.kycStatus ?? "NONE" });
}

/**
 * POST /api/users/kyc
 *
 * Auto-approves KYC for testnet. In production, this would integrate
 * a real KYC provider (e.g. Persona, Jumio).
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

  const user = await prisma.user.upsert({
    where: { walletAddress: parsed.data.wallet.toLowerCase() },
    create: {
      walletAddress: parsed.data.wallet.toLowerCase(),
      kycStatus: "APPROVED",
    },
    update: { kycStatus: "APPROVED" },
  });

  return Response.json({ kycStatus: user.kycStatus });
}
