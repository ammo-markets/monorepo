import type { NextRequest } from "next/server";
import { prisma } from "@ammo-exchange/db";
import { requireSession } from "@/lib/auth";

/**
 * GET /api/users/kyc
 *
 * Returns the KYC status for the authenticated user.
 */
export async function GET() {
  try {
    const session = await requireSession();

    const user = await prisma.user.findUnique({
      where: { walletAddress: session.address.toLowerCase() },
      select: { kycStatus: true },
    });

    return Response.json({ kycStatus: user?.kycStatus ?? "NONE" });
  } catch (error) {
    if (error instanceof Response) return error;
    throw error;
  }
}

/**
 * POST /api/users/kyc
 *
 * Auto-approves KYC for testnet. In production, this would integrate
 * a real KYC provider (e.g. Persona, Jumio).
 * AUTH-04: Gated to non-production environments only.
 */
export async function POST(_request: NextRequest) {
  try {
    const session = await requireSession();

    // AUTH-04: KYC auto-approve is testnet only
    if (process.env.NODE_ENV === "production") {
      return Response.json(
        { error: "KYC auto-approve disabled in production" },
        { status: 403 },
      );
    }

    const user = await prisma.user.upsert({
      where: { walletAddress: session.address.toLowerCase() },
      create: {
        walletAddress: session.address.toLowerCase(),
        kycStatus: "APPROVED",
      },
      update: { kycStatus: "APPROVED" },
    });

    return Response.json({ kycStatus: user.kycStatus });
  } catch (error) {
    if (error instanceof Response) return error;
    throw error;
  }
}
