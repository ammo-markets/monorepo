import { useQuery } from "@tanstack/react-query";

interface CaliberSupply {
  caliber: string;
  name: string;
  totalSupply: number;
}

export interface StatsData {
  treasuryUsdc: string;
  totalRedeemed: number;
  totalMinted: number;
  pendingOrders: number;
  calibers: CaliberSupply[];
}

export function useAdminStats() {
  return useQuery<StatsData>({
    queryKey: ["admin", "stats"],
    queryFn: async () => {
      const res = await fetch("/api/admin/stats");
      if (!res.ok) throw new Error("Failed to fetch stats");
      return (await res.json()) as StatsData;
    },
  });
}
