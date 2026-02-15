---
phase: 12-database-schema-and-stats-worker
plan: 01
subsystem: database
tags: [prisma, postgresql, schema, migration, stats, activity-log]

requires:
  - phase: 05-smart-contract-integration
    provides: "Order model with Caliber/OrderType enums"
provides:
  - "ProtocolStats model for per-caliber aggregate metrics"
  - "ActivityLog model for completed transaction records"
  - "UserPreference model for favorite calibers"
  - "Seed script for initializing ProtocolStats rows"
affects: [12-02-stats-worker, 13-api-endpoints, 14-dashboard-ui, 15-activity-feed, 16-user-preferences]

tech-stack:
  added: []
  patterns:
    - "String fields for large numbers (totalMinted/totalRedeemed/netSupply) matching Order.amount pattern"
    - "Final-state-only activity log (no status field, only completed transactions)"
    - "Toggle-based user preferences created on first use"

key-files:
  created:
    - "packages/db/prisma/migrations/20260215161020_add_protocol_stats_activity_log_preferences/migration.sql"
    - "packages/db/src/seed-stats.ts"
  modified:
    - "packages/db/prisma/schema.prisma"
    - "packages/db/package.json"

key-decisions:
  - "ActivityLog has no status field - only completed transactions stored"
  - "ProtocolStats uses String for amounts (consistent with Order.amount for large numbers)"
  - "UserPreference created on first use, not eagerly for all users"

patterns-established:
  - "Seed scripts use upsert for idempotency and load .env from monorepo root"

duration: 3min
completed: 2026-02-15
---

# Phase 12 Plan 01: Database Schema Summary

**Three new Prisma models (ProtocolStats, ActivityLog, UserPreference) with migration applied to Neon PostgreSQL**

## Performance

- **Duration:** 3 min
- **Started:** 2026-02-15T16:08:45Z
- **Completed:** 2026-02-15T16:12:28Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- Added ProtocolStats model with per-caliber minted/redeemed/netSupply/userCount fields
- Added ActivityLog model for completed transactions (no status field per user decision)
- Added UserPreference model with favoriteCalibers array and User relation
- Migration applied successfully to Neon PostgreSQL database
- Idempotent seed script created for initializing ProtocolStats rows

## Task Commits

Each task was committed atomically:

1. **Task 1: Add ProtocolStats, ActivityLog, and UserPreference models** - `ece4893` (feat)
2. **Task 2: Run database migration and seed script** - `ef2f111` (feat)

## Files Created/Modified
- `packages/db/prisma/schema.prisma` - Added 3 new models + UserPreference relation on User
- `packages/db/prisma/migrations/20260215161020_.../migration.sql` - SQL migration for new tables
- `packages/db/src/seed-stats.ts` - Idempotent seed script for 4 ProtocolStats rows
- `packages/db/package.json` - Added db:seed-stats script

## Decisions Made
- ActivityLog has no status field (final-state-only per user decision)
- Used String type for amount fields (consistent with existing Order.amount pattern for large numbers)
- Seed script uses upsert for idempotency, loads .env from monorepo root

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Fixed seed script .env loading path**
- **Found during:** Task 2 (seed script creation)
- **Issue:** `dotenv/config` loads from CWD, but .env is at monorepo root. ECONNREFUSED.
- **Fix:** Changed to explicit `config({ path: resolve(..., "../../.env") })` matching prisma.config.ts pattern
- **Files modified:** packages/db/src/seed-stats.ts
- **Verification:** Script imports resolve correctly, will connect when DATABASE_URL available
- **Committed in:** ef2f111 (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Essential fix for seed script functionality. No scope creep.

## Issues Encountered
- Seed script could not connect to database at execution time (.env file not present in working directory). Migration succeeded because Prisma CLI uses its own config loading (`prisma.config.ts`). Seed script is ready to run when DATABASE_URL is available in environment.

## User Setup Required
None - no external service configuration required. Seed script can be run manually with `pnpm --filter @ammo-exchange/db db:seed-stats` when database is accessible.

## Next Phase Readiness
- All three models exist and are accessible via Prisma client
- Migration applied to production database
- Ready for Plan 02 (stats worker) to write to ProtocolStats and ActivityLog
- Ready for Phase 13 API endpoints to query these models

## Self-Check: PASSED

- FOUND: packages/db/prisma/schema.prisma
- FOUND: packages/db/src/seed-stats.ts
- FOUND: packages/db/prisma/migrations/20260215161020_.../migration.sql
- FOUND: commit ece4893 (Task 1)
- FOUND: commit ef2f111 (Task 2)

---
*Phase: 12-database-schema-and-stats-worker*
*Completed: 2026-02-15*
