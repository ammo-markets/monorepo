import { publicClient } from "@/lib/viem";
import { CaliberMarketAbi, AmmoTokenAbi } from "@ammo-exchange/contracts/abis";
import { CONTRACT_ADDRESSES, CALIBER_SPECS } from "@ammo-exchange/shared";
import type { Caliber } from "@ammo-exchange/shared";

const CALIBERS = Object.keys(CONTRACT_ADDRESSES.fuji.calibers) as Caliber[];
const fuji = CONTRACT_ADDRESSES.fuji;

const priceOracleAbi = [
  {
    type: "function",
    name: "getPrice",
    inputs: [],
    outputs: [{ name: "priceX18", type: "uint256" }],
    stateMutability: "view",
  },
] as const;

const CACHE_HEADERS = {
  "Cache-Control": "s-maxage=60, stale-while-revalidate=300",
};

export async function GET() {
  try {
    // Phase 1: Read oracle addresses + totalSupply in a single multicall (8 calls, 1 RPC round trip)
    const phase1 = await publicClient.multicall({
      contracts: [
        ...CALIBERS.map((caliber) => ({
          address: fuji.calibers[caliber].market,
          abi: CaliberMarketAbi,
          functionName: "oracle" as const,
        })),
        ...CALIBERS.map((caliber) => ({
          address: fuji.calibers[caliber].token,
          abi: AmmoTokenAbi,
          functionName: "totalSupply" as const,
        })),
      ],
    });

    const oracleResults = phase1.slice(0, CALIBERS.length);
    const supplyResults = phase1.slice(CALIBERS.length);

    // Phase 2: Read prices from resolved oracle addresses (4 calls, 1 RPC round trip)
    const oracleAddresses = oracleResults.map((r) =>
      r.status === "success" ? (r.result as `0x${string}`) : ("0x0" as const),
    );

    const phase2 = await publicClient.multicall({
      contracts: oracleAddresses.map((addr) => ({
        address: addr,
        abi: priceOracleAbi,
        functionName: "getPrice" as const,
      })),
    });

    const calibers = CALIBERS.map((caliber, i) => {
      const priceX18 =
        phase2[i]!.status === "success"
          ? (phase2[i]!.result as bigint)
          : BigInt(0);
      const supply =
        supplyResults[i]!.status === "success"
          ? (supplyResults[i]!.result as bigint)
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
