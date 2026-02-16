"use client";

import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { CaliberMarketAbi } from "@ammo-exchange/contracts/abis";
import { CONTRACT_ADDRESSES } from "@ammo-exchange/shared";
import type { Caliber } from "@ammo-exchange/shared";

/**
 * Hook for keeper refundMint call.
 * Single useWriteContract instance (no approve step needed for keeper calls).
 */
export function useRefundMint(caliber: Caliber): {
  refundMint: (orderId: bigint, reasonCode?: number) => void;
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

  function refundMint(orderId: bigint, reasonCode = 1) {
    writeContract({
      address: marketAddress,
      abi: CaliberMarketAbi,
      functionName: "refundMint",
      args: [orderId, reasonCode],
    });
  }

  return {
    refundMint,
    hash,
    error,
    isPending,
    isConfirming,
    isConfirmed,
    reset,
  };
}
