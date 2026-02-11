import { publicClient } from "@/lib/viem";
import { CaliberMarketAbi } from "@ammo-exchange/contracts/abis";
import { CONTRACT_ADDRESSES, CALIBER_SPECS } from "@ammo-exchange/shared";
import type { Caliber } from "@ammo-exchange/shared";

const CALIBERS: Caliber[] = ["9MM", "556", "22LR", "308"];
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

export async function GET() {
  try {
    // Step 1: Read oracle addresses from each CaliberMarket using individual reads
    // (avoids multicall tuple type inference issues with mapped arrays)
    const oracleAddresses = await Promise.all(
      CALIBERS.map((caliber) =>
        publicClient.readContract({
          address: fuji.calibers[caliber].market,
          abi: CaliberMarketAbi,
          functionName: "oracle",
        }),
      ),
    );

    // Step 2: Read prices from each oracle
    const prices = await Promise.all(
      oracleAddresses.map((oracleAddress) =>
        publicClient
          .readContract({
            address: oracleAddress,
            abi: priceOracleAbi,
            functionName: "getPrice",
          })
          .catch(() => BigInt(0)),
      ),
    );

    const calibers = CALIBERS.map((caliber, i) => {
      const priceX18 = prices[i]!;

      return {
        caliber,
        name: CALIBER_SPECS[caliber].name,
        pricePerRound: Number(priceX18) / 1e18,
        priceX18: priceX18.toString(),
      };
    });

    return Response.json({ calibers });
  } catch {
    return Response.json(
      { error: "Failed to read market prices" },
      { status: 502 },
    );
  }
}
