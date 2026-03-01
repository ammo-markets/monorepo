import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import type { AdminMintOrder } from "@/features/admin/finalize-mint-dialog";
import type { AdminRedeemOrder } from "@/features/admin/finalize-redeem-dialog";

interface PaginatedMintResponse {
  orders: AdminMintOrder[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface PaginatedRedeemResponse {
  orders: AdminRedeemOrder[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface AdminOrderParams {
  search: string;
  caliber: string;
  page: number;
}

export function useAdminMintOrders(params: AdminOrderParams) {
  const { search, caliber, page } = params;

  return useQuery<PaginatedMintResponse>({
    queryKey: queryKeys.admin.orders.list("MINT", { search, caliber, page }),
    queryFn: async () => {
      const searchParams = new URLSearchParams({
        type: "MINT",
        page: String(page),
        limit: "20",
      });
      if (search) searchParams.set("search", search);
      if (caliber) searchParams.set("caliber", caliber);
      const res = await fetch(`/api/admin/orders?${searchParams}`);
      if (!res.ok) throw new Error("Failed to fetch mint orders");
      return (await res.json()) as PaginatedMintResponse;
    },
    refetchInterval: 30_000,
  });
}

export function useAdminRedeemOrders(params: AdminOrderParams) {
  const { search, caliber, page } = params;

  return useQuery<PaginatedRedeemResponse>({
    queryKey: queryKeys.admin.orders.list("REDEEM", { search, caliber, page }),
    queryFn: async () => {
      const searchParams = new URLSearchParams({
        type: "REDEEM",
        page: String(page),
        limit: "20",
      });
      if (search) searchParams.set("search", search);
      if (caliber) searchParams.set("caliber", caliber);
      const res = await fetch(`/api/admin/orders?${searchParams}`);
      if (!res.ok) throw new Error("Failed to fetch redeem orders");
      return (await res.json()) as PaginatedRedeemResponse;
    },
    refetchInterval: 30_000,
  });
}
