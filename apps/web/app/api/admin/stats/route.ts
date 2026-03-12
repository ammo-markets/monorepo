import { publicClient } from "@/lib/viem";
import { AmmoTokenAbi } from "@ammo-exchange/contracts/abis";
import { CALIBER_SPECS, CALIBERS } from "@ammo-exchange/shared";
import { prisma } from "@ammo-exchange/db";
import { requireKeeper } from "@/lib/auth";
import { contracts } from "@/lib/chain";

export async function GET() {
  try {
    await requireKeeper();

    // Read totalSupply for each caliber token
    const supplies = await Promise.all(
      CALIBERS.map((caliber) =>
        publicClient
          .readContract({
            address: contracts.calibers[caliber].token,
            abi: AmmoTokenAbi,
            functionName: "totalSupply",
          })
          .catch(() => BigInt(0)),
      ),
    );

    // Query actionable order counts from DB
    const [pendingRedeems, unbackedMints] = await Promise.all([
      prisma.order.count({ where: { type: "REDEEM", status: "PENDING" } }),
      prisma.order.count({
        where: { type: "MINT", status: "COMPLETED", backedAt: null },
      }),
    ]);

    return Response.json({
      pendingRedeems,
      unbackedMints,
      calibers: CALIBERS.map((caliber, i) => ({
        caliber,
        name: CALIBER_SPECS[caliber].name,
        totalSupply: (supplies[i]! / BigInt(10) ** BigInt(18)).toString(),
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
