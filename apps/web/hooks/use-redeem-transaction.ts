"use client";

import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseUnits } from "viem";
import { CaliberMarketAbi, AmmoTokenAbi } from "@ammo-exchange/contracts/abis";
import { CONTRACT_ADDRESSES } from "@ammo-exchange/shared";
import type { Caliber } from "@ammo-exchange/shared";

/**
 * Two-step approve AmmoToken + startRedeem hook.
 *
 * Uses two separate `useWriteContract` instances (one for AmmoToken approval,
 * one for CaliberMarket.startRedeem) so their state never collides.
 */
export function useRedeemTransaction(caliber: Caliber): {
  approve: (tokenAmount: string) => void;
  approveHash: `0x${string}` | undefined;
  approveError: Error | null;
  isApprovePending: boolean;
  isApproveConfirming: boolean;
  isApproveConfirmed: boolean;
  startRedeem: (tokenAmount: string, deadline: bigint) => void;
  redeemHash: `0x${string}` | undefined;
  redeemError: Error | null;
  isRedeemPending: boolean;
  isRedeemConfirming: boolean;
  isRedeemConfirmed: boolean;
  reset: () => void;
} {
  const marketAddress = CONTRACT_ADDRESSES.fuji.calibers[caliber].market;
  const tokenAddress = CONTRACT_ADDRESSES.fuji.calibers[caliber].token;

  // ── Approve (targets AmmoToken contract, spender = market) ──
  const {
    data: approveHash,
    error: approveError,
    isPending: isApprovePending,
    writeContract: writeApprove,
    reset: resetApprove,
  } = useWriteContract();

  const { isLoading: isApproveConfirming, isSuccess: isApproveConfirmed } =
    useWaitForTransactionReceipt({ hash: approveHash });

  // ── Redeem (targets CaliberMarket contract) ──
  const {
    data: redeemHash,
    error: redeemError,
    isPending: isRedeemPending,
    writeContract: writeRedeem,
    reset: resetRedeem,
  } = useWriteContract();

  const { isLoading: isRedeemConfirming, isSuccess: isRedeemConfirmed } =
    useWaitForTransactionReceipt({ hash: redeemHash });

  // ── Actions ──

  function approve(tokenAmount: string) {
    writeApprove({
      address: tokenAddress,
      abi: AmmoTokenAbi,
      functionName: "approve",
      args: [marketAddress, parseUnits(tokenAmount, 18)],
    });
  }

  function startRedeem(tokenAmount: string, deadline: bigint) {
    writeRedeem({
      address: marketAddress,
      abi: CaliberMarketAbi,
      functionName: "startRedeem",
      args: [parseUnits(tokenAmount, 18), deadline],
    });
  }

  function reset() {
    resetApprove();
    resetRedeem();
  }

  return {
    // Approve
    approve,
    approveHash,
    approveError,
    isApprovePending,
    isApproveConfirming,
    isApproveConfirmed,
    // Redeem
    startRedeem,
    redeemHash,
    redeemError,
    isRedeemPending,
    isRedeemConfirming,
    isRedeemConfirmed,
    // Reset
    reset,
  };
}
