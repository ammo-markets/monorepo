"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import type { Caliber } from "@ammo-exchange/shared";
import type { MarketConfigFromAPI } from "@/app/api/market/config/route";

interface MarketConfigResponse {
  configs: MarketConfigFromAPI[];
  defaults?: {
    mintFeeBps: number;
    redeemFeeBps: number;
  };
}

export function useMarketConfig() {
  const query = useQuery<MarketConfigResponse>({
    queryKey: queryKeys.marketConfig.all,
    queryFn: async () => {
      const res = await fetch("/api/market/config");
      if (!res.ok) throw new Error("Failed to fetch market config");
      return res.json() as Promise<MarketConfigResponse>;
    },
    staleTime: 60_000,
    refetchInterval: 60_000,
  });

  /** Build a config map suitable for passing to buildAllCaliberDetails */
  const configMap = query.data?.configs.reduce(
    (acc, c) => {
      acc[c.caliber] = {
        mintFeeBps: c.mintFeeBps,
        redeemFeeBps: c.redeemFeeBps,
      };
      return acc;
    },
    {} as Partial<Record<Caliber, { mintFeeBps: number; redeemFeeBps: number }>>,
  );

  return {
    ...query,
    configMap: configMap ?? undefined,
  };
}
