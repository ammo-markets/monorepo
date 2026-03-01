import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";

interface CaliberSupply {
  caliber: string;
  name: string;
  totalSupply: number;
}

export interface StatsData {
  treasuryUsdc: string;
  totalRedeemed: number;
  totalMinted: number;
  pendingMints: number;
  pendingRedeems: number;
  calibers: CaliberSupply[];
}

export function useAdminStats() {
  return useQuery<StatsData>({
    queryKey: queryKeys.admin.stats.all,
    queryFn: async () => {
      const res = await fetch("/api/admin/stats");
      if (!res.ok) throw new Error("Failed to fetch stats");
      return (await res.json()) as StatsData;
    },
  });
}
