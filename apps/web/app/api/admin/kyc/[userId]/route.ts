import type { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@ammo-exchange/db";
import { requireKeeper } from "@/lib/auth";

// TODO: User contribution — Zod discriminated union for approve/reject actions.
// Consider: max length for rejection reason, whether to require a reason for
// approvals (audit trail), or whether to support bulk actions in the future.
const actionSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("APPROVE") }),
  z.object({
    action: z.literal("REJECT"),
    rejectionReason: z.string().min(1).max(500),
  }),
]);

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  try {
    await requireKeeper();

    const { userId } = await params;

    const body = await request.json().catch(() => null);
    if (!body) {
      return Response.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const parsed = actionSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, kycStatus: true },
    });

    if (!user || user.kycStatus !== "PENDING") {
      return Response.json(
        { error: "User not found or KYC is not pending" },
        { status: 404 },
      );
    }

    const now = new Date();

    if (parsed.data.action === "APPROVE") {
      await prisma.user.update({
        where: { id: userId },
        data: {
          kycStatus: "APPROVED",
          kycRejectionReason: null,
          kycReviewedAt: now,
        },
      });
    } else {
      await prisma.user.update({
        where: { id: userId },
        data: {
          kycStatus: "REJECTED",
          kycRejectionReason: parsed.data.rejectionReason,
          kycReviewedAt: now,
        },
      });
    }

    return Response.json({ success: true });
  } catch (error) {
    if (error instanceof Response) return error;
    throw error;
  }
}
