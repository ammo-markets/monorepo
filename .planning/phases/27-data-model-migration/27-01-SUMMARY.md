---
phase: 27-data-model-migration
plan: 01
subsystem: database
tags: [prisma, postgresql, migration, schema, order-model]

requires:
  - phase: none
    provides: existing Order model in Prisma schema
provides:
  - Composite unique constraint (txHash + logIndex) on Order model
  - Separate usdcAmount and tokenAmount nullable columns for raw wei
  - Required logIndex column for on-chain event deduplication
affects: [27-02, worker-handlers, web-order-display]

tech-stack:
  added: []
  patterns: [composite-uniqueness-for-event-dedup, split-amount-fields]

key-files:
  created:
    - packages/db/prisma/migrations/20260221092449_composite_order_uniqueness_and_amounts/migration.sql
  modified:
    - packages/db/prisma/schema.prisma

key-decisions:
  - "Wiped existing 7 testnet orders to allow clean migration (no data preservation needed for Fuji)"
  - "Used manual migration creation (prisma migrate diff + deploy) due to non-interactive environment constraints"

patterns-established:
  - "Composite uniqueness: Order dedup uses (txHash, logIndex) instead of txHash alone"
  - "Split amounts: usdcAmount for USDC wei, tokenAmount for token wei (both nullable)"

duration: 2min
completed: 2026-02-21
---

# Phase 27 Plan 01: Order Schema Migration Summary

**Prisma Order model migrated to composite (txHash, logIndex) uniqueness with split usdcAmount/tokenAmount fields, replacing ambiguous single amount column**

## Performance

- **Duration:** 2 min
- **Started:** 2026-02-21T03:53:45Z
- **Completed:** 2026-02-21T03:55:34Z
- **Tasks:** 1
- **Files modified:** 2

## Accomplishments

- Order model now uses `@@unique([txHash, logIndex])` composite constraint for proper on-chain event deduplication
- Replaced ambiguous `amount` column with `usdcAmount String?` and `tokenAmount String?` for clear denomination tracking
- Added required `logIndex Int` column for log-level uniqueness
- Migration applied to local database, Prisma client regenerated and typechecks pass

## Task Commits

Each task was committed atomically:

1. **Task 1: Migrate Order schema for composite uniqueness and normalized amounts** - `894142f` (feat)

## Files Created/Modified

- `packages/db/prisma/schema.prisma` - Updated Order model with composite uniqueness, split amount fields, logIndex
- `packages/db/prisma/migrations/20260221092449_composite_order_uniqueness_and_amounts/migration.sql` - Migration SQL dropping old amount, adding logIndex/usdcAmount, creating composite unique index

## Decisions Made

- Wiped existing 7 testnet order rows before migration (Fuji testnet data, no preservation needed per plan)
- Used `prisma migrate diff` + manual migration file + `prisma migrate deploy` workflow to bypass non-interactive TTY requirement of `prisma migrate dev`

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Non-interactive environment prevented prisma migrate dev**

- **Found during:** Task 1 (migration application)
- **Issue:** `prisma migrate dev` and `prisma migrate dev --create-only` both failed because Claude Code runs in a non-interactive environment (no TTY)
- **Fix:** Used `prisma migrate diff --from-config-datasource --to-schema` to generate SQL, manually created migration directory/file, then applied with `prisma migrate deploy`
- **Files modified:** migration.sql (created manually instead of via Prisma CLI)
- **Verification:** `prisma migrate deploy` succeeded, `pnpm db:generate` succeeded, typecheck passed
- **Committed in:** 894142f (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Migration result is identical; only the tooling path differed. No scope creep.

## Issues Encountered

- Existing 7 order rows blocked migration due to non-nullable `logIndex` column. Resolved by wiping order data first (acceptable per plan - Fuji testnet).

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Schema is ready for Plan 02 (worker handler updates to populate usdcAmount/tokenAmount/logIndex)
- Note: apps/web and apps/worker still reference the old `order.amount` field -- Plan 02 must update these references

---

_Phase: 27-data-model-migration_
_Completed: 2026-02-21_
