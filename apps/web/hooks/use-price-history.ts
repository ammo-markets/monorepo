import { useQuery } from "@tanstack/react-query";
import type { Caliber } from "@ammo-exchange/shared";
import type { TimeRange } from "@/features/market/time-range-selector";
import { queryKeys } from "@/lib/query-keys";

export interface PricePoint {
  price: number;
  timestamp: string;
}

interface PriceHistoryResponse {
  points: PricePoint[];
}

export function usePriceHistory(caliber: Caliber | null, range: TimeRange) {
  return useQuery<PricePoint[]>({
    queryKey: queryKeys.market.history(caliber!, range),
    queryFn: async () => {
      const res = await fetch(
        `/api/market/history?caliber=${caliber}&range=${range}`,
      );
      if (!res.ok) throw new Error("Failed to fetch price history");
      const data: PriceHistoryResponse = await res.json();
      return data.points;
    },
    enabled: !!caliber,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
