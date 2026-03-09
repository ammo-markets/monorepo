import { CALIBER_SPECS, FEES } from "@ammo-exchange/shared";
import type { Caliber } from "@ammo-exchange/shared";
import type { CaliberDetailData, MarketCaliberFromAPI } from "@/lib/types";

interface MarketConfigOverride {
  mintFeeBps?: number;
  redeemFeeBps?: number;
}

export function buildCaliberDetail(
  caliber: Caliber,
  market: MarketCaliberFromAPI,
  configOverride?: MarketConfigOverride,
): CaliberDetailData {
  const spec = CALIBER_SPECS[caliber];
  return {
    id: caliber,
    symbol: caliber,
    name: spec.name,
    specLine: spec.description,
    price: market.pricePerRound,
    totalSupply: market.totalSupply,
    mintFee: (configOverride?.mintFeeBps ?? FEES.MINT_FEE_BPS) / 100,
    redeemFee: (configOverride?.redeemFeeBps ?? FEES.REDEEM_FEE_BPS) / 100,
    minRedeem: spec.minRedeemRounds,
  };
}

export function buildAllCaliberDetails(
  marketData: MarketCaliberFromAPI[],
  configMap?: Partial<Record<Caliber, MarketConfigOverride>>,
): Record<Caliber, CaliberDetailData> {
  const result = {} as Record<Caliber, CaliberDetailData>;
  for (const m of marketData) {
    result[m.caliber] = buildCaliberDetail(
      m.caliber,
      m,
      configMap?.[m.caliber],
    );
  }
  return result;
}
