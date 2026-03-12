import type { NextRequest } from "next/server";
import { erc20Abi, isAddress } from "viem";
import { publicClient } from "@/lib/viem";
import { AmmoTokenAbi } from "@ammo-exchange/contracts/abis";
import type { Caliber } from "@ammo-exchange/shared";
import { contracts } from "@/lib/chain";

const CALIBERS = Object.keys(contracts.calibers) as Caliber[];

export async function GET(request: NextRequest) {
  try {
    const addressParam = request.nextUrl.searchParams.get("address");

    if (!addressParam || !isAddress(addressParam)) {
      return Response.json(
        { error: "Valid address query parameter required" },
        { status: 400 },
      );
    }

    const address = addressParam as `0x${string}`;

    const usdcResult = await publicClient.readContract({
      address: contracts.usdc,
      abi: erc20Abi,
      functionName: "balanceOf",
      args: [address],
    });

    const tokenResults = await Promise.all(
      CALIBERS.map((caliber) =>
        publicClient
          .readContract({
            address: contracts.calibers[caliber].token,
            abi: AmmoTokenAbi,
            functionName: "balanceOf",
            args: [address],
          })
          .catch(() => BigInt(0)),
      ),
    );

    const usdc = usdcResult.toString();

    const tokens = Object.fromEntries(
      CALIBERS.map((caliber, i) => [caliber, tokenResults[i]!.toString()]),
    ) as Record<Caliber, string>;

    return Response.json({ usdc, tokens });
  } catch (error) {
    if (error instanceof Response) return error;
    return Response.json(
      { error: "Failed to read on-chain balances" },
      { status: 502 },
    );
  }
}
