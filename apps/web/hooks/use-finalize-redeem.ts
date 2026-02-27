"use client";

import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useSimulateContract,
} from "wagmi";
import { CaliberMarketAbi } from "@ammo-exchange/contracts/abis";
import { CONTRACT_ADDRESSES } from "@ammo-exchange/shared";
import type { Caliber } from "@ammo-exchange/shared";

export function useFinalizeRedeem(
  caliber: Caliber,
  args: { orderId: bigint | undefined },
): {
  write: () => void;
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
  reset: () => void;
} {
  const marketAddress = CONTRACT_ADDRESSES.fuji.calibers[caliber].market;

  const {
    data: simData,
    error: simulationError,
    isLoading: isSimulating,
  } = useSimulateContract({
    address: marketAddress,
    abi: CaliberMarketAbi,
    functionName: "finalizeRedeem",
    args: args.orderId !== undefined ? [args.orderId] : undefined,
    query: { enabled: args.orderId !== undefined },
  });

  const {
    data: hash,
    error: writeError,
    isPending,
    writeContract,
    reset,
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    error: receiptError,
  } = useWaitForTransactionReceipt({ hash });

  function write() {
    if (simData?.request) writeContract(simData.request);
  }

  return {
    write,
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
    reset,
  };
}
