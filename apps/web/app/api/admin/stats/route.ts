import { publicClient } from "@/lib/viem";
import { AmmoManagerAbi, AmmoTokenAbi } from "@ammo-exchange/contracts/abis";
import { CONTRACT_ADDRESSES, CALIBER_SPECS } from "@ammo-exchange/shared";
import type { Caliber } from "@ammo-exchange/shared";
import { erc20Abi, formatUnits } from "viem";
import { prisma } from "@ammo-exchange/db";
import { requireKeeper } from "@/lib/auth";

const CALIBERS: Caliber[] = ["9MM", "556", "22LR", "308"];
const fuji = CONTRACT_ADDRESSES.fuji;

export async function GET() {
  try {
    await requireKeeper();

    // 1. Read treasury address
    const treasury = await publicClient.readContract({
      address: fuji.manager,
      abi: AmmoManagerAbi,
      functionName: "treasury",
    });

    // 2. Read USDC balance of treasury
    const usdcBalance = await publicClient.readContract({
      address: fuji.usdc,
      abi: erc20Abi,
      functionName: "balanceOf",
      args: [treasury],
    });

    // 3. Read totalSupply for each caliber token
    const supplies = await Promise.all(
      CALIBERS.map((caliber) =>
        publicClient
          .readContract({
            address: fuji.calibers[caliber].token,
            abi: AmmoTokenAbi,
            functionName: "totalSupply",
          })
          .catch(() => BigInt(0)),
      ),
    );

    // 4-7. Query order counts from DB
    const [totalRedeemed, totalMinted, pendingMints, pendingRedeems] =
      await Promise.all([
        prisma.order.count({ where: { type: "REDEEM", status: "COMPLETED" } }),
        prisma.order.count({ where: { type: "MINT", status: "COMPLETED" } }),
        prisma.order.count({ where: { type: "MINT", status: "PENDING" } }),
        prisma.order.count({ where: { type: "REDEEM", status: "PENDING" } }),
      ]);

    return Response.json({
      treasuryUsdc: formatUnits(usdcBalance, 6),
      totalRedeemed,
      totalMinted,
      pendingMints,
      pendingRedeems,
      calibers: CALIBERS.map((caliber, i) => ({
        caliber,
        name: CALIBER_SPECS[caliber].name,
        totalSupply: Math.floor(Number(formatUnits(supplies[i]!, 18))),
      })),
    });
  } catch (error) {
    if (error instanceof Response) return error;
    return Response.json(
      { error: "Failed to read protocol stats" },
      { status: 502 },
    );
  }
}
