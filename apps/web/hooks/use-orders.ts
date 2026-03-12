import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import type { OrderFromAPI } from "@/lib/types";

interface OrdersResponse {
  orders: OrderFromAPI[];
}

interface OrderDetailResponse {
  order: OrderFromAPI;
}

export function useOrders(address: string | undefined) {
  return useQuery<OrderFromAPI[]>({
    queryKey: queryKeys.orders.list(address!),
    queryFn: async () => {
      const res = await fetch(`/api/orders?address=${address}`);
      if (!res.ok) return [];
      const data = (await res.json()) as OrdersResponse;
      return data.orders ?? [];
    },
    enabled: !!address,
    select: (orders) => {
      // Deduplicate: remove synthetic pending orders when a real order with matching txHash exists
      const realTxHashes = new Set(
        orders
          .filter((o) => !o.id.startsWith("pending-") && o.txHash)
          .map((o) => o.txHash),
      );
      return orders.filter(
        (o) => !o.id.startsWith("pending-") || !realTxHashes.has(o.txHash),
      );
    },
  });
}

export function useOrderDetail(orderId: string, address?: string) {
  return useQuery<OrderFromAPI | null>({
    queryKey: queryKeys.orders.detail(orderId),
    queryFn: async () => {
      const params = address ? `?address=${address}` : "";
      const res = await fetch(`/api/orders/${orderId}${params}`);
      if (!res.ok) throw new Error("Order not found");
      const data = (await res.json()) as OrderDetailResponse;
      return data.order;
    },
  });
}
