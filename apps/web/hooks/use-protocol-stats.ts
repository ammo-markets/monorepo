import { useQuery } from "@tanstack/react-query";
import type { Caliber } from "@ammo-exchange/shared";

interface ProtocolStatRow {
  caliber: Caliber;
  totalMinted: string;
  totalRedeemed: string;
  netSupply: string;
  userCount: number;
  computedAt: string;
}

interface ProtocolStatsResponse {
  stats: ProtocolStatRow[];
  totalVolumeUsd: number;
  registeredUsers: number;
  roundsTokenized: number;
}

export function useProtocolStats() {
  return useQuery<ProtocolStatsResponse>({
    queryKey: ["protocol-stats"],
    queryFn: async () => {
      const res = await fetch("/api/stats");
      if (!res.ok) throw new Error("Failed to fetch protocol stats");
      return (await res.json()) as ProtocolStatsResponse;
    },
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
}
