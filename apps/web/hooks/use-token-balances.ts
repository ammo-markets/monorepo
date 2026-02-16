"use client";

import { useAccount, useReadContracts } from "wagmi";
import type { Abi, Address } from "viem";
import { erc20Abi } from "viem";
import { AmmoTokenAbi } from "@ammo-exchange/contracts/abis";
import { CONTRACT_ADDRESSES } from "@ammo-exchange/shared";
import type { Caliber } from "@ammo-exchange/shared";

const CALIBERS: Caliber[] = ["9MM", "556", "22LR", "308"];
const fuji = CONTRACT_ADDRESSES.fuji;

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
          address: fuji.usdc,
          abi: erc20Abi as Abi,
          functionName: "balanceOf",
          args: [address],
        },
        ...CALIBERS.map(
          (caliber): BalanceOfContract => ({
            address: fuji.calibers[caliber].token,
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
