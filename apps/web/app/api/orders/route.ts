import type { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@ammo-exchange/db";
import { PRISMA_TO_CALIBER } from "@ammo-exchange/shared";
import type { Caliber } from "@ammo-exchange/shared";
import { serializeBigInts } from "@/lib/serialize";

const querySchema = z.object({
  wallet: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  type: z.enum(["MINT", "REDEEM"]).optional(),
});

export async function GET(request: NextRequest) {
  const walletParam = request.nextUrl.searchParams.get("wallet");
  const typeParam = request.nextUrl.searchParams.get("type");

  const parsed = querySchema.safeParse({
    wallet: walletParam,
    ...(typeParam ? { type: typeParam } : {}),
  });

  if (!parsed.success) {
    return Response.json({ error: "Invalid wallet address" }, { status: 400 });
  }

  const { wallet, type } = parsed.data;

  const orders = await prisma.order.findMany({
    where: {
      walletAddress: wallet.toLowerCase(),
      ...(type ? { type } : {}),
    },
    orderBy: { createdAt: "desc" },
    include: { shippingAddress: true },
  });

  const mappedOrders = orders.map((order) => ({
    ...order,
    caliber: PRISMA_TO_CALIBER[order.caliber] as Caliber,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
  }));

  return Response.json({ orders: serializeBigInts(mappedOrders) });
}
