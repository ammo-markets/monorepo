"use client";

import { useAccount, useReadContracts } from "wagmi";
import type { Abi, Address } from "viem";
import { erc20Abi } from "viem";
import { AmmoTokenAbi } from "@ammo-exchange/contracts/abis";
import { CALIBERS } from "@ammo-exchange/shared";
import type { Caliber } from "@ammo-exchange/shared";
import { contracts as chainContracts } from "@/lib/chain";

interface BalanceOfContract {
  address: Address;
  abi: Abi;
  functionName: "balanceOf";
  args: readonly [Address];
}

export function useTokenBalances(): {
  usdc: bigint | undefined;
  tokens: Record<Caliber, bigint | undefined>;
  isLoading: boolean;
  refetch: () => void;
} {
  const { address, isConnected } = useAccount();

  const contracts: BalanceOfContract[] = address
    ? [
        {
          address: chainContracts.usdc,
          abi: erc20Abi as Abi,
          functionName: "balanceOf",
          args: [address],
        },
        ...CALIBERS.map(
          (caliber): BalanceOfContract => ({
            address: chainContracts.calibers[caliber].token,
            abi: AmmoTokenAbi as Abi,
            functionName: "balanceOf",
            args: [address],
          }),
        ),
      ]
    : [];

  const { data, isLoading, refetch } = useReadContracts({
    contracts,
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
