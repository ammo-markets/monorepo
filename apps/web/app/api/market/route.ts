import { publicClient } from "@/lib/viem";
import { PriceOracleAbi, AmmoTokenAbi } from "@ammo-exchange/contracts/abis";
import { CALIBER_SPECS } from "@ammo-exchange/shared";
import type { Caliber } from "@ammo-exchange/shared";
import { contracts } from "@/lib/chain";

const CALIBERS = Object.keys(contracts.calibers) as Caliber[];

const CACHE_HEADERS = {
  "Cache-Control": "s-maxage=60, stale-while-revalidate=300",
};

export async function GET() {
  try {
    // Single multicall: 4 oracle.markets() + 4 token.totalSupply() = 8 calls, 1 RPC round trip
    const results = await publicClient.multicall({
      contracts: [
        ...CALIBERS.map((caliber) => ({
          address: contracts.oracle,
          abi: PriceOracleAbi,
          functionName: "markets" as const,
          args: [contracts.calibers[caliber].market] as const,
        })),
        ...CALIBERS.map((caliber) => ({
          address: contracts.calibers[caliber].token,
          abi: AmmoTokenAbi,
          functionName: "totalSupply" as const,
        })),
      ],
    });

    const oracleResults = results.slice(0, CALIBERS.length);
    const supplyResults = results.slice(CALIBERS.length);

    const calibers = CALIBERS.map((caliber, i) => {
      const oracleData = oracleResults[i]!;
      const supplyData = supplyResults[i]!;

      // oracle.markets() returns [price, updatedAt, registered]
      const priceX18 =
        oracleData.status === "success"
          ? (oracleData.result as [bigint, bigint, boolean])[0]
          : BigInt(0);
      const supply =
        supplyData.status === "success"
          ? (supplyData.result as bigint)
          : BigInt(0);

      return {
        caliber,
        name: CALIBER_SPECS[caliber].name,
        pricePerRound: Number(priceX18) / 1e18,
        priceX18: priceX18.toString(),
        totalSupply: (supply / BigInt(10) ** BigInt(18)).toString(),
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
