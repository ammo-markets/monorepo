import type { QueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import type { AdminRedeemOrder } from "@/features/admin/finalize-redeem-dialog";
import type { StatsData } from "@/hooks/use-admin-stats";

interface PaginatedRedeemResponse {
  orders: AdminRedeemOrder[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Optimistically update a redeem order's fields across all cached pages/filters.
 *
 * Uses `setQueriesData` with a fuzzy key match so the update appears regardless
 * of which page or filter the admin is currently viewing.
 */
export function updateRedeemOrderInCache(
  queryClient: QueryClient,
  orderId: string,
  updates: Partial<AdminRedeemOrder>,
) {
  queryClient.setQueriesData<PaginatedRedeemResponse>(
    { queryKey: queryKeys.admin.orders.all("REDEEM") },
    (old) => {
      if (!old) return old;
      return {
        ...old,
        orders: old.orders.map((o) =>
          o.id === orderId ? { ...o, ...updates } : o,
        ),
      };
    },
  );
}

/**
 * Decrement the pending redeems count in the admin stats cache.
 */
export function decrementPendingRedeems(queryClient: QueryClient) {
  queryClient.setQueryData<StatsData>(queryKeys.admin.stats.all, (old) => {
    if (!old) return old;
    return {
      ...old,
      pendingRedeems: Math.max(0, old.pendingRedeems - 1),
    };
  });
}
