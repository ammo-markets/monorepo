---
phase: 30-architecture-contract-hardening
plan: 01
subsystem: contracts
tags: [solidity, foundry, deadline-validation, price-sanity, calibermarket]

requires:
  - phase: 29-security-hardening
    provides: "Hardened contract base with access control and reentrancy guards"
provides:
  - "DeadlineInPast validation in startMint/startRedeem"
  - "PriceTooLow/PriceTooHigh sanity bounds in finalizeMint"
  - "Configurable maxPriceDeviationBps with owner-only setter"
affects: [30-02, 30-03, 31-testing]

tech-stack:
  added: []
  patterns: ["Oracle-based price sanity check at finalization time", "Configurable deviation bounds via owner setter"]

key-files:
  created: []
  modified:
    - packages/contracts/src/CaliberMarket.sol
    - packages/contracts/test/CaliberMarket.t.sol

key-decisions:
  - "Price sanity check queries oracle at finalization time (not order creation)"
  - "maxPriceDeviationBps defaults to 5000 (50%), configurable by owner"
  - "Oracle returning 0 skips sanity check (graceful degradation)"

patterns-established:
  - "Deadline validation at order initiation (not finalization)"
  - "Oracle-anchored keeper price bounds with configurable deviation"

duration: 2min
completed: 2026-02-21
---

# Phase 30 Plan 01: Contract Operational Guards Summary

**DeadlineInPast validation in startMint/startRedeem and PriceTooLow/PriceTooHigh oracle-anchored sanity bounds in finalizeMint with configurable 50% default deviation**

## Performance

- **Duration:** 2 min
- **Started:** 2026-02-21T08:36:57Z
- **Completed:** 2026-02-21T08:38:50Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- Added DeadlineInPast error and checks in both startMint and startRedeem to prevent wasted gas on expired deadlines
- Added PriceTooLow/PriceTooHigh errors with oracle-based sanity bounds in finalizeMint to prevent keeper price errors
- Added configurable maxPriceDeviationBps (default 50%) with owner-only setter
- 9 new Foundry tests covering all deadline and price sanity scenarios
- All 69 tests pass (42 existing + 9 new CaliberMarket tests + 18 other suite tests)

## Task Commits

Each task was committed atomically:

1. **Task 1: Add deadline validation and price sanity bounds to CaliberMarket.sol** - `bcb9440` (feat)
2. **Task 2: Add Foundry tests for deadline validation and price sanity bounds** - `c3f4633` (test)

## Files Created/Modified
- `packages/contracts/src/CaliberMarket.sol` - Added DeadlineInPast/PriceTooLow/PriceTooHigh errors, deadline checks in startMint/startRedeem, oracle-based price bounds in finalizeMint, maxPriceDeviationBps state var and setter
- `packages/contracts/test/CaliberMarket.t.sol` - 9 new tests: 5 CNTR-01 deadline tests, 4 CNTR-02 price sanity tests

## Decisions Made
- Price sanity check queries oracle at finalization time (current market price), not at order creation time
- maxPriceDeviationBps defaults to 5000 (50%) -- generous default to avoid false rejections
- If oracle returns 0 (broken), the sanity check is skipped entirely (graceful degradation)
- Deadline validation uses `<=` (deadline equal to current timestamp is treated as expired)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Contract changes complete, ready for ABI export (30-02) and Fuji redeployment (30-03)
- All existing tests continue to pass with new validation logic

---
*Phase: 30-architecture-contract-hardening*
*Completed: 2026-02-21*
