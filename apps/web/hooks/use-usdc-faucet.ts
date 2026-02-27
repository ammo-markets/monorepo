"use client";

import { useEffect } from "react";
import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useSimulateContract,
} from "wagmi";
import { MockUSDCAbi } from "@ammo-exchange/contracts/abis";
import { CONTRACT_ADDRESSES } from "@ammo-exchange/shared";

const FAUCET_AMOUNT = BigInt(10_000e6); // 10,000 USDC (6 decimals)

export function useUsdcFaucet(onSuccess?: () => void): {
  faucet: () => void;
  hash: `0x${string}` | undefined;
  writeError: Error | null;
  simulationError: Error | null;
  receiptError: Error | null;
  error: Error | null;
  isPending: boolean;
  isConfirming: boolean;
  isConfirmed: boolean;
  isSimulating: boolean;
  isReady: boolean;
} {
  const {
    data: simData,
    error: simulationError,
    isLoading: isSimulating,
  } = useSimulateContract({
    address: CONTRACT_ADDRESSES.fuji.usdc,
    abi: MockUSDCAbi,
    functionName: "faucet",
    args: [FAUCET_AMOUNT],
  });

  const {
    data: hash,
    error: writeError,
    isPending,
    writeContract,
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    error: receiptError,
  } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (isConfirmed && onSuccess) {
      onSuccess();
    }
  }, [isConfirmed, onSuccess]);

  function faucet() {
    if (simData?.request) writeContract(simData.request);
  }

  return {
    faucet,
    hash,
    writeError,
    simulationError,
    receiptError,
    error: receiptError ?? writeError ?? simulationError ?? null,
    isPending,
    isConfirming,
    isConfirmed,
    isSimulating,
    isReady: !!simData?.request,
  };
}
