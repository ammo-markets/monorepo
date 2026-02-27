"use client";

import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useSimulateContract,
} from "wagmi";
import { erc20Abi, parseUnits } from "viem";
import { CaliberMarketAbi } from "@ammo-exchange/contracts/abis";
import { CONTRACT_ADDRESSES } from "@ammo-exchange/shared";
import type { Caliber } from "@ammo-exchange/shared";

/**
 * Two-step approve + startMint hook.
 *
 * Uses two separate `useWriteContract` instances (one for USDC approval,
 * one for CaliberMarket.startMint) so their state never collides.
 *
 * The startMint step is simulated via `useSimulateContract`, gated on
 * `hasEnoughAllowance` to avoid spurious InsufficientAllowance errors.
 */
export function useMintTransaction(
  caliber: Caliber,
  actionArgs: {
    usdcAmount: bigint | undefined;
    slippageBps: bigint;
    deadline: bigint;
  },
  options: { hasEnoughAllowance: boolean },
): {
  approve: (usdcAmount: string) => void;
  approveHash: `0x${string}` | undefined;
  approveError: Error | null;
  approveReceiptError: Error | null;
  isApprovePending: boolean;
  isApproveConfirming: boolean;
  isApproveConfirmed: boolean;
  startMint: () => void;
  mintHash: `0x${string}` | undefined;
  mintError: Error | null;
  mintReceiptError: Error | null;
  isMintPending: boolean;
  isMintConfirming: boolean;
  isMintConfirmed: boolean;
  simulationError: Error | null;
  isSimulating: boolean;
  isReady: boolean;
  reset: () => void;
} {
  const marketAddress = CONTRACT_ADDRESSES.fuji.calibers[caliber].market;
  const simulationEnabled =
    options.hasEnoughAllowance && actionArgs.usdcAmount !== undefined;

  // ── Simulate startMint ──
  const {
    data: simData,
    error: simulationError,
    isLoading: isSimulating,
  } = useSimulateContract({
    address: marketAddress,
    abi: CaliberMarketAbi,
    functionName: "startMint",
    args:
      actionArgs.usdcAmount !== undefined
        ? [actionArgs.usdcAmount, actionArgs.slippageBps, actionArgs.deadline]
        : undefined,
    query: { enabled: simulationEnabled },
  });

  // ── Approve (targets USDC contract, spender = market) ──
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

  // ── Mint (targets CaliberMarket contract) ──
  const {
    data: mintHash,
    error: mintError,
    isPending: isMintPending,
    writeContract: writeMint,
    reset: resetMint,
  } = useWriteContract();

  const {
    isLoading: isMintConfirming,
    isSuccess: isMintConfirmed,
    error: mintReceiptError,
  } = useWaitForTransactionReceipt({ hash: mintHash });

  // ── Actions ──

  function approve(usdcAmount: string) {
    writeApprove({
      address: CONTRACT_ADDRESSES.fuji.usdc,
      abi: erc20Abi,
      functionName: "approve",
      args: [marketAddress, parseUnits(usdcAmount, 6)],
    });
  }

  function startMint() {
    if (simData?.request) writeMint(simData.request);
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
    approveReceiptError,
    isApprovePending,
    isApproveConfirming,
    isApproveConfirmed,
    // Mint
    startMint,
    mintHash,
    mintError,
    mintReceiptError,
    isMintPending,
    isMintConfirming,
    isMintConfirmed,
    // Simulation
    simulationError,
    isSimulating,
    isReady: !!simData?.request,
    // Reset
    reset,
  };
}
