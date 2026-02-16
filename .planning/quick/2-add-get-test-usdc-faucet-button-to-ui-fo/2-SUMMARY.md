---
phase: quick
plan: 2
subsystem: dashboard-faucet
tags: [faucet, usdc, testnet, dashboard, wagmi]
dependency-graph:
  requires: [MockUSDC contract deployed on Fuji]
  provides: [in-app USDC faucet for testnet users]
  affects: [dashboard, token-balances]
tech-stack:
  added: [MockUSDC ABI export]
  patterns: [useWriteContract + useWaitForTransactionReceipt, chain-gated UI]
key-files:
  created:
    - packages/contracts/src/abis/MockUSDC.ts
    - apps/web/hooks/use-usdc-faucet.ts
    - apps/web/features/dashboard/usdc-faucet-button.tsx
  modified:
    - packages/contracts/scripts/export-abis.ts
    - packages/contracts/src/abis/index.ts
    - apps/web/features/dashboard/balance-cards.tsx
    - apps/web/features/dashboard/index.ts
    - apps/web/app/(app)/dashboard/page.tsx
decisions:
  - Used BigInt(10_000e6) constant for faucet amount (10,000 USDC at 6 decimals)
  - Chain-gated button rendering (chainId === 43113 for Fuji only)
metrics:
  duration: ~2 min
  completed: 2026-02-16
---

# Quick Task 2: Add Get Test USDC Faucet Button Summary

MockUSDC ABI exported from contracts package; faucet button integrated into dashboard USDC balance row, visible only on Fuji testnet, calling MockUSDC.faucet(10_000e6) with automatic balance refresh on confirmation.

## What Was Done

### Task 1: Export MockUSDC ABI (d81757b)

Added "MockUSDC" to the `CONTRACTS_TO_EXPORT` array in `export-abis.ts` and ran `pnpm contracts:build` to generate `packages/contracts/src/abis/MockUSDC.ts` containing the full MockUSDC ABI (including `faucet(uint256)`) with `as const` for viem type inference. The barrel `index.ts` was auto-updated to export `MockUSDCAbi`.

### Task 2: Faucet Hook, Button, Dashboard Integration (91292a6)

**Hook (`use-usdc-faucet.ts`):** Follows the same `useWriteContract` + `useWaitForTransactionReceipt` pattern as `use-mint-transaction.ts`. Calls `MockUSDC.faucet(10_000e6)` at the Fuji USDC address. Accepts `onSuccess` callback that fires via `useEffect` when `isConfirmed` becomes true.

**Button (`usdc-faucet-button.tsx`):** Client component that checks `useChainId()` and returns `null` if not on Fuji (43113). Shows four states: "Get Test USDC" / "Requesting..." / "Confirming..." / "Minted!". Styled as a small outline button matching the redeem button pattern from `quick-actions.tsx`.

**Integration:** Added `onRefetch` prop to `BalanceCardsProps`, threaded `refetch` from `useTokenBalances()` through the dashboard page into `BalanceCards`, and placed `<UsdcFaucetButton>` in the USDC balance row between the label and amount.

## Deviations from Plan

None - plan executed exactly as written.

## Verification

- `pnpm --filter @ammo-exchange/contracts check` -- passes
- `pnpm --filter @ammo-exchange/web check` -- passes
- MockUSDC ABI exported and importable
- Faucet button integrated into dashboard

## Commits

| Task | Commit  | Description                                    |
| ---- | ------- | ---------------------------------------------- |
| 1    | d81757b | Export MockUSDC ABI from contracts package     |
| 2    | 91292a6 | Add faucet hook, button, dashboard integration |

## Self-Check: PASSED
