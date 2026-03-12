import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";

export interface UnbackedCaliber {
  caliber: string;
  name: string;
  rounds: string;
  orderCount: number;
  usdcTotal: string;
}

interface UnbackedResponse {
  unbacked: UnbackedCaliber[];
  totalUnbackedOrders: number;
}

interface MarkBackedResponse {
  markedCount: number;
  rounds: string;
  backedAt: string;
  backedBy: string;
}

export function useUnbackedTotals() {
  return useQuery<UnbackedResponse>({
    queryKey: queryKeys.admin.inventory.all,
    queryFn: async () => {
      const res = await fetch("/api/admin/inventory");
      if (!res.ok) throw new Error("Failed to fetch unbacked totals");
      return (await res.json()) as UnbackedResponse;
    },
    refetchInterval: 30_000,
  });
}

interface MarkOrderBackedResponse {
  backedAt: string;
  backedBy: string;
}

export function useMarkOrderBacked() {
  const queryClient = useQueryClient();

  return useMutation<MarkOrderBackedResponse, Error, { orderId: string }>({
    mutationFn: async ({ orderId }) => {
      const res = await fetch(`/api/admin/orders/${orderId}/backed`, {
        method: "POST",
      });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? "Failed to mark as backed");
      }
      return (await res.json()) as MarkOrderBackedResponse;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.admin.inventory.all,
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.admin.orders.all("MINT"),
      });
    },
  });
}

export function useMarkBacked() {
  const queryClient = useQueryClient();

  return useMutation<MarkBackedResponse, Error, { caliber: string }>({
    mutationFn: async ({ caliber }) => {
      const res = await fetch("/api/admin/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caliber }),
      });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? "Failed to mark as backed");
      }
      return (await res.json()) as MarkBackedResponse;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.admin.inventory.all,
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.admin.stats.all,
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.admin.orders.all("MINT"),
      });
    },
  });
}
