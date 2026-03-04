"use client";

import type { Caliber } from "@ammo-exchange/shared";

/**
 * Stub: finalizeMint no longer exists in the 1-step mint flow.
 * Mints are now atomic — the oracle price is used at mint time,
 * so there's no keeper finalization step.
 *
 * This hook is preserved for type compatibility with admin UI
 * components that haven't been fully refactored yet.
 */
export function useFinalizeMint(
  _caliber: Caliber,
  _args: { orderId: bigint | undefined; actualPriceX18: bigint | undefined },
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
