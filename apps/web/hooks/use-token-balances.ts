"use client";

import { useAccount, useReadContracts } from "wagmi";
import { erc20Abi } from "viem";
import { AmmoTokenAbi } from "@ammo-exchange/contracts/abis";
import { CONTRACT_ADDRESSES } from "@ammo-exchange/shared";
import type { Caliber } from "@ammo-exchange/shared";

const CALIBERS: Caliber[] = ["9MM", "556", "22LR", "308"];
const fuji = CONTRACT_ADDRESSES.fuji;

export function useTokenBalances(): {
  usdc: bigint | undefined;
  tokens: Record<Caliber, bigint | undefined>;
  isLoading: boolean;
  refetch: () => void;
} {
  const { address, isConnected } = useAccount();

  const contracts = [
    // USDC balance (entry 0)
    {
      address: fuji.usdc,
      abi: erc20Abi,
      functionName: "balanceOf" as const,
      args: [address!] as const,
    },
    // 4 AmmoToken balances (entries 1-4)
    ...CALIBERS.map(
      (caliber) =>
        ({
          address: fuji.calibers[caliber].token,
          abi: AmmoTokenAbi,
          functionName: "balanceOf" as const,
          args: [address!] as const,
        }) as const,
    ),
  ] as const;

  const { data, isLoading, refetch } = useReadContracts({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    contracts: contracts as any,
    query: {
      enabled: isConnected && !!address,
    },
  });

  return {
    usdc: data?.[0]?.result as bigint | undefined,
    tokens: Object.fromEntries(
      CALIBERS.map((caliber, i) => [
        caliber,
        data?.[i + 1]?.result as bigint | undefined,
      ]),
    ) as Record<Caliber, bigint | undefined>,
    isLoading,
    refetch,
  };
}
