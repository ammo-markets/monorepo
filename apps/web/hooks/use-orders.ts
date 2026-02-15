import { useQuery } from "@tanstack/react-query";
import type { OrderFromAPI } from "@/lib/types";

interface OrdersResponse {
  orders: OrderFromAPI[];
}

interface OrderDetailResponse {
  order: OrderFromAPI;
}

export function useOrders(address: string | undefined) {
  return useQuery<OrderFromAPI[]>({
    queryKey: ["orders", address],
    queryFn: async () => {
      const res = await fetch("/api/orders");
      if (!res.ok) return [];
      const data = (await res.json()) as OrdersResponse;
      return data.orders ?? [];
    },
    enabled: !!address,
  });
}

export function useOrderDetail(orderId: string) {
  return useQuery<OrderFromAPI | null>({
    queryKey: ["orders", orderId],
    queryFn: async () => {
      const res = await fetch(`/api/orders/${orderId}`);
      if (!res.ok) throw new Error("Order not found");
      const data = (await res.json()) as OrderDetailResponse;
      return data.order;
    },
  });
}
