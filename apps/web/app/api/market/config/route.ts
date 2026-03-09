import { prisma } from "@ammo-exchange/db";
import { PRISMA_TO_CALIBER, FEES } from "@ammo-exchange/shared";
import type { Caliber } from "@ammo-exchange/shared";

const CACHE_HEADERS = {
  "Cache-Control": "s-maxage=60, stale-while-revalidate=300",
};

export interface MarketConfigFromAPI {
  caliber: Caliber;
  mintFeeBps: number;
  redeemFeeBps: number;
  minMintRounds: number;
  paused: boolean;
}

export async function GET() {
  try {
    const configs = await prisma.marketConfig.findMany();

    const mapped: MarketConfigFromAPI[] = configs.map((c) => ({
      caliber: PRISMA_TO_CALIBER[c.caliber] as Caliber,
      mintFeeBps: c.mintFeeBps,
      redeemFeeBps: c.redeemFeeBps,
      minMintRounds: c.minMintRounds,
      paused: c.paused,
    }));

    return Response.json({ configs: mapped }, { headers: CACHE_HEADERS });
  } catch {
    // If MarketConfig table is empty (not yet seeded), return defaults
    return Response.json(
      {
        configs: [],
        defaults: {
          mintFeeBps: FEES.MINT_FEE_BPS,
          redeemFeeBps: FEES.REDEEM_FEE_BPS,
        },
      },
      { headers: CACHE_HEADERS },
    );
  }
}
