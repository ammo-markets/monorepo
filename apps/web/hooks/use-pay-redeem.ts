"use client";

import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useSimulateContract,
} from "wagmi";
import { erc20Abi } from "viem";
import { CaliberMarketAbi } from "@ammo-exchange/contracts/abis";
import type { Caliber } from "@ammo-exchange/shared";
import { contracts } from "@/lib/chain";

/**
 * Two-step approve USDC + payRedeem hook.
 *
 * Uses two separate `useWriteContract` instances (one for USDC approval,
 * one for CaliberMarket.payRedeem) so their state never collides.
 *
 * The payRedeem step is simulated via `useSimulateContract`, gated on
 * `hasEnoughAllowance` to avoid spurious InsufficientAllowance errors.
 */
export function usePayRedeem(
  caliber: Caliber,
  args: {
    orderId: bigint | undefined;
    totalCost: bigint | undefined; // shippingCost + protocolFee in USDC (6 decimals)
  },
  options: { hasEnoughAllowance: boolean },
): {
  approveUsdc: () => void;
  approveHash: `0x${string}` | undefined;
  approveError: Error | null;
  approveReceiptError: Error | null;
  isApprovePending: boolean;
  isApproveConfirming: boolean;
  isApproveConfirmed: boolean;
  payRedeem: () => void;
  payHash: `0x${string}` | undefined;
  payError: Error | null;
  payReceiptError: Error | null;
  isPayPending: boolean;
  isPayConfirming: boolean;
  isPayConfirmed: boolean;
  simulationError: Error | null;
  isSimulating: boolean;
  isReady: boolean;
  reset: () => void;
} {
  const marketAddress = contracts.calibers[caliber].market;
  const usdcAddress = contracts.usdc;
  const simulationEnabled =
    options.hasEnoughAllowance && args.orderId !== undefined;

  // ── Simulate payRedeem ──
  const {
    data: simData,
    error: simulationError,
    isLoading: isSimulating,
  } = useSimulateContract({
    address: marketAddress,
    abi: CaliberMarketAbi,
    functionName: "payRedeem",
    args: args.orderId !== undefined ? [args.orderId] : undefined,
    query: { enabled: simulationEnabled },
  });

  // ── Approve USDC (spender = market) ──
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

  // ── Pay Redeem ──
  const {
    data: payHash,
    error: payError,
    isPending: isPayPending,
    writeContract: writePay,
    reset: resetPay,
  } = useWriteContract();

  const {
    isLoading: isPayConfirming,
    isSuccess: isPayConfirmed,
    error: payReceiptError,
  } = useWaitForTransactionReceipt({ hash: payHash });

  // ── Actions ──

  function approveUsdc() {
    if (args.totalCost === undefined) return;
    writeApprove({
      address: usdcAddress,
      abi: erc20Abi,
      functionName: "approve",
      args: [marketAddress, args.totalCost],
    });
  }

  function payRedeem() {
    if (simData?.request) writePay(simData.request);
  }

  function reset() {
    resetApprove();
    resetPay();
  }

  return {
    // Approve USDC
    approveUsdc,
    approveHash,
    approveError,
    approveReceiptError,
    isApprovePending,
    isApproveConfirming,
    isApproveConfirmed,
    // Pay Redeem
    payRedeem,
    payHash,
    payError,
    payReceiptError,
    isPayPending,
    isPayConfirming,
    isPayConfirmed,
    // Simulation
    simulationError,
    isSimulating,
    isReady: !!simData?.request,
    // Reset
    reset,
  };
}
