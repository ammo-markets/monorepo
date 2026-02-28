import { erc20Abi } from "viem";
import { publicClient } from "@/lib/viem";
import { AmmoTokenAbi } from "@ammo-exchange/contracts/abis";
import type { Caliber } from "@ammo-exchange/shared";
import { requireSession } from "@/lib/auth";
import { contracts } from "@/lib/chain";

const CALIBERS = Object.keys(contracts.calibers) as Caliber[];

export async function GET() {
  try {
    const session = await requireSession();
    const address = session.address as `0x${string}`;

    // Use separate multicalls to avoid tuple type inference issues with spread
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
