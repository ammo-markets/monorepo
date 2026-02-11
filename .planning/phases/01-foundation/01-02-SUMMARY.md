---
phase: 01-foundation
plan: 02
subsystem: database, shared
tags: [prisma, neon, postgresql, avalanche, fuji, caliber-mapping, block-cursor, viem]

# Dependency graph
requires:
  - phase: 01-foundation plan 01
    provides: Deployed Fuji contract addresses for all calibers, manager, factory, MockUSDC
provides:
  - Per-caliber CONTRACT_ADDRESSES config with real Fuji addresses (manager, factory, usdc, 4 calibers x market+token)
  - Bidirectional PRISMA_TO_CALIBER and CALIBER_TO_PRISMA mapping utilities
  - Order.onChainOrderId field for on-chain order linkage
  - Order.walletAddress field for direct wallet queries
  - BlockCursor model for worker event polling state
  - Prisma migration applied to Neon PostgreSQL
affects: [02-worker, 03-api, 04-frontend, web, worker]

# Tech tracking
tech-stack:
  added: []
  patterns: [per-caliber-address-config, bidirectional-enum-mapping, block-cursor-pattern]

key-files:
  created:
    - packages/db/prisma/migrations/20260211010815_add_onchain_order_and_block_cursor/migration.sql
  modified:
    - packages/shared/src/config/index.ts
    - packages/shared/src/constants/index.ts
    - packages/db/prisma/schema.prisma

key-decisions:
  - "Per-caliber config structure with Record<Caliber, {market, token}> for type-safe address lookups"
  - "Bidirectional caliber mapping (PRISMA_TO_CALIBER/CALIBER_TO_PRISMA) to bridge Prisma naming constraints"
  - "BlockCursor with BigInt lastBlock for correct block number storage (never serialized to JSON)"
  - "walletAddress on Order as nullable String for backward compatibility"

patterns-established:
  - "Per-caliber address config: CONTRACT_ADDRESSES[network].calibers[caliber].market/token"
  - "Bidirectional enum mapping: PRISMA_TO_CALIBER/CALIBER_TO_PRISMA with satisfies for type safety"
  - "Block cursor pattern: one row per contract for polling-based event processing"

# Metrics
duration: ~20min
completed: 2026-02-11
---

# Phase 1 Plan 2: Shared Config and Schema Migration Summary

**Per-caliber Fuji address config with bidirectional caliber mapping, onChainOrderId/walletAddress on Order, and BlockCursor model migrated to Neon PostgreSQL**

## Performance

- **Duration:** ~20 min (across 2 agent sessions + human migration)
- **Started:** 2026-02-11T00:55:00Z
- **Completed:** 2026-02-11T01:15:00Z
- **Tasks:** 3 (2 auto + 1 human-action)
- **Files modified:** 3 (+ 1 migration file created)

## Accomplishments

- Restructured CONTRACT_ADDRESSES from flat layout to per-caliber objects with real deployed Fuji addresses from plan 01-01
- Added PRISMA_TO_CALIBER and CALIBER_TO_PRISMA bidirectional mapping utilities to bridge Prisma enum naming constraints (NINE_MM vs 9MM)
- Added onChainOrderId (String?) and walletAddress (String?) to Order model with indexes for on-chain linkage and direct wallet queries
- Created BlockCursor model with contractAddress (unique), chainId, lastBlock (BigInt) for worker event polling state
- Successfully migrated schema to Neon PostgreSQL

## Task Commits

Each task was committed atomically:

1. **Task 1: Restructure shared config with Fuji addresses and add caliber mapping** - `a0bee0a` (feat)
2. **Task 2: Add onChainOrderId, walletAddress, and BlockCursor to Prisma schema** - `cc852ef` (feat)
3. **Task 3: Run Prisma migration against Neon PostgreSQL** - Human action (migration applied by user)

## Files Created/Modified

- `packages/shared/src/config/index.ts` - Per-caliber CONTRACT_ADDRESSES with real Fuji addresses (manager, factory, usdc, 4 calibers x market+token)
- `packages/shared/src/constants/index.ts` - PRISMA_TO_CALIBER and CALIBER_TO_PRISMA bidirectional mapping
- `packages/db/prisma/schema.prisma` - Order.onChainOrderId, Order.walletAddress, BlockCursor model with indexes
- `packages/db/prisma/migrations/20260211010815_add_onchain_order_and_block_cursor/migration.sql` - Applied migration

## Decisions Made

- **Per-caliber config structure:** `CONTRACT_ADDRESSES[network].calibers[caliber].market/token` enables type-safe address lookups by caliber without string manipulation
- **Bidirectional caliber mapping:** Prisma enums cannot start with digits (e.g., "9MM" is invalid), so PRISMA_TO_CALIBER/CALIBER_TO_PRISMA bridges the two representations with `satisfies` for type safety
- **BlockCursor with BigInt:** lastBlock stored as BigInt since block numbers can exceed JS safe integer range and the value stays in DB/worker (never serialized to JSON via API routes)
- **walletAddress nullable:** Backward compatible -- existing orders without wallet data remain valid; worker populates from event data going forward

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

The user manually ran the Prisma migration against Neon PostgreSQL:
1. `DATABASE_URL` configured in `.env` pointing to Neon connection string
2. `pnpm db:migrate` applied the migration creating Order columns and BlockCursor table
3. Migration verified via Prisma Studio

## Next Phase Readiness

- Shared config ready for import by web and worker packages (`CONTRACT_ADDRESSES.fuji.calibers["9MM"].market`)
- Database schema supports on-chain order tracking and worker cursor state
- Phase 1 (Foundation) is complete -- all contracts deployed, config structured, schema migrated
- Ready for Phase 2 (Worker) to implement event polling using BlockCursor and caliber config

## Self-Check: PASSED

- All 4 source/migration files verified present on disk
- Commits `a0bee0a` and `cc852ef` verified in git history
- SUMMARY.md created at `.planning/phases/01-foundation/01-02-SUMMARY.md`

---
*Phase: 01-foundation*
*Completed: 2026-02-11*
