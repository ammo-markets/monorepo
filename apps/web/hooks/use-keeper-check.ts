"use client";

import { useAccount, useReadContract } from "wagmi";
import { AmmoManagerAbi } from "@ammo-exchange/contracts/abis";
import { CONTRACT_ADDRESSES } from "@ammo-exchange/shared";

export function useKeeperCheck(): {
  isKeeper: boolean;
  isLoading: boolean;
  isConnected: boolean;
  address: `0x${string}` | undefined;
} {
  const { address, isConnected } = useAccount();

  const { data, isLoading } = useReadContract({
    address: CONTRACT_ADDRESSES.fuji.manager,
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
    address,
  };
}
