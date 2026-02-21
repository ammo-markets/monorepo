---
phase: 30-architecture-contract-hardening
plan: 02
subsystem: worker
tags: [caliber-registry, backfill, config-driven, prisma, worker]

requires:
  - phase: 27-schema-migration
    provides: "usdcAmount/tokenAmount fields and ActivityLog table"
provides:
  - "Config-driven CALIBERS list derived from CONTRACT_ADDRESSES"
  - "Gap-aware ActivityLog backfill that fills missing windows"
affects: [31-testing, worker-deployment]

tech-stack:
  added: []
  patterns: ["config-driven caliber registry via shared CONTRACT_ADDRESSES"]

key-files:
  created: []
  modified:
    - apps/worker/src/lib/constants.ts
    - apps/worker/src/stats.ts

key-decisions:
  - "CALIBERS derived from CONTRACT_ADDRESSES.fuji.calibers keys mapped through CALIBER_TO_PRISMA"
  - "Gap backfill uses latest ActivityLog timestamp + skipDuplicates for idempotency"
  - "Dynamic caliber count in stats log message instead of hardcoded '4'"

patterns-established:
  - "Config-driven registry: derive runtime lists from shared CONTRACT_ADDRESSES keys, never hardcode"

duration: 1min
completed: 2026-02-21
---

# Phase 30 Plan 02: Dynamic Caliber Registry and Gap-Aware Backfill Summary

**Config-driven caliber list from shared CONTRACT_ADDRESSES and gap-aware ActivityLog backfill using latest-timestamp detection with skipDuplicates**

## Performance

- **Duration:** 1 min
- **Started:** 2026-02-21T08:37:04Z
- **Completed:** 2026-02-21T08:38:22Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- Worker CALIBERS list now derived from CONTRACT_ADDRESSES keys via CALIBER_TO_PRISMA mapping -- adding a caliber to shared config auto-includes it in worker
- backfillActivityLog detects gaps by finding latest ActivityLog timestamp and backfilling only newer completed orders
- Uses skipDuplicates for idempotent partial-backfill safety
- Removed hardcoded caliber array from stats.ts

## Task Commits

Each task was committed atomically:

1. **Task 1: Derive caliber registry from shared config** - `16c7425` (feat)
2. **Task 2: Fix ActivityLog backfill to detect and fill time gaps** - `4bb807c` (fix)

## Files Created/Modified
- `apps/worker/src/lib/constants.ts` - Added CALIBERS export derived from CONTRACT_ADDRESSES keys via CALIBER_TO_PRISMA
- `apps/worker/src/stats.ts` - Gap-aware backfill, imported CALIBERS from constants, dynamic log message

## Decisions Made
- CALIBERS derived from CONTRACT_ADDRESSES.fuji.calibers keys mapped through CALIBER_TO_PRISMA (not from constants directly) -- ensures adding a new market contract auto-includes the caliber
- Gap backfill queries orders with updatedAt > latestLog.createdAt rather than counting rows -- detects actual temporal gaps
- skipDuplicates used for createMany to handle partial backfill restarts safely

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Hardcoded "4 calibers" in stats log message**
- **Found during:** Task 2
- **Issue:** computeStats logged "Computed protocol stats for 4 calibers" -- hardcoded count contradicts config-driven approach
- **Fix:** Changed to template literal using CALIBERS.length
- **Files modified:** apps/worker/src/stats.ts
- **Committed in:** 4bb807c (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Minor consistency fix. No scope creep.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Worker caliber registry is config-driven, ready for future caliber additions
- Gap-aware backfill handles downtime recovery automatically
- Phase 30 Plan 03 can proceed

---
*Phase: 30-architecture-contract-hardening*
*Completed: 2026-02-21*
