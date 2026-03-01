import type { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@ammo-exchange/db";
import { VALID_US_STATE_CODES } from "@ammo-exchange/shared";
import { requireSession } from "@/lib/auth";

const kycSchema = z.object({
  fullName: z.string().min(1).max(100),
  dateOfBirth: z.string().refine(
    (val) => {
      const dob = new Date(val);
      const now = new Date();
      const age = now.getFullYear() - dob.getFullYear();
      const monthDiff = now.getMonth() - dob.getMonth();
      const dayDiff = now.getDate() - dob.getDate();
      const adjustedAge =
        monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? age - 1 : age;
      return adjustedAge >= 18;
    },
    { message: "Must be at least 18 years old" },
  ),
  state: z
    .string()
    .length(2)
    .transform((s) => s.toUpperCase())
    .refine((s) => VALID_US_STATE_CODES.has(s), {
      message: "Invalid US state code",
    }),
  govIdType: z.enum(["DRIVERS_LICENSE", "PASSPORT", "STATE_ID"]),
  govIdNumber: z.string().min(5),
});

/**
 * GET /api/users/kyc
 *
 * Returns the KYC status and identity fields for the authenticated user.
 */
export async function GET() {
  try {
    const session = await requireSession();

    const user = await prisma.user.findUnique({
      where: { walletAddress: session.address.toLowerCase() },
      select: {
        kycStatus: true,
        kycFullName: true,
        kycDateOfBirth: true,
        kycState: true,
        kycGovIdType: true,
        kycGovIdNumber: true,
        kycRejectionReason: true,
        kycSubmittedAt: true,
        kycReviewedAt: true,
      },
    });

    // SEC-01: Never expose full govIdNumber -- mask to last 4 characters
    const maskedGovId = user?.kycGovIdNumber
      ? `****${user.kycGovIdNumber.slice(-4)}`
      : null;

    return Response.json({
      kycStatus: user?.kycStatus ?? "NONE",
      kycFullName: user?.kycFullName ?? null,
      kycDateOfBirth: user?.kycDateOfBirth ?? null,
      kycState: user?.kycState ?? null,
      kycGovIdType: user?.kycGovIdType ?? null,
      kycGovIdNumber: maskedGovId,
      kycRejectionReason: user?.kycRejectionReason ?? null,
      kycSubmittedAt: user?.kycSubmittedAt?.toISOString() ?? null,
      kycReviewedAt: user?.kycReviewedAt?.toISOString() ?? null,
    });
  } catch (error) {
    if (error instanceof Response) return error;
    throw error;
  }
}

/**
 * POST /api/users/kyc
 *
 * Accepts identity data, validates it, stores in User model,
 * and sets KYC status to PENDING for admin review.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await requireSession();

    const body = await request.json().catch(() => null);
    if (!body) {
      return Response.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const parsed = kycSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const now = new Date();

    const user = await prisma.user.upsert({
      where: { walletAddress: session.address.toLowerCase() },
      create: {
        walletAddress: session.address.toLowerCase(),
        kycStatus: "PENDING",
        kycFullName: parsed.data.fullName,
        kycDateOfBirth: new Date(parsed.data.dateOfBirth),
        kycState: parsed.data.state,
        kycGovIdType: parsed.data.govIdType,
        kycGovIdNumber: parsed.data.govIdNumber,
        kycSubmittedAt: now,
      },
      update: {
        kycStatus: "PENDING",
        kycFullName: parsed.data.fullName,
        kycDateOfBirth: new Date(parsed.data.dateOfBirth),
        kycState: parsed.data.state,
        kycGovIdType: parsed.data.govIdType,
        kycGovIdNumber: parsed.data.govIdNumber,
        kycSubmittedAt: now,
        kycRejectionReason: null,
        kycReviewedAt: null,
      },
    });

    return Response.json({ kycStatus: user.kycStatus });
  } catch (error) {
    if (error instanceof Response) return error;
    throw error;
  }
}
