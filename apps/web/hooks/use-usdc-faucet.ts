"use client";

import { useEffect } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { MockUSDCAbi } from "@ammo-exchange/contracts/abis";
import { CONTRACT_ADDRESSES } from "@ammo-exchange/shared";

const FAUCET_AMOUNT = BigInt(10_000e6); // 10,000 USDC (6 decimals)

export function useUsdcFaucet(onSuccess?: () => void): {
  faucet: () => void;
  hash: `0x${string}` | undefined;
  error: Error | null;
  isPending: boolean;
  isConfirming: boolean;
  isConfirmed: boolean;
} {
  const { data: hash, error, isPending, writeContract } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (isConfirmed && onSuccess) {
      onSuccess();
    }
  }, [isConfirmed, onSuccess]);

  function faucet() {
    writeContract({
      address: CONTRACT_ADDRESSES.fuji.usdc,
      abi: MockUSDCAbi,
      functionName: "faucet",
      args: [FAUCET_AMOUNT],
    });
  }

  return {
    faucet,
    hash,
    error,
    isPending,
    isConfirming,
    isConfirmed,
  };
}
