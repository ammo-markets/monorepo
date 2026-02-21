---
phase: 27-data-model-migration
plan: 02
subsystem: worker
tags: [prisma, event-handlers, idempotency, composite-key, self-healing]

requires:
  - phase: 27-01
    provides: Composite unique constraint (txHash + logIndex) and split usdcAmount/tokenAmount columns on Order model
provides:
  - Worker handlers using composite (txHash, logIndex) upsert for idempotent order creation
  - Self-healing finalization handlers that create orders if no pending order exists
  - All worker-side amount references migrated from deleted amount column to usdcAmount/tokenAmount
affects: [28-web-migration, worker-deployment]

tech-stack:
  added: []
  patterns:
    [
      composite-upsert-idempotency,
      self-healing-finalization,
      coalesce-amount-fallback,
    ]

key-files:
  created: []
  modified:
    - apps/worker/src/handlers/mint.ts
    - apps/worker/src/handlers/redeem.ts
    - apps/worker/src/stats.ts

key-decisions:
  - "Self-healing finalization creates with tokenAmount only (usdcAmount unavailable from finalization event args)"
  - "ActivityLog amount uses coalesce pattern: usdcAmount ?? tokenAmount ?? '0'"
  - "RedeemFinalized updates tokenAmount to final burnedTokens value (may differ from initial request amount)"

patterns-established:
  - "Composite upsert: all order-creating handlers use txHash_logIndex compound unique for idempotency"
  - "Self-healing: finalization handlers create orders when no pending order found (count === 0)"
  - "Amount coalesce: ActivityLog and stats use usdcAmount ?? tokenAmount ?? '0' for backward compatibility"

duration: 2min
completed: 2026-02-21
---

# Phase 27 Plan 02: Worker Handler Migration Summary

**Worker event handlers migrated to composite (txHash, logIndex) upsert with split usdcAmount/tokenAmount fields and self-healing finalization**

## Performance

- **Duration:** 2 min
- **Started:** 2026-02-21T03:57:20Z
- **Completed:** 2026-02-21T03:59:19Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments

- MintStarted and RedeemRequested handlers use composite (txHash, logIndex) upsert, populating usdcAmount and tokenAmount respectively
- MintFinalized and RedeemFinalized handlers gain self-healing: create order from finalization event if no pending order found
- All worker-side references to deleted `amount` column replaced with `usdcAmount`/`tokenAmount` across handlers and stats.ts
- Entire worker package typechecks cleanly against the new schema

## Task Commits

Each task was committed atomically:

1. **Task 1: Update initiation handlers for composite key upsert and normalized amounts** - `ae7f96a` (feat)
2. **Task 2: Update refund handlers, stats.ts, and fix remaining amount references** - `d043957` (fix)

## Files Created/Modified

- `apps/worker/src/handlers/mint.ts` - Composite upsert in MintStarted, self-healing in MintFinalized, ActivityLog uses usdcAmount/tokenAmount
- `apps/worker/src/handlers/redeem.ts` - Composite upsert in RedeemRequested, self-healing in RedeemFinalized, ActivityLog uses usdcAmount/tokenAmount
- `apps/worker/src/stats.ts` - backfillActivityLog and computeStats select usdcAmount/tokenAmount instead of deleted amount column

## Decisions Made

- Self-healing finalization creates orders with tokenAmount only since usdcAmount is not available from MintFinalized/RedeemFinalized event args (partial data is better than no data)
- ActivityLog amount field uses coalesce pattern `usdcAmount ?? tokenAmount ?? "0"` for consistent fallback
- RedeemFinalized sets tokenAmount to args.burnedTokens (final burned amount, which may differ from initial request)
- Refund handlers and indexer.ts required no changes (no amount references, logIndex already passed)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Worker handlers fully migrated to new schema; ready for deployment
- apps/web still references old `order.amount` field -- Phase 28 must update those references
- No blockers for Phase 28 (web migration)

---

_Phase: 27-data-model-migration_
_Completed: 2026-02-21_
