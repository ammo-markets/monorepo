"use client";

import type { Caliber } from "@ammo-exchange/shared";

/**
 * Stub: refundMint no longer exists in the 1-step mint flow.
 * Mints are now atomic — if the mint fails, the USDC transfer
 * simply reverts. No separate refund step is needed.
 *
 * This hook is preserved for type compatibility with admin UI
 * components that haven't been fully refactored yet.
 */
export function useRefundMint(
  _caliber: Caliber,
  _args: { orderId: bigint | undefined; reasonCode?: number },
): {
  write: () => void;
  hash: `0x${string}` | undefined;
  writeError: Error | null;
  simulationError: Error | null;
  receiptError: Error | null;
  error: Error | null;
  isPending: boolean;
  isConfirming: boolean;
  isConfirmed: boolean;
  isSimulating: boolean;
  isReady: boolean;
  reset: () => void;
} {
  return {
    write: () => {},
    hash: undefined,
    writeError: null,
    simulationError: null,
    receiptError: null,
    error: null,
    isPending: false,
    isConfirming: false,
    isConfirmed: false,
    isSimulating: false,
    isReady: false,
    reset: () => {},
  };
}
