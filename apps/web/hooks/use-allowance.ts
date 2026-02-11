"use client";

import { useReadContract } from "wagmi";
import { erc20Abi } from "viem";
import { useCallback } from "react";

/**
 * Read on-chain ERC-20 allowance for `owner -> spender` and expose a
 * convenience `hasEnoughAllowance(required)` helper.
 */
export function useAllowance(
  tokenAddress: `0x${string}`,
  owner: `0x${string}` | undefined,
  spender: `0x${string}`,
) {
  const { data, refetch } = useReadContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: "allowance",
    args: owner ? [owner, spender] : undefined,
    query: { enabled: !!owner },
  });

  const allowance = data as bigint | undefined;

  const hasEnoughAllowance = useCallback(
    (required: bigint): boolean => {
      return allowance !== undefined && allowance >= required;
    },
    [allowance],
  );

  return { allowance, refetch, hasEnoughAllowance };
}
