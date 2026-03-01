import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import type { MarketCaliberFromAPI } from "@/lib/types";

interface MarketResponse {
  calibers: MarketCaliberFromAPI[];
}

export function useMarketData() {
  return useQuery<MarketCaliberFromAPI[]>({
    queryKey: queryKeys.market.all,
    queryFn: async () => {
      const res = await fetch("/api/market");
      if (!res.ok) throw new Error("Failed to fetch market data");
      const data = (await res.json()) as MarketResponse;
      return data.calibers ?? [];
    },
    staleTime: 60_000,
    refetchInterval: 60_000,
  });
}
