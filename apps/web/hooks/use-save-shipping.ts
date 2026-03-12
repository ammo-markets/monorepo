import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";

interface SaveShippingInput {
  orderId: string;
  name: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  zip: string;
}

export function useSaveShipping(address: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: SaveShippingInput) => {
      const res = await fetch("/api/redeem/shipping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(data?.error ?? "Failed to save shipping address");
      }

      return res.json();
    },
    onSuccess: () => {
      if (address) {
        void queryClient.invalidateQueries({
          queryKey: queryKeys.orders.list(address),
        });
      }
    },
  });
}
