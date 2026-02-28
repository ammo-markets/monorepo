"use client";

import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useSimulateContract,
} from "wagmi";
import { parseUnits } from "viem";
import { CaliberMarketAbi, AmmoTokenAbi } from "@ammo-exchange/contracts/abis";
import type { Caliber } from "@ammo-exchange/shared";
import { contracts } from "@/lib/chain";

/**
 * Two-step approve AmmoToken + startRedeem hook.
 *
 * Uses two separate `useWriteContract` instances (one for AmmoToken approval,
 * one for CaliberMarket.startRedeem) so their state never collides.
 *
 * The startRedeem step is simulated via `useSimulateContract`, gated on
 * `hasEnoughAllowance` to avoid spurious InsufficientAllowance errors.
 */
export function useRedeemTransaction(
  caliber: Caliber,
  actionArgs: {
    tokenAmount: bigint | undefined;
    deadline: bigint;
  },
  options: { hasEnoughAllowance: boolean },
): {
  approve: (tokenAmount: string) => void;
  approveHash: `0x${string}` | undefined;
  approveError: Error | null;
  approveReceiptError: Error | null;
  isApprovePending: boolean;
  isApproveConfirming: boolean;
  isApproveConfirmed: boolean;
  startRedeem: () => void;
  redeemHash: `0x${string}` | undefined;
  redeemError: Error | null;
  redeemReceiptError: Error | null;
  isRedeemPending: boolean;
  isRedeemConfirming: boolean;
  isRedeemConfirmed: boolean;
  simulationError: Error | null;
  isSimulating: boolean;
  isReady: boolean;
  reset: () => void;
} {
  const marketAddress = contracts.calibers[caliber].market;
  const tokenAddress = contracts.calibers[caliber].token;
  const simulationEnabled =
    options.hasEnoughAllowance && actionArgs.tokenAmount !== undefined;

  // ── Simulate startRedeem ──
  const {
    data: simData,
    error: simulationError,
    isLoading: isSimulating,
  } = useSimulateContract({
    address: marketAddress,
    abi: CaliberMarketAbi,
    functionName: "startRedeem",
    args:
      actionArgs.tokenAmount !== undefined
        ? [actionArgs.tokenAmount, actionArgs.deadline]
        : undefined,
    query: { enabled: simulationEnabled },
  });

  // ── Approve (targets AmmoToken contract, spender = market) ──
  const {
    data: approveHash,
    error: approveError,
    isPending: isApprovePending,
    writeContract: writeApprove,
    reset: resetApprove,
  } = useWriteContract();

  const {
    isLoading: isApproveConfirming,
    isSuccess: isApproveConfirmed,
    error: approveReceiptError,
  } = useWaitForTransactionReceipt({ hash: approveHash });

  // ── Redeem (targets CaliberMarket contract) ──
  const {
    data: redeemHash,
    error: redeemError,
    isPending: isRedeemPending,
    writeContract: writeRedeem,
    reset: resetRedeem,
  } = useWriteContract();

  const {
    isLoading: isRedeemConfirming,
    isSuccess: isRedeemConfirmed,
    error: redeemReceiptError,
  } = useWaitForTransactionReceipt({ hash: redeemHash });

  // ── Actions ──

  function approve(tokenAmount: string) {
    writeApprove({
      address: tokenAddress,
      abi: AmmoTokenAbi,
      functionName: "approve",
      args: [marketAddress, parseUnits(tokenAmount, 18)],
    });
  }

  function startRedeem() {
    if (simData?.request) writeRedeem(simData.request);
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
    approveReceiptError,
    isApprovePending,
    isApproveConfirming,
    isApproveConfirmed,
    // Redeem
    startRedeem,
    redeemHash,
    redeemError,
    redeemReceiptError,
    isRedeemPending,
    isRedeemConfirming,
    isRedeemConfirmed,
    // Simulation
    simulationError,
    isSimulating,
    isReady: !!simData?.request,
    // Reset
    reset,
  };
}
