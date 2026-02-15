---
phase: 12-database-schema-and-stats-worker
plan: 02
subsystem: worker, api
tags: [stats, activity-log, preferences, cron, api-endpoints]

requires:
  - phase: 12-database-schema-and-stats-worker
    plan: 01
    provides: "ProtocolStats, ActivityLog, UserPreference models"
provides:
  - "Stats computation cron job (15-minute interval)"
  - "ActivityLog backfill function for startup"
  - "Public /api/stats endpoint for per-caliber protocol stats"
  - "Public /api/activity endpoint reading from ActivityLog"
  - "Authenticated /api/user/preferences endpoint for favorite calibers"
  - "Ongoing ActivityLog population from mint/redeem handlers"
affects: [13-api-endpoints, 14-dashboard-ui, 15-activity-feed, 16-user-preferences]

tech-stack:
  added: []
  patterns:
    - "Worker cron: setInterval for periodic stats recomputation alongside event polling"
    - "One-time backfill on startup with count-based skip logic"
    - "Non-throwing error handlers in worker (log and continue)"
    - "Transaction-scoped ActivityLog writes in event handlers"

key-files:
  created:
    - "apps/worker/src/stats.ts"
    - "apps/web/app/api/stats/route.ts"
    - "apps/web/app/api/user/preferences/route.ts"
  modified:
    - "apps/worker/src/index.ts"
    - "apps/worker/src/lib/constants.ts"
    - "apps/worker/src/handlers/mint.ts"
    - "apps/worker/src/handlers/redeem.ts"
    - "apps/web/app/api/activity/route.ts"

key-decisions:
  - "Stats computed from DB aggregation only (no on-chain reads)"
  - "ActivityLog writes in handlers use transaction client (tx) for atomicity"
  - "Activity endpoint default limit 5, max 50"

patterns-established:
  - "Non-throwing worker functions: catch, log, return (never crash the process)"
  - "Count-based backfill skip: check count > 0 before backfilling"

duration: 3min
completed: 2026-02-15
---

# Phase 12 Plan 02: Stats Worker & API Endpoints Summary

**Stats cron job computing per-caliber aggregates every 15 minutes with ActivityLog backfill, 3 API endpoints (stats, activity, preferences)**

## Performance

- **Duration:** 3 min
- **Started:** 2026-02-15T16:15:01Z
- **Completed:** 2026-02-15T16:18:27Z
- **Tasks:** 4
- **Files modified:** 8

## Accomplishments
- Created stats.ts with `backfillActivityLog` (one-time startup) and `computeStats` (periodic) functions
- Wired backfill and stats into worker startup with 15-minute cron interval
- Created public /api/stats endpoint returning per-caliber minted/redeemed/netSupply/userCount
- Rewrote /api/activity endpoint to read from ActivityLog table with configurable limit (default 5, max 50)
- Created authenticated /api/user/preferences endpoint with GET/PUT for favorite calibers
- Added ActivityLog writes to mint and redeem handlers on order completion

## Task Commits

Each task was committed atomically:

1. **Task 1: Create stats computation module with backfill and wire into worker cron** - `64932e2` (feat)
2. **Task 2: Create public stats endpoint and update activity endpoint** - `3fac67f` (feat)
3. **Task 3: Create user preferences endpoint** - `e0ec271` (feat)
4. **Task 4: Update worker event handlers to write ActivityLog rows** - `7c34ffb` (feat)

## Files Created/Modified
- `apps/worker/src/stats.ts` - Stats computation and ActivityLog backfill logic
- `apps/worker/src/index.ts` - Wired backfill, computeStats, and stats interval
- `apps/worker/src/lib/constants.ts` - Added STATS_INTERVAL_MS (15 minutes)
- `apps/worker/src/handlers/mint.ts` - ActivityLog write on MintFinalized
- `apps/worker/src/handlers/redeem.ts` - ActivityLog write on RedeemFinalized
- `apps/web/app/api/stats/route.ts` - Public protocol stats endpoint
- `apps/web/app/api/activity/route.ts` - Rewritten to use ActivityLog table
- `apps/web/app/api/user/preferences/route.ts` - Authenticated favorites CRUD

## Decisions Made
- Stats computed from DB only (no on-chain reads) -- aggregate from already-indexed orders
- ActivityLog writes in handlers use the transaction client (tx) not top-level prisma, keeping them atomic with order updates
- Activity endpoint default limit 5, max 50, no status field in response

## Deviations from Plan

None - plan executed exactly as written.

## Next Phase Readiness
- Stats worker is ready to run alongside the event indexer
- All 3 API endpoints are ready for frontend consumption
- /api/stats serves Phase 16 landing page
- /api/activity serves Phase 15 activity feed
- /api/user/preferences serves Phase 16 user preferences UI

## Self-Check: PASSED

- FOUND: apps/worker/src/stats.ts
- FOUND: apps/worker/src/index.ts
- FOUND: apps/worker/src/lib/constants.ts
- FOUND: apps/worker/src/handlers/mint.ts
- FOUND: apps/worker/src/handlers/redeem.ts
- FOUND: apps/web/app/api/stats/route.ts
- FOUND: apps/web/app/api/activity/route.ts
- FOUND: apps/web/app/api/user/preferences/route.ts
- FOUND: commit 64932e2 (Task 1)
- FOUND: commit 3fac67f (Task 2)
- FOUND: commit e0ec271 (Task 3)
- FOUND: commit 7c34ffb (Task 4)

---
*Phase: 12-database-schema-and-stats-worker*
*Completed: 2026-02-15*
