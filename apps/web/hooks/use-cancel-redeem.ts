"use client";

import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { CaliberMarketAbi } from "@ammo-exchange/contracts/abis";
import { CONTRACT_ADDRESSES } from "@ammo-exchange/shared";
import type { Caliber } from "@ammo-exchange/shared";

/**
 * Hook for keeper cancelRedeem call.
 * Single useWriteContract instance (no approve step needed for keeper calls).
 */
export function useCancelRedeem(caliber: Caliber): {
  cancelRedeem: (orderId: bigint, reasonCode?: number) => void;
  hash: `0x${string}` | undefined;
  error: Error | null;
  isPending: boolean;
  isConfirming: boolean;
  isConfirmed: boolean;
  reset: () => void;
} {
  const marketAddress = CONTRACT_ADDRESSES.fuji.calibers[caliber].market;

  const {
    data: hash,
    error,
    isPending,
    writeContract,
    reset,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash });

  function cancelRedeem(orderId: bigint, reasonCode = 1) {
    writeContract({
      address: marketAddress,
      abi: CaliberMarketAbi,
      functionName: "cancelRedeem",
      args: [orderId, reasonCode],
    });
  }

  return {
    cancelRedeem,
    hash,
    error,
    isPending,
    isConfirming,
    isConfirmed,
    reset,
  };
}
