import { prisma } from "@ammo-exchange/db";
import { requireKeeper } from "@/lib/auth";
import {
  CALIBERS,
  CALIBER_SPECS,
  CALIBER_TO_PRISMA,
  PRISMA_TO_CALIBER,
} from "@ammo-exchange/shared";
import type { Caliber } from "@ammo-exchange/shared";

/**
 * GET /api/admin/inventory — Unbacked totals per caliber
 */
export async function GET() {
  try {
    await requireKeeper();

    const unbackedOrders = await prisma.order.findMany({
      where: { type: "MINT", status: "COMPLETED", backedAt: null },
      select: { caliber: true, tokenAmount: true, usdcAmount: true },
    });

    // Aggregate per caliber
    const caliberMap = new Map<
      Caliber,
      { rounds: bigint; orderCount: number; usdcTotal: bigint }
    >();

    for (const order of unbackedOrders) {
      const caliber = PRISMA_TO_CALIBER[order.caliber];
      const existing = caliberMap.get(caliber) ?? {
        rounds: 0n,
        orderCount: 0,
        usdcTotal: 0n,
      };
      existing.rounds += BigInt(order.tokenAmount ?? "0");
      existing.orderCount += 1;
      existing.usdcTotal += BigInt(order.usdcAmount ?? "0");
      caliberMap.set(caliber, existing);
    }

    const unbacked = CALIBERS.map((caliber) => {
      const data = caliberMap.get(caliber);
      return {
        caliber,
        name: CALIBER_SPECS[caliber].name,
        rounds: data ? (data.rounds / 10n ** 18n).toString() : "0",
        orderCount: data?.orderCount ?? 0,
        usdcTotal: data ? (Number(data.usdcTotal) / 1e6).toFixed(2) : "0.00",
      };
    });

    return Response.json({
      unbacked,
      totalUnbackedOrders: unbackedOrders.length,
    });
  } catch (error) {
    if (error instanceof Response) return error;
    return Response.json(
      { error: "Failed to read inventory" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/admin/inventory — Mark all unbacked orders for a caliber as backed
 */
export async function POST(request: Request) {
  try {
    const keeper = await requireKeeper();

    const body = (await request.json()) as { caliber?: string };
    if (!body.caliber) {
      return Response.json({ error: "caliber is required" }, { status: 400 });
    }

    // Validate caliber
    const validCalibers = new Set(CALIBERS);
    if (!validCalibers.has(body.caliber as Caliber)) {
      return Response.json({ error: "Invalid caliber" }, { status: 400 });
    }

    const caliber = body.caliber as Caliber;
    const prismaCaliber = CALIBER_TO_PRISMA[caliber];
    const now = new Date();

    const result = await prisma.$transaction(async (tx) => {
      // Sum unbacked orders for response
      const unbackedOrders = await tx.order.findMany({
        where: {
          type: "MINT",
          status: "COMPLETED",
          backedAt: null,
          caliber: prismaCaliber,
        },
        select: { tokenAmount: true },
      });

      const totalRounds = unbackedOrders.reduce(
        (sum, o) => sum + BigInt(o.tokenAmount ?? "0"),
        0n,
      );

      // Batch update
      const updated = await tx.order.updateMany({
        where: {
          type: "MINT",
          status: "COMPLETED",
          backedAt: null,
          caliber: prismaCaliber,
        },
        data: { backedAt: now, backedBy: keeper.address },
      });

      // Audit log
      await tx.auditLog.create({
        data: {
          action: "MARK_BACKED",
          entity: "Order",
          entityId: caliber,
          metadata: {
            caliber,
            markedCount: updated.count,
            rounds: (totalRounds / 10n ** 18n).toString(),
            backedBy: keeper.address,
          },
        },
      });

      return {
        markedCount: updated.count,
        rounds: (totalRounds / 10n ** 18n).toString(),
      };
    });

    return Response.json({
      ...result,
      backedAt: now.toISOString(),
      backedBy: keeper.address,
    });
  } catch (error) {
    if (error instanceof Response) return error;
    return Response.json(
      { error: "Failed to mark orders as backed" },
      { status: 500 },
    );
  }
}
