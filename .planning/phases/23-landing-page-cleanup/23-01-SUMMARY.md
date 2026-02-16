---
phase: 23-landing-page-cleanup
plan: 01
subsystem: ui
tags: [react, tailwind, api, prisma, landing-page, social-proof]

# Dependency graph
requires:
  - phase: 18-theme-accessibility-foundation
    provides: CSS variable system and contrast standards
provides:
  - High-contrast white trust strip with subtle separator
  - Live social proof stats API (totalVolumeRounds, registeredUsers, roundsTokenized)
  - Simplified 3-stat ProtocolStats component with count-up animation
affects: [23-landing-page-cleanup]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "formatCount helper for abbreviated number display with + suffix"
    - "Parallel Prisma queries in API route for social proof aggregation"

key-files:
  created: []
  modified:
    - apps/web/features/home/hero.tsx
    - apps/web/features/home/protocol-stats.tsx
    - apps/web/app/api/stats/route.ts
    - apps/web/hooks/use-protocol-stats.ts

key-decisions:
  - "Used totalVolumeRounds (sum of completed order amounts) instead of USDC volume since Order model lacks usdcAmount field"
  - "Kept formatCompact ($-prefixed) for volume display, formatCount (+-suffixed) for users and rounds"

patterns-established:
  - "formatCount: abbreviated number formatting with + suffix (1.2K+, 10K+) for social proof stats"

# Metrics
duration: 2min
completed: 2026-02-16
---

# Phase 23 Plan 01: Trust Strip Contrast Fix and Social Proof Stats Summary

**White trust strip with separator, 3 live social proof stats (volume, users, rounds) with count-up animation from /api/stats**

## Performance

- **Duration:** 2 min
- **Started:** 2026-02-16T09:21:23Z
- **Completed:** 2026-02-16T09:23:46Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- Trust strip text changed from muted CSS variable to white (#FFFFFF) with subtle rgba separator border
- Stats API extended with 3 new social proof fields via parallel Prisma queries
- ProtocolStats component simplified from 4 stats (2 hooks) to 3 stats (1 hook) with abbreviated formatting

## Task Commits

Each task was committed atomically:

1. **Task 1: Fix trust strip contrast and update API** - `6cc00ee` (feat)
2. **Task 2: Update ProtocolStats to 3 social proof stats** - `d1bf45c` (feat)

## Files Created/Modified
- `apps/web/features/home/hero.tsx` - Trust strip white text, rgba separator border, white dividers
- `apps/web/features/home/protocol-stats.tsx` - 3-stat layout with formatCount helper, removed useMarketData dependency
- `apps/web/app/api/stats/route.ts` - Added totalVolumeRounds, registeredUsers, roundsTokenized to response
- `apps/web/hooks/use-protocol-stats.ts` - Updated ProtocolStatsResponse interface with new fields

## Decisions Made
- Used `totalVolumeRounds` (sum of completed order `amount` field) instead of `totalVolumeUsdc` since the Order model has no `usdcAmount` column. Volume is displayed in round count with $ prefix via formatCompact.
- Kept formatCompact for dollar-style volume display, added formatCount for count-style stats with + suffix.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Adapted totalVolumeUsdc query to totalVolumeRounds**
- **Found during:** Task 1 (Stats API extension)
- **Issue:** Plan specified `prisma.order.aggregate({ _sum: { usdcAmount: true } })` but Order model has no `usdcAmount` field. Only `amount` (String, round count) exists.
- **Fix:** Used `prisma.order.findMany({ where: { status: "COMPLETED" }, select: { amount: true } })` and summed amounts as round-based volume. Renamed field to `totalVolumeRounds` for clarity.
- **Files modified:** apps/web/app/api/stats/route.ts, apps/web/hooks/use-protocol-stats.ts
- **Verification:** TypeScript check passes, API returns correct shape
- **Committed in:** 6cc00ee (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Necessary adaptation due to schema mismatch in plan. No scope creep. Volume stat still functional with round-based data.

## Issues Encountered
None beyond the schema deviation documented above.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Trust strip and social proof stats complete
- Ready for 23-02 plan execution (remaining landing page cleanup tasks)

---
*Phase: 23-landing-page-cleanup*
*Completed: 2026-02-16*
