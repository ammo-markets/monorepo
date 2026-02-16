import type { NextRequest } from "next/server";
import { prisma } from "@ammo-exchange/db";
import { PRISMA_TO_CALIBER, CALIBER_TO_PRISMA } from "@ammo-exchange/shared";
import type { Caliber } from "@ammo-exchange/shared";
import { serializeBigInts } from "@/lib/serialize";
import { requireKeeper } from "@/lib/auth";

const VALID_STATUSES = new Set([
  "PENDING",
  "PROCESSING",
  "COMPLETED",
  "FAILED",
  "CANCELLED",
]);

const VALID_CALIBERS = new Set(Object.keys(CALIBER_TO_PRISMA));

export async function GET(request: NextRequest) {
  try {
    await requireKeeper();

    const params = request.nextUrl.searchParams;
    const typeParam = params.get("type");
    const statusParam = params.get("status");
    const searchParam = params.get("search");
    const caliberParam = params.get("caliber");
    const pageParam = params.get("page");
    const limitParam = params.get("limit");

    // Validate type param if provided
    if (typeParam && typeParam !== "MINT" && typeParam !== "REDEEM") {
      return Response.json(
        { error: 'Invalid type. Must be "MINT" or "REDEEM".' },
        { status: 400 },
      );
    }

    // Validate status param if provided
    if (statusParam && !VALID_STATUSES.has(statusParam)) {
      return Response.json(
        {
          error: `Invalid status. Must be one of: ${[...VALID_STATUSES].join(", ")}.`,
        },
        { status: 400 },
      );
    }

    // Validate caliber param if provided
    if (caliberParam && !VALID_CALIBERS.has(caliberParam)) {
      return Response.json(
        {
          error: `Invalid caliber. Must be one of: ${[...VALID_CALIBERS].join(", ")}.`,
        },
        { status: 400 },
      );
    }

    // Parse pagination
    const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);
    const limit = Math.min(
      100,
      Math.max(1, parseInt(limitParam ?? "20", 10) || 20),
    );
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Record<string, unknown> = {};

    if (typeParam) {
      where.type = typeParam as "MINT" | "REDEEM";
    }

    if (statusParam) {
      where.status = statusParam;
    }

    if (caliberParam) {
      where.caliber =
        CALIBER_TO_PRISMA[caliberParam as keyof typeof CALIBER_TO_PRISMA];
    }

    if (searchParam) {
      where.OR = [
        { id: { contains: searchParam, mode: "insensitive" } },
        { walletAddress: { contains: searchParam, mode: "insensitive" } },
        { txHash: { contains: searchParam, mode: "insensitive" } },
        { onChainOrderId: { contains: searchParam, mode: "insensitive" } },
      ];
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          shippingAddress: true,
          user: { select: { kycStatus: true } },
        },
      }),
      prisma.order.count({ where }),
    ]);

    const mappedOrders = orders.map((order) => ({
      ...order,
      caliber: PRISMA_TO_CALIBER[order.caliber] as Caliber,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
    }));

    return Response.json({
      orders: serializeBigInts(mappedOrders),
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
