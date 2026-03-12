import { NextResponse } from "next/server";
import { prisma } from "@ammo-exchange/db";
import { CALIBER_TO_PRISMA } from "@ammo-exchange/shared";
import type { Caliber } from "@ammo-exchange/shared";

const VALID_CALIBERS = Object.keys(CALIBER_TO_PRISMA) as Caliber[];

type TimeRange = "24H" | "7D" | "30D" | "90D" | "1Y" | "ALL";
const VALID_RANGES: TimeRange[] = ["24H", "7D", "30D", "90D", "1Y", "ALL"];

function getCutoff(range: TimeRange): Date | null {
  const now = new Date();
  switch (range) {
    case "24H":
      return new Date(now.getTime() - 24 * 60 * 60 * 1000);
    case "7D":
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case "30D":
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    case "90D":
      return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    case "1Y":
      return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
    case "ALL":
      return null;
  }
}

const MAX_POINTS = 300;

function downsample<T>(data: T[], maxPoints: number): T[] {
  if (data.length <= maxPoints) return data;
  const step = data.length / maxPoints;
  const result: T[] = [];
  for (let i = 0; i < maxPoints; i++) {
    result.push(data[Math.floor(i * step)]!);
  }
  // Always include the last point
  if (result[result.length - 1] !== data[data.length - 1]) {
    result.push(data[data.length - 1]!);
  }
  return result;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const caliber = searchParams.get("caliber")?.toUpperCase() as Caliber | null;
  const range = (searchParams.get("range")?.toUpperCase() || "7D") as TimeRange;

  if (!caliber || !VALID_CALIBERS.includes(caliber)) {
    return NextResponse.json({ error: "Invalid caliber" }, { status: 400 });
  }

  if (!VALID_RANGES.includes(range)) {
    return NextResponse.json({ error: "Invalid range" }, { status: 400 });
  }

  const prismaCaliber = CALIBER_TO_PRISMA[caliber];
  const cutoff = getCutoff(range);

  const snapshots = await prisma.priceSnapshot.findMany({
    where: {
      caliber: prismaCaliber as never,
      ...(cutoff ? { createdAt: { gte: cutoff } } : {}),
    },
    orderBy: { createdAt: "asc" },
    select: {
      price: true,
      createdAt: true,
    },
  });

  const points = downsample(
    snapshots.map((s) => ({
      price: Number(s.price) / 100, // cents to dollars
      timestamp: s.createdAt.toISOString(),
    })),
    MAX_POINTS,
  );

  return NextResponse.json(
    { points },
    {
      headers: {
        "Cache-Control": "s-maxage=300, stale-while-revalidate=600",
      },
    },
  );
}
