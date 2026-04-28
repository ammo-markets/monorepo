import { publicClient } from "@/lib/viem";
import { prisma } from "@ammo-exchange/db";
import { PriceOracleAbi, AmmoTokenAbi } from "@ammo-exchange/contracts/abis";
import {
  LAUNCH_CALIBERS,
  CALIBER_SPECS,
  CALIBER_TO_PRISMA,
} from "@ammo-exchange/shared";
import type { Caliber } from "@ammo-exchange/shared";
import { contracts } from "@/lib/chain";

const CACHE_HEADERS = {
  "Cache-Control": "s-maxage=60, stale-while-revalidate=300",
};

function getMonthlyChangePercent(currentPrice: number, previousPrice: number) {
  if (previousPrice <= 0) return null;
  return ((currentPrice - previousPrice) / previousPrice) * 100;
}

export async function GET() {
  try {
    const monthlyCutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // Single multicall: oracle.markets() + token.totalSupply() per launch caliber, 1 RPC round trip
    const [results, monthlySnapshots] = await Promise.all([
      publicClient.multicall({
        contracts: [
          ...LAUNCH_CALIBERS.map((caliber) => ({
            address: contracts.oracle,
            abi: PriceOracleAbi,
            functionName: "markets" as const,
            args: [contracts.calibers[caliber].market] as const,
          })),
          ...LAUNCH_CALIBERS.map((caliber) => ({
            address: contracts.calibers[caliber].token,
            abi: AmmoTokenAbi,
            functionName: "totalSupply" as const,
          })),
        ],
      }),
      Promise.all(
        LAUNCH_CALIBERS.map(async (caliber) =>
          prisma.priceSnapshot
            .findFirst({
              where: {
                caliber: CALIBER_TO_PRISMA[caliber] as never,
                createdAt: { gte: monthlyCutoff },
              },
              orderBy: { createdAt: "asc" },
              select: { price: true },
            })
            .catch(() => null),
        ),
      ),
    ]);

    const oracleResults = results.slice(0, LAUNCH_CALIBERS.length);
    const supplyResults = results.slice(LAUNCH_CALIBERS.length);

    const calibers = LAUNCH_CALIBERS.map((caliber, i) => {
      const oracleData = oracleResults[i]!;
      const supplyData = supplyResults[i]!;
      const monthlySnapshot = monthlySnapshots[i];

      // oracle.markets() returns [price, updatedAt, registered]
      const priceX18 =
        oracleData.status === "success"
          ? (oracleData.result as [bigint, bigint, boolean])[0]
          : BigInt(0);
      const supply =
        supplyData.status === "success"
          ? (supplyData.result as bigint)
          : BigInt(0);
      const pricePerRound = Number(priceX18) / 1e18;

      return {
        caliber,
        name: CALIBER_SPECS[caliber].name,
        tokenSymbol: CALIBER_SPECS[caliber].tokenSymbol,
        pricePerRound,
        priceX18: priceX18.toString(),
        totalSupply: (supply / BigInt(10) ** BigInt(18)).toString(),
        monthlyChangePercent: monthlySnapshot
          ? getMonthlyChangePercent(
              pricePerRound,
              Number(monthlySnapshot.price) / 100,
            )
          : null,
      };
    });

    return Response.json({ calibers }, { headers: CACHE_HEADERS });
  } catch {
    return Response.json(
      { error: "Failed to read market prices" },
      { status: 502 },
    );
  }
}
