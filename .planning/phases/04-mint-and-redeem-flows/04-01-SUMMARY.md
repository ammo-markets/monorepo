---
phase: 04-mint-and-redeem-flows
plan: 01
subsystem: ui
tags: [wagmi, viem, erc20, useWriteContract, useReadContract, mint, usdc, allowance]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: "CaliberMarket ABI with startMint, custom errors; CONTRACT_ADDRESSES with per-caliber market/token addresses"
  - phase: 03-wallet-and-api-layer
    provides: "useWallet hook, useTokenBalances hook, wagmi provider, snowtraceUrl/truncateAddress utils"
provides:
  - "parseContractError for human-readable contract error messages"
  - "tx-utils with parseUsdc, formatUsdc, getDeadline, DEFAULT_SLIPPAGE_BPS"
  - "useAllowance hook for ERC20 allowance reads"
  - "useMintTransaction hook with two-step approve+startMint"
  - "Mint flow UI wired to real on-chain transactions"
affects: [04-02-redeem-flow, 05-frontend-views]

# Tech tracking
tech-stack:
  added: []
  patterns: [two-step-approve-then-execute, txstatus-state-machine, explicit-return-types-for-wagmi-hooks]

key-files:
  created:
    - apps/web/lib/errors.ts
    - apps/web/lib/tx-utils.ts
    - apps/web/hooks/use-allowance.ts
    - apps/web/hooks/use-mint-transaction.ts
  modified:
    - apps/web/features/mint/mint-flow.tsx

key-decisions:
  - "Explicit return type on useMintTransaction to avoid non-portable @wagmi/core type inference error"
  - "TxStatus state machine derived from hook states via useMemo, not manual setState"
  - "Error priority: check confirmed/pending states before error states to avoid false 'failed' on subsequent approve"
  - "Added InvalidStatus error mapping (present in ABI but not in original plan error list)"

patterns-established:
  - "Two-step approve+execute: separate useWriteContract instances to prevent state collision"
  - "TxStatus derivation: useMemo over hook booleans, prioritizing terminal states first"
  - "Error parsing: BaseError.shortMessage for user rejection, cause.data.errorName for custom errors"

# Metrics
duration: 5min
completed: 2026-02-11
---

# Phase 4 Plan 01: Mint Flow Wiring Summary

**Real on-chain USDC approval and CaliberMarket.startMint via wagmi hooks, replacing all setTimeout mocks with TxStatus state machine, allowance checks, and human-readable error mapping**

## Performance

- **Duration:** 5 min
- **Started:** 2026-02-11T03:52:11Z
- **Completed:** 2026-02-11T03:57:00Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments
- Contract error mapping covering all 13 CaliberMarket custom errors plus ERC20 errors with user-friendly messages
- Two-step approve+startMint hook using separate useWriteContract instances to prevent state collision
- Mint flow UI fully wired to real hooks: useWallet for connection, useTokenBalances for USDC balance, useAllowance for skip-approve detection, useMintTransaction for tx execution
- TxStatus state machine (idle/approving/approve-confirming/approved/minting/mint-confirming/confirmed/failed) derived from hook states
- All setTimeout mocks removed; Snowtrace links use real tx hashes; error messages never show raw hex

## Task Commits

Each task was committed atomically:

1. **Task 1: Create shared utility files** - `b65bd0b` (feat)
2. **Task 2: Create useMintTransaction hook and rewire mint-flow.tsx** - `e092c13` (feat)

## Files Created/Modified
- `apps/web/lib/errors.ts` - CONTRACT_ERROR_MESSAGES record + parseContractError function
- `apps/web/lib/tx-utils.ts` - getDeadline, DEFAULT_SLIPPAGE_BPS, parseUsdc/formatUsdc, parseTokenAmount/formatTokenAmount
- `apps/web/hooks/use-allowance.ts` - ERC20 allowance read hook with hasEnoughAllowance helper
- `apps/web/hooks/use-mint-transaction.ts` - Two useWriteContract instances (approve + startMint) with explicit return type
- `apps/web/features/mint/mint-flow.tsx` - Complete rewrite replacing mock state with real wagmi hooks

## Decisions Made
- **Explicit return type on useMintTransaction:** TypeScript inferred a non-portable type referencing internal `@wagmi/core` module paths. Added explicit return type annotation to fix TS2742 error.
- **TxStatus derived via useMemo:** Instead of manual setState for wallet status, the tx status is computed from hook boolean states with priority ordering (confirmed > pending > approved > error > idle).
- **InvalidStatus error added:** The CaliberMarket ABI contains an `InvalidStatus` custom error not listed in the original plan. Added it to the error mapping for completeness.
- **Removed View Order CTA from confirmation:** Since the worker creates order records asynchronously, the confirmation step shows "Pending indexing" instead of a hardcoded order ID, and the View Order button was replaced with just Mint More.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added explicit return type to useMintTransaction**
- **Found during:** Task 2 (useMintTransaction hook)
- **Issue:** TypeScript error TS2742 -- inferred return type references non-portable `@wagmi/core` internal path
- **Fix:** Added explicit return type annotation with all 13 fields typed
- **Files modified:** apps/web/hooks/use-mint-transaction.ts
- **Verification:** `pnpm --filter @ammo-exchange/web check` passes
- **Committed in:** e092c13

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Type annotation fix necessary for TypeScript compilation. No scope creep.

## Issues Encountered
None beyond the type inference fix documented above.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Mint flow fully functional with real contract calls
- errors.ts, tx-utils.ts, and use-allowance.ts are shared utilities ready for Plan 02 (redeem flow)
- useMintTransaction pattern (two separate useWriteContract instances) establishes the template for useRedeemTransaction

## Self-Check: PASSED

All 5 files verified on disk. Both commit hashes (b65bd0b, e092c13) found in git log.

---
*Phase: 04-mint-and-redeem-flows*
*Completed: 2026-02-11*
