"use client";

import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { erc20Abi, parseUnits } from "viem";
import { CaliberMarketAbi } from "@ammo-exchange/contracts/abis";
import { CONTRACT_ADDRESSES } from "@ammo-exchange/shared";
import type { Caliber } from "@ammo-exchange/shared";

/**
 * Two-step approve + startMint hook.
 *
 * Uses two separate `useWriteContract` instances (one for USDC approval,
 * one for CaliberMarket.startMint) so their state never collides.
 */
export function useMintTransaction(caliber: Caliber): {
  approve: (usdcAmount: string) => void;
  approveHash: `0x${string}` | undefined;
  approveError: Error | null;
  isApprovePending: boolean;
  isApproveConfirming: boolean;
  isApproveConfirmed: boolean;
  startMint: (
    usdcAmount: string,
    slippageBps: bigint,
    deadline: bigint,
  ) => void;
  mintHash: `0x${string}` | undefined;
  mintError: Error | null;
  isMintPending: boolean;
  isMintConfirming: boolean;
  isMintConfirmed: boolean;
  reset: () => void;
} {
  const marketAddress = CONTRACT_ADDRESSES.fuji.calibers[caliber].market;

  // ── Approve (targets USDC contract, spender = market) ──
  const {
    data: approveHash,
    error: approveError,
    isPending: isApprovePending,
    writeContract: writeApprove,
    reset: resetApprove,
  } = useWriteContract();

  const { isLoading: isApproveConfirming, isSuccess: isApproveConfirmed } =
    useWaitForTransactionReceipt({ hash: approveHash });

  // ── Mint (targets CaliberMarket contract) ──
  const {
    data: mintHash,
    error: mintError,
    isPending: isMintPending,
    writeContract: writeMint,
    reset: resetMint,
  } = useWriteContract();

  const { isLoading: isMintConfirming, isSuccess: isMintConfirmed } =
    useWaitForTransactionReceipt({ hash: mintHash });

  // ── Actions ──

  function approve(usdcAmount: string) {
    writeApprove({
      address: CONTRACT_ADDRESSES.fuji.usdc,
      abi: erc20Abi,
      functionName: "approve",
      args: [marketAddress, parseUnits(usdcAmount, 6)],
    });
  }

  function startMint(
    usdcAmount: string,
    slippageBps: bigint,
    deadline: bigint,
  ) {
    writeMint({
      address: marketAddress,
      abi: CaliberMarketAbi,
      functionName: "startMint",
      args: [parseUnits(usdcAmount, 6), slippageBps, deadline],
    });
  }

  function reset() {
    resetApprove();
    resetMint();
  }

  return {
    // Approve
    approve,
    approveHash,
    approveError,
    isApprovePending,
    isApproveConfirming,
    isApproveConfirmed,
    // Mint
    startMint,
    mintHash,
    mintError,
    isMintPending,
    isMintConfirming,
    isMintConfirmed,
    // Reset
    reset,
  };
}
