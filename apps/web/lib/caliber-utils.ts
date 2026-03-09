import { CALIBER_SPECS, FEES } from "@ammo-exchange/shared";
import type { Caliber } from "@ammo-exchange/shared";
import type { CaliberDetailData, MarketCaliberFromAPI } from "@/lib/types";

export function buildCaliberDetail(
  caliber: Caliber,
  market: MarketCaliberFromAPI,
): CaliberDetailData {
  const spec = CALIBER_SPECS[caliber];
  return {
    id: caliber,
    symbol: caliber,
    name: spec.name,
    specLine: spec.description,
    price: market.pricePerRound,
    totalSupply: market.totalSupply,
    mintFee: FEES.MINT_FEE_BPS / 100,
    redeemFee: FEES.REDEEM_FEE_BPS / 100,
    minMint: spec.minMintRounds,
    minRedeem: spec.minRedeemRounds,
  };
}

export function buildAllCaliberDetails(
  marketData: MarketCaliberFromAPI[],
): Record<Caliber, CaliberDetailData> {
  const result = {} as Record<Caliber, CaliberDetailData>;
  for (const m of marketData) {
    result[m.caliber] = buildCaliberDetail(m.caliber, m);
  }
  return result;
}
