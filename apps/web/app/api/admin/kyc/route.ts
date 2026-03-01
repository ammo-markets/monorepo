import type { NextRequest } from "next/server";
import { prisma } from "@ammo-exchange/db";
import { requireKeeper } from "@/lib/auth";

const VALID_STATUSES = new Set(["PENDING", "APPROVED", "REJECTED"]);

export async function GET(request: NextRequest) {
  try {
    await requireKeeper();

    const params = request.nextUrl.searchParams;
    const statusParam = params.get("status");
    const searchParam = params.get("search");
    const pageParam = params.get("page");
    const limitParam = params.get("limit");

    if (statusParam && !VALID_STATUSES.has(statusParam)) {
      return Response.json(
        {
          error: `Invalid status. Must be one of: ${[...VALID_STATUSES].join(", ")}.`,
        },
        { status: 400 },
      );
    }

    const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);
    const limit = Math.min(
      100,
      Math.max(1, parseInt(limitParam ?? "20", 10) || 20),
    );
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {
      kycStatus: statusParam
        ? statusParam
        : { not: "NONE" },
    };

    if (searchParam) {
      where.OR = [
        { walletAddress: { contains: searchParam, mode: "insensitive" } },
        { kycFullName: { contains: searchParam, mode: "insensitive" } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { kycSubmittedAt: "desc" },
        select: {
          id: true,
          walletAddress: true,
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
      }),
      prisma.user.count({ where }),
    ]);

    const mappedUsers = users.map((user) => ({
      ...user,
      kycDateOfBirth: user.kycDateOfBirth?.toISOString() ?? null,
      kycSubmittedAt: user.kycSubmittedAt?.toISOString() ?? null,
      kycReviewedAt: user.kycReviewedAt?.toISOString() ?? null,
    }));

    return Response.json({
      users: mappedUsers,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    if (error instanceof Response) return error;
    throw error;
  }
}
