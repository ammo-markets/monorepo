---
phase: 30-architecture-contract-hardening
plan: 03
subsystem: contracts
tags: [solidity, abi-export, fuji-deployment, contract-addresses, viem]

requires:
  - phase: 30-01
    provides: "DeadlineInPast/PriceTooLow/PriceTooHigh errors and maxPriceDeviationBps in CaliberMarket.sol"
provides:
  - "Updated TypeScript ABI exports with new error types and functions"
  - "Fresh Fuji deployment with all 15 contract addresses"
  - "Frontend error parser mappings for 3 new contract errors"
  - "Updated DEPLOYMENT_BLOCKS.fuji to block 52030756"
affects: [31-testing, apps/web, apps/worker]

tech-stack:
  added: []
  patterns:
    [
      "ABI export pipeline: forge build -> tsx export-abis.ts -> TypeScript const arrays",
    ]

key-files:
  created: []
  modified:
    - packages/contracts/src/abis/CaliberMarket.ts
    - packages/shared/src/config/index.ts
    - apps/web/lib/errors.ts

key-decisions:
  - "All 15 Fuji contracts redeployed to include deadline validation and price sanity bounds"
  - "Deployment block 52030756 replaces 51699730 for event indexing start point"

patterns-established:
  - "Frontend error mapping must be updated alongside ABI exports when new contract errors are added"

duration: 9min
completed: 2026-02-21
---

# Phase 30 Plan 03: ABI Export & Fuji Redeployment Summary

**Regenerated CaliberMarket ABI with DeadlineInPast/PriceTooLow/PriceTooHigh errors, redeployed all 15 contracts to Fuji, and updated shared config with new addresses at block 52030756**

## Performance

- **Duration:** 9 min (includes human deployment step)
- **Started:** 2026-02-21T08:40:42Z
- **Completed:** 2026-02-21T08:50:03Z
- **Tasks:** 3
- **Files modified:** 7

## Accomplishments

- Regenerated all 5 ABI TypeScript exports with new error types (DeadlineInPast, PriceTooLow, PriceTooHigh) and functions (maxPriceDeviationBps, setMaxPriceDeviation)
- Added 3 new error messages to frontend parseContractError mapping for user-facing error display
- Updated all 15 Fuji contract addresses (MockUSDC, AmmoManager, AmmoFactory, 4 calibers x oracle/market/token) to fresh deployment
- Updated DEPLOYMENT_BLOCKS.fuji from 51699730 to 52030756
- Full monorepo typecheck passes across all 8 turbo tasks

## Task Commits

Each task was committed atomically:

1. **Task 1: Export updated ABIs from compiled contracts** - `c04e9f0` (feat)
2. **Task 2: Deploy contracts to Fuji testnet** - human-action checkpoint (user deployed)
3. **Task 3: Update shared config with new Fuji addresses and deployment block** - `685c4a4` (feat)

## Files Created/Modified

- `packages/contracts/src/abis/CaliberMarket.ts` - Updated ABI with DeadlineInPast, PriceTooLow, PriceTooHigh errors and maxPriceDeviationBps/setMaxPriceDeviation functions
- `packages/contracts/src/abis/AmmoFactory.ts` - Regenerated ABI export
- `packages/contracts/src/abis/AmmoManager.ts` - Regenerated ABI export
- `packages/contracts/src/abis/AmmoToken.ts` - Regenerated ABI export
- `packages/contracts/src/abis/MockUSDC.ts` - Regenerated ABI export
- `apps/web/lib/errors.ts` - Added DeadlineInPast, PriceTooLow, PriceTooHigh error message mappings
- `packages/shared/src/config/index.ts` - Updated all Fuji addresses and deployment block to 52030756

## Decisions Made

- All 15 Fuji contracts redeployed together (clean deployment includes deadline validation and price sanity bounds from Plan 01)
- Deployment block 52030756 replaces 51699730 as the new event indexing start point
- Frontend error parser extended with 3 new error mappings alongside ABI update (Rule 2 - missing critical functionality for user error display)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## User Setup Required

None - deployment was completed by the user as part of the checkpoint flow.

## Next Phase Readiness

- All contract changes from Phase 30 are deployed and reflected in TypeScript
- ABI exports, shared config, and frontend error mappings are in sync
- Ready for Phase 31 (testing) which exercises code from all prior phases

---

_Phase: 30-architecture-contract-hardening_
_Completed: 2026-02-21_
