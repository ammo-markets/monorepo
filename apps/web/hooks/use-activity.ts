import { useQuery } from "@tanstack/react-query";

export interface ActivityItem {
  id: string;
  type: "MINT" | "REDEEM";
  amount: string;
  walletAddress: string;
  caliber: string;
  updatedAt: string;
}

interface ActivityResponse {
  activity: ActivityItem[];
}

export function useActivity() {
  return useQuery<ActivityItem[]>({
    queryKey: ["activity"],
    queryFn: async () => {
      const res = await fetch("/api/activity");
      if (!res.ok) throw new Error("Failed to fetch activity");
      const data = (await res.json()) as ActivityResponse;
      return data.activity ?? [];
    },
  });
}
