import { useCallback, useRef, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { OrderFromAPI } from "@/lib/types";
import type { Caliber } from "@ammo-exchange/shared";

interface AddPendingOrderInput {
  type: "MINT" | "REDEEM";
  caliber: Caliber;
  usdcAmount?: string;
  tokenAmount?: string;
  txHash: `0x${string}`;
}

export function usePendingOrders(address: string | undefined) {
  const queryClient = useQueryClient();
  const pollingTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Clean up polling on unmount
  useEffect(() => {
    return () => {
      if (pollingTimeout.current) clearTimeout(pollingTimeout.current);
    };
  }, []);

  const addPendingOrder = useCallback(
    (input: AddPendingOrderInput) => {
      if (!address) return;

      const syntheticOrder: OrderFromAPI = {
        id: `pending-${input.txHash}`,
        type: input.type,
        status: "PENDING",
        caliber: input.caliber,
        usdcAmount: input.usdcAmount ?? null,
        tokenAmount: input.tokenAmount ?? null,
        onChainOrderId: null,
        walletAddress: address,
        txHash: input.txHash,
        chainId: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        shippingAddress: null,
      };

      // Inject at front of orders cache
      queryClient.setQueryData<OrderFromAPI[]>(
        ["orders", address],
        (old = []) => [syntheticOrder, ...old],
      );

      // Enable short polling (5s) for 2 minutes
      const originalInterval =
        queryClient.getQueryDefaults(["orders", address])?.refetchInterval;

      queryClient.setQueryDefaults(["orders", address], {
        refetchInterval: 5_000,
      });

      pollingTimeout.current = setTimeout(() => {
        queryClient.setQueryDefaults(["orders", address], {
          refetchInterval: originalInterval as number | false | undefined,
        });
      }, 120_000);
    },
    [address, queryClient],
  );

  return { addPendingOrder };
}
