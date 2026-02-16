import type { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@ammo-exchange/db";
import { requireSession } from "@/lib/auth";
import { PRISMA_TO_CALIBER, CALIBER_TO_PRISMA } from "@ammo-exchange/shared";
import type { Caliber } from "@ammo-exchange/shared";

const favoritesSchema = z.object({
  favoriteCalibers: z.array(z.enum(["9MM", "556", "22LR", "308"])),
});

export async function GET() {
  try {
    const session = await requireSession();

    const user = await prisma.user.findUnique({
      where: { walletAddress: session.address.toLowerCase() },
      select: { id: true },
    });

    if (!user) {
      return Response.json({ favoriteCalibers: [] });
    }

    const prefs = await prisma.userPreference.findUnique({
      where: { userId: user.id },
    });

    if (!prefs) {
      return Response.json({ favoriteCalibers: [] });
    }

    const favoriteCalibers = prefs.favoriteCalibers.map(
      (c) => PRISMA_TO_CALIBER[c] as Caliber,
    );

    return Response.json({ favoriteCalibers });
  } catch (error) {
    if (error instanceof Response) return error;
    throw error;
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await requireSession();

    const body = await request.json().catch(() => null);

    if (!body) {
      return Response.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const parsed = favoritesSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { walletAddress: session.address.toLowerCase() },
      select: { id: true },
    });

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    const prismaCalibers = parsed.data.favoriteCalibers.map(
      (c) => CALIBER_TO_PRISMA[c],
    );

    const prefs = await prisma.userPreference.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        favoriteCalibers: prismaCalibers,
      },
      update: {
        favoriteCalibers: prismaCalibers,
      },
    });

    const favoriteCalibers = prefs.favoriteCalibers.map(
      (c) => PRISMA_TO_CALIBER[c] as Caliber,
    );

    return Response.json({ favoriteCalibers });
  } catch (error) {
    if (error instanceof Response) return error;
    throw error;
  }
}
