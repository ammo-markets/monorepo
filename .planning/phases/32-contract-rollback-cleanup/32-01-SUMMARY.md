---
phase: 32-contract-rollback-cleanup
plan: 01
subsystem: contracts
tags: [solidity, foundry, abi, fuji, rollback]

# Dependency graph
requires: []
provides:
  - "CaliberMarket.sol reverted to pre-30-01 state (no oracle sanity check, no DeadlineInPast)"
  - "Regenerated ABI matching reverted contract"
  - "Fuji config rolled back to old deployment addresses (block 51699730)"
  - "Frontend error map cleaned of orphaned entries"
affects: []

# Tech tracking
tech-stack:
  added: []
  patterns: []

key-files:
  created: []
  modified:
    - "packages/contracts/src/CaliberMarket.sol"
    - "packages/contracts/test/CaliberMarket.t.sol"
    - "packages/contracts/src/abis/CaliberMarket.ts"
    - "packages/shared/src/config/index.ts"
    - "apps/web/lib/errors.ts"

key-decisions:
  - "Oracle sanity check removed from finalizeMint -- user slippage guard (minTokensOut) is sufficient for pre-PMF flow"
  - "DeadlineInPast validation removed from contract -- frontend can validate client-side"
  - "Rolled back to old Fuji deployment (block 51699730) instead of redeploying"

patterns-established: []

# Metrics
duration: 4min
completed: 2026-02-22
---

# Phase 32 Plan 01: Contract Rollback Summary

**Reverted CaliberMarket to pre-30-01 state, removing oracle sanity check, DeadlineInPast, and price deviation bounds; rolled back Fuji config to old deployment at block 51699730**

## Performance

- **Duration:** 4 min
- **Started:** 2026-02-22T02:30:40Z
- **Completed:** 2026-02-22T02:34:17Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments
- Removed DeadlineInPast, PriceTooLow, PriceTooHigh errors, maxPriceDeviationBps state, setMaxPriceDeviation function, and oracle query from finalizeMint
- Removed 9 tests (CNTR-01 and CNTR-02 sections) while keeping all 45 CaliberMarket tests and 63 total tests passing
- Regenerated ABI from reverted contract source
- Rolled back Fuji addresses to old deployment (manager 0x5dB2..., block 51699730)
- Removed 3 orphaned error mappings from frontend error map
- Full monorepo build passes with zero errors

## Task Commits

Each task was committed atomically:

1. **Task 1: Revert CaliberMarket.sol and clean up tests** - `8725311` (feat)
2. **Task 2: Regenerate ABI, roll back config, remove error mappings** - `38634b5` (feat)

## Files Created/Modified
- `packages/contracts/src/CaliberMarket.sol` - Removed 30-01 additions (errors, state, oracle check, function)
- `packages/contracts/test/CaliberMarket.t.sol` - Removed CNTR-01 and CNTR-02 test sections (9 tests)
- `packages/contracts/src/abis/CaliberMarket.ts` - Regenerated ABI from reverted contract
- `packages/shared/src/config/index.ts` - Rolled back Fuji addresses and deployment block
- `apps/web/lib/errors.ts` - Removed DeadlineInPast, PriceTooLow, PriceTooHigh entries

## Decisions Made
- Oracle sanity check removed from finalizeMint -- user slippage guard (minTokensOut) is sufficient for pre-PMF flow
- DeadlineInPast validation removed from contract -- frontend can validate client-side
- Rolled back to old Fuji deployment (block 51699730) instead of redeploying

## Deviations from Plan

None - plan executed exactly as written.

**DATA-01 Note:** Database check for stale testnet orders (blockNumber >= 52030756) could not be performed locally due to no DATABASE_URL configured in the development environment. This should be verified in the production/staging environment. Given no new deployment was actively used in production, stale orders are unlikely to exist.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Contract rollback complete, all changes are source-level only (no redeployment needed)
- Old Fuji contracts at block 51699730 are live and include all audit fixes except 30-01 additions
- Phase 30-02 worker improvements (gap backfill, config-driven calibers) remain intact as they are contract-independent

---
*Phase: 32-contract-rollback-cleanup*
*Completed: 2026-02-22*
