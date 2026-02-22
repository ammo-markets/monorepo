"use client";

import type { BaseError } from "wagmi";

/**
 * Map of CaliberMarket (and common ERC20) custom error names to
 * human-readable messages shown in the UI.
 */
export const CONTRACT_ERROR_MESSAGES: Record<string, string> = {
  InvalidAmount: "Amount must be greater than zero.",
  MinMintNotMet:
    "Amount is below the minimum mint requirement for this caliber.",
  MarketPaused: "This market is currently paused. Please try again later.",
  DeadlineExpired:
    "The transaction deadline has passed. Please submit a new order.",
  Slippage:
    "Price moved beyond your slippage tolerance. Try again with a higher slippage.",
  InvalidPrice: "Oracle price is unavailable. Please try again shortly.",
  TreasuryNotSet: "Protocol configuration error. Please contact support.",
  NotKeeper: "Unauthorized: only protocol keepers can execute this.",
  NotOwner: "Unauthorized: only protocol owner can execute this.",
  Reentrancy: "Transaction conflict detected. Please try again.",
  ZeroAddress: "Invalid address configuration.",
  InvalidBps: "Fee configuration error.",
  InvalidStatus: "Order is not in the expected state for this action.",
  InsufficientBalance: "Insufficient token balance for this operation.",
  InsufficientAllowance: "Token allowance not set. Please approve first.",
};

/**
 * Parse a wagmi / viem contract error into a user-friendly message.
 *
 * Priority:
 * 1. User rejection  (wallet popup dismissed)
 * 2. Known custom error name from CaliberMarket / ERC20
 * 3. viem shortMessage fallback
 * 4. Generic fallback
 */
export function parseContractError(error: Error | null): string {
  if (!error) return "";

  const baseError = error as BaseError;

  // 1. User rejected the transaction in their wallet
  const short = baseError.shortMessage ?? "";
  if (short.includes("User rejected") || short.includes("User denied")) {
    return "Transaction cancelled. You rejected the request in your wallet.";
  }

  // 2. Custom contract error name (e.g. CaliberMarket revert)
  interface ContractErrorCause {
    data?: { errorName?: string };
    reason?: string;
  }
  const cause: ContractErrorCause | undefined =
    "cause" in error ? (error.cause as ContractErrorCause) : undefined;
  const errorName: string | undefined = cause?.data?.errorName ?? cause?.reason;
  if (errorName && CONTRACT_ERROR_MESSAGES[errorName]) {
    return CONTRACT_ERROR_MESSAGES[errorName];
  }

  // 3. shortMessage from viem BaseError
  if (short) return short;

  // 4. Fallback
  return "An unexpected error occurred. Please try again.";
}
