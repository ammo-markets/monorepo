import type { NextRequest } from "next/server";
import { erc20Abi } from "viem";
import { publicClient } from "@/lib/viem";
import { AmmoTokenAbi } from "@ammo-exchange/contracts/abis";
import { CONTRACT_ADDRESSES } from "@ammo-exchange/shared";
import type { Caliber } from "@ammo-exchange/shared";

const CALIBERS: Caliber[] = ["9MM", "556", "22LR", "308"];
const fuji = CONTRACT_ADDRESSES.fuji;

const walletRegex = /^0x[a-fA-F0-9]{40}$/;

export async function GET(request: NextRequest) {
  const wallet = request.nextUrl.searchParams.get("wallet");

  if (!wallet || !walletRegex.test(wallet)) {
    return Response.json({ error: "Invalid wallet address" }, { status: 400 });
  }

  const address = wallet as `0x${string}`;

  try {
    // Use separate multicalls to avoid tuple type inference issues with spread
    const usdcResult = await publicClient.readContract({
      address: fuji.usdc,
      abi: erc20Abi,
      functionName: "balanceOf",
      args: [address],
    });

    const tokenResults = await Promise.all(
      CALIBERS.map((caliber) =>
        publicClient
          .readContract({
            address: fuji.calibers[caliber].token,
            abi: AmmoTokenAbi,
            functionName: "balanceOf",
            args: [address],
          })
          .catch(() => BigInt(0)),
      ),
    );

    const usdc = usdcResult.toString();

    const tokens = Object.fromEntries(
      CALIBERS.map((caliber, i) => [caliber, (tokenResults[i]!).toString()]),
    ) as Record<Caliber, string>;

    return Response.json({ usdc, tokens });
  } catch {
    return Response.json(
      { error: "Failed to read on-chain balances" },
      { status: 502 },
    );
  }
}
