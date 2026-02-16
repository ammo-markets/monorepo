---
phase: 10-worker-hardening
plan: 01
subsystem: worker
tags: [viem, event-indexer, prisma, avalanche, observability]

# Dependency graph
requires:
  - phase: 02-event-indexer
    provides: "Base indexer with MintStarted, MintFinalized, RedeemRequested, RedeemFinalized handlers"
provides:
  - "MintRefunded and RedeemCanceled handlers for order failure/cancellation tracking"
  - "Lifecycle event handlers (Paused, Unpaused, fee updates) for operational visibility"
  - "Full 9-event indexer covering all CaliberMarket contract events"
affects: [10-worker-hardening]

# Tech tracking
tech-stack:
  added: []
  patterns:
    [
      "log-only handlers for informational events (no DB write)",
      "updateMany for status transitions on non-unique order IDs",
    ]

key-files:
  created:
    - apps/worker/src/handlers/refund.ts
    - apps/worker/src/handlers/lifecycle.ts
  modified:
    - apps/worker/src/indexer.ts

key-decisions:
  - "Lifecycle events are log-only (no DB writes) -- sufficient for testnet observability"
  - "RedeemCanceled sets status to CANCELLED (matching Prisma enum), MintRefunded sets to FAILED"

patterns-established:
  - "Log-only handler pattern: takes EventMeta + typed args, no PrismaTx param, returns void"

# Metrics
duration: 2min
completed: 2026-02-15
---

# Phase 10 Plan 01: Missing Event Handlers Summary

**MintRefunded/RedeemCanceled DB handlers and Paused/Unpaused/fee-update log-only handlers wired into 9-event parallel indexer**

## Performance

- **Duration:** 2 min
- **Started:** 2026-02-15T14:09:15Z
- **Completed:** 2026-02-15T14:11:38Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments

- MintRefunded events now update PENDING MINT orders to FAILED status
- RedeemCanceled events now update PENDING REDEEM orders to CANCELLED status
- Paused, Unpaused, MintFeeUpdated, RedeemFeeUpdated, MinMintUpdated events logged for observability
- Indexer fetches all 9 CaliberMarket event types in parallel (up from 4)

## Task Commits

Each task was committed atomically:

1. **Task 1: Create refund and cancellation event handlers** - `1ae2319` (feat)
2. **Task 2: Create lifecycle event handlers and wire all new events into the indexer** - `bf6e9f3` (feat)

## Files Created/Modified

- `apps/worker/src/handlers/refund.ts` - MintRefunded and RedeemCanceled handlers with DB status updates
- `apps/worker/src/handlers/lifecycle.ts` - Log-only handlers for Paused, Unpaused, and fee update events
- `apps/worker/src/indexer.ts` - Updated to fetch and process all 9 event types

## Decisions Made

- Lifecycle events are log-only (no DB writes) -- sufficient for testnet observability
- RedeemCanceled sets status to CANCELLED, MintRefunded sets to FAILED (matching existing Prisma enum values)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- All 9 CaliberMarket events now handled by the worker
- Ready for remaining worker hardening plans (reconnection, health checks, etc.)

## Self-Check: PASSED

- All 3 files verified on disk
- Commit `1ae2319` verified in git log
- Commit `bf6e9f3` verified in git log

---

_Phase: 10-worker-hardening_
_Completed: 2026-02-15_
