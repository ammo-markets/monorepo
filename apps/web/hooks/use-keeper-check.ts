"use client";

import { useAccount, useReadContract } from "wagmi";
import { AmmoManagerAbi } from "@ammo-exchange/contracts/abis";
import { contracts } from "@/lib/chain";

export function useKeeperCheck(): {
  isKeeper: boolean;
  isLoading: boolean;
  isConnected: boolean;
  isReconnecting: boolean;
  address: `0x${string}` | undefined;
} {
  const { address, isConnected, isReconnecting } = useAccount();

  const { data, isLoading } = useReadContract({
    address: contracts.manager,
    abi: AmmoManagerAbi,
    functionName: "isKeeper",
    args: [address!],
    query: {
      enabled: isConnected && !!address,
    },
  });

  return {
    isKeeper: !!data,
    isLoading,
    isConnected,
    isReconnecting,
    address,
  };
}
