---
phase: 28-data-flow-completion
plan: 01
subsystem: api
tags: [bigint, prisma, typescript, viem, api-routes]

# Dependency graph
requires:
  - phase: 27-data-model-migration
    provides: usdcAmount/tokenAmount fields replacing deleted amount column
provides:
  - BigInt-safe API responses with string-formatted large values
  - Updated OrderFromAPI and MarketCaliberFromAPI TypeScript types
  - Activity API with updatedAt field
affects: [28-02 UI components, frontend data consumption]

# Tech tracking
tech-stack:
  added: []
  patterns: [BigInt accumulation with BigInt() constructor for ES2017 target, string return for large values]

key-files:
  created: []
  modified:
    - apps/web/app/api/stats/route.ts
    - apps/web/app/api/market/route.ts
    - apps/web/app/api/admin/stats/route.ts
    - apps/web/app/api/activity/route.ts
    - apps/web/app/api/orders/[id]/route.ts
    - apps/web/lib/types.ts

key-decisions:
  - "Use BigInt() constructor instead of n suffix for ES2017 tsconfig target compatibility"
  - "Activity updatedAt aliases createdAt since ActivityLog records are created at state change time"
  - "totalSupply returned as clean integer string via BigInt division (not formatUnits)"

patterns-established:
  - "BigInt safety: accumulate with BigInt(), divide with BigInt(), return .toString() -- never Number() for large values"
  - "Nullable amount fields: use coalesce pattern (usdcAmount ?? tokenAmount ?? '0') for display"

# Metrics
duration: 3min
completed: 2026-02-21
---

# Phase 28 Plan 01: API and Type Fixes Summary

**BigInt-safe API responses with string-formatted volumes/supplies and normalized usdcAmount/tokenAmount fields across all routes**

## Performance

- **Duration:** 3 min
- **Started:** 2026-02-21T04:23:54Z
- **Completed:** 2026-02-21T04:27:18Z
- **Tasks:** 2
- **Files modified:** 12

## Accomplishments
- Stats API uses usdcAmount (not deleted amount), returns totalVolumeUsd and roundsTokenized as BigInt-safe strings
- Market and admin stats APIs return totalSupply as string via BigInt division instead of Number truncation
- Activity API returns updatedAt per item (aliased from createdAt)
- Order detail API returns usdcAmount/tokenAmount instead of deleted amount field
- TypeScript types updated: OrderFromAPI, MarketCaliberFromAPI, CaliberDetailData

## Task Commits

Each task was committed atomically:

1. **Task 1: Fix stats, market, and admin stats APIs for BigInt safety** - `3c99a95` (feat)
2. **Task 2: Fix activity API, orders APIs, TypeScript types, and hooks** - `98fa9df` (feat)

## Files Created/Modified
- `apps/web/app/api/stats/route.ts` - BigInt accumulation for volume/rounds, select usdcAmount
- `apps/web/app/api/market/route.ts` - totalSupply as string via BigInt division, removed unused formatUnits
- `apps/web/app/api/admin/stats/route.ts` - totalSupply as string via BigInt division
- `apps/web/app/api/activity/route.ts` - Added updatedAt field (aliased from createdAt)
- `apps/web/app/api/orders/[id]/route.ts` - usdcAmount/tokenAmount instead of amount
- `apps/web/lib/types.ts` - Updated OrderFromAPI, MarketCaliberFromAPI, CaliberDetailData types
- `apps/web/features/dashboard/recent-orders.tsx` - Use usdcAmount/tokenAmount coalesce
- `apps/web/features/market/market-cards.tsx` - Parse string totalSupply for display
- `apps/web/features/market/market-table.tsx` - Parse string totalSupply for sorting and display
- `apps/web/features/market/token-stats.tsx` - Parse string totalSupply for display
- `apps/web/features/portfolio/order-detail.tsx` - Use usdcAmount/tokenAmount coalesce
- `apps/web/features/portfolio/orders-row.tsx` - Use usdcAmount/tokenAmount coalesce

## Decisions Made
- Used `BigInt()` constructor instead of `n` suffix because tsconfig target is ES2017 (BigInt literals require ES2020+)
- Activity `updatedAt` aliases `createdAt` since ActivityLog records completed events -- creation IS the state change time
- Return totalSupply as clean integer string `(supply / BigInt(10) ** BigInt(18)).toString()` rather than formatUnits

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] BigInt literal syntax incompatible with ES2017 target**
- **Found during:** Task 1 (Stats/Market/Admin APIs)
- **Issue:** Used `0n`, `10n ** 18n` BigInt literals which require ES2020+ target; tsconfig has ES2017
- **Fix:** Replaced all BigInt literals with `BigInt()` constructor calls
- **Files modified:** stats/route.ts, market/route.ts, admin/stats/route.ts
- **Verification:** `pnpm --filter @ammo-exchange/web check` passes
- **Committed in:** 3c99a95 (Task 1 commit)

**2. [Rule 3 - Blocking] Downstream UI type errors from type changes**
- **Found during:** Task 2 (TypeScript type updates)
- **Issue:** Changing OrderFromAPI.amount to usdcAmount/tokenAmount and totalSupply to string broke 6 UI components
- **Fix:** Updated UI components to use coalesce pattern for amounts and Number() parse for totalSupply display
- **Files modified:** recent-orders.tsx, market-cards.tsx, market-table.tsx, token-stats.tsx, order-detail.tsx, orders-row.tsx
- **Verification:** `pnpm --filter @ammo-exchange/web check` passes with zero errors
- **Committed in:** 98fa9df (Task 2 commit)

---

**Total deviations:** 2 auto-fixed (1 bug, 1 blocking)
**Impact on plan:** Both auto-fixes necessary for compilation. No scope creep.

## Issues Encountered
None beyond the auto-fixed deviations above.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All API routes return correct normalized fields and BigInt-safe values
- TypeScript types match new API response shapes
- UI components compile and use the new field names (Plan 02 may refine display formatting)

---
*Phase: 28-data-flow-completion*
*Completed: 2026-02-21*
