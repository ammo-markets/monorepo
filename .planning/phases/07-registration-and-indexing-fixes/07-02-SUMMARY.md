---
phase: 07-registration-and-indexing-fixes
plan: 02
subsystem: infra
tags: [viem, bigint, event-indexing, rpc-optimization, avalanche]

# Dependency graph
requires:
  - phase: 02-event-indexer
    provides: "Worker polling loop (pollOnce, cursor, batch scanning)"
provides:
  - "DEPLOYMENT_BLOCKS config in shared package with fuji block 51699730"
  - "Worker starts from deployment block instead of block 0 on fresh DB"
  - "Backfill progress logging with percentage and event count"
affects: [worker, indexer, future-chain-deployments]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "BigInt() constructor instead of n-suffix for ES2017 compat in shared package"
    - "Deployment block floor pattern -- never scan before contracts existed"

key-files:
  created: []
  modified:
    - packages/shared/src/config/index.ts
    - apps/worker/src/lib/constants.ts
    - apps/worker/src/indexer.ts

key-decisions:
  - "Used BigInt() constructor instead of BigInt literal (n suffix) for ES2017 web tsconfig compat"
  - "DEPLOYMENT_BLOCK used as floor via Math.max-style comparison, not cursor override"
  - "Progress logging per batch with percentage, not just final summary"

patterns-established:
  - "DEPLOYMENT_BLOCKS in shared config mirrors CONTRACT_ADDRESSES structure (fuji/mainnet keys)"
  - "Worker floor pattern: rawFrom < DEPLOYMENT_BLOCK ? DEPLOYMENT_BLOCK : rawFrom"

# Metrics
duration: 3min
completed: 2026-02-11
---

# Phase 7 Plan 2: Deployment Block Floor Summary

**DEPLOYMENT_BLOCKS config in shared package with worker floor at block 51699730, eliminating 51M+ wasted RPC calls on fresh databases**

## Performance

- **Duration:** 3 min
- **Started:** 2026-02-11T15:09:12Z
- **Completed:** 2026-02-11T15:12:35Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- Added `DEPLOYMENT_BLOCKS` export to shared config with Fuji deployment block (51699730)
- Worker `pollOnce` now uses deployment block as floor -- fresh DB starts at block 51699730 instead of block 0
- Added per-batch progress logging with percentage, block range, and cumulative event count
- Enhanced backfill summary log with total blocks scanned count

## Task Commits

Each task was committed atomically:

1. **Task 1: Add DEPLOYMENT_BLOCKS to shared config** - `685d12b` (feat)
2. **Task 2: Fix worker to use deployment block as floor with progress logging** - `58612a6` (fix)

## Files Created/Modified
- `packages/shared/src/config/index.ts` - Added DEPLOYMENT_BLOCKS export with fuji: BigInt(51699730), mainnet: BigInt(0)
- `apps/worker/src/lib/constants.ts` - Added DEPLOYMENT_BLOCK constant imported from shared
- `apps/worker/src/indexer.ts` - pollOnce uses deployment block floor, per-batch progress logging, enhanced summary log

## Decisions Made
- Used `BigInt()` constructor instead of BigInt literal (`n` suffix) because the web app's tsconfig targets ES2017 which doesn't support BigInt literals. Since shared package ships raw TypeScript consumed by all apps, it must use the lowest-common-denominator syntax.
- DEPLOYMENT_BLOCK is a floor, not a cursor override -- if cursor is already past deployment block, it continues from cursor normally. This prevents regression for existing databases.
- Progress logging happens per batch inside the while loop, giving visibility into long backfill operations.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Changed BigInt literal to BigInt() constructor for ES2017 compat**
- **Found during:** Task 2 (full monorepo build verification)
- **Issue:** Plan specified `51699730n` BigInt literal syntax, but web app tsconfig targets ES2017 which doesn't support BigInt literals. Since shared package ships raw TypeScript transpiled by consumers, the literal syntax caused a build failure in `@ammo-exchange/web`.
- **Fix:** Changed `51699730n` to `BigInt(51699730)` and `0n` to `BigInt(0)` in DEPLOYMENT_BLOCKS config
- **Files modified:** packages/shared/src/config/index.ts
- **Verification:** `pnpm build` passes (all 4 packages including web)
- **Committed in:** 58612a6 (Task 2 commit, since it was discovered during Task 2 verification)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Essential fix for monorepo build compatibility. No scope creep. Runtime behavior identical (BigInt() produces same value as n-suffix literal).

## Issues Encountered
None beyond the deviation documented above.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Worker indexer now starts efficiently from deployment block on fresh databases
- DEPLOYMENT_BLOCKS config ready for mainnet deployment block when available
- Both Phase 7 plans (01: user registration, 02: indexing fix) address the two blockers identified in STATE.md

## Self-Check: PASSED

All files exist. All commits verified (685d12b, 58612a6).

---
*Phase: 07-registration-and-indexing-fixes*
*Completed: 2026-02-11*
