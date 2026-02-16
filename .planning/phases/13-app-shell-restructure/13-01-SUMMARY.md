---
phase: 13-app-shell-restructure
plan: 01
subsystem: ui
tags: [nextjs, route-groups, wallet-gate, layout]

# Dependency graph
requires:
  - phase: 07-wallet-integration
    provides: useWallet hook with isConnected/isReconnecting
provides:
  - (landing) route group with Navbar+Footer layout
  - (app) route group with wallet connection gate
  - /dashboard placeholder page
  - Route structure foundation for tab navigation
affects: [13-02-app-navigation, 14-dashboard]

# Tech tracking
tech-stack:
  added: []
  patterns: [route-group-split, wallet-gate-layout, reconnection-grace-period]

key-files:
  created:
    - apps/web/app/(landing)/layout.tsx
    - apps/web/app/(landing)/page.tsx
    - apps/web/app/(app)/layout.tsx
    - apps/web/app/(app)/dashboard/page.tsx
  modified:
    - apps/web/app/(app)/trade/page.tsx (moved)
    - apps/web/app/(app)/portfolio/page.tsx (moved)
    - apps/web/app/(app)/profile/page.tsx (moved)
    - apps/web/app/(app)/market/page.tsx (moved)
    - apps/web/app/(app)/mint/page.tsx (moved)
    - apps/web/app/(app)/redeem/page.tsx (moved)

key-decisions:
  - "Reconnection grace period: show spinner during isReconnecting to prevent flash-redirect on page refresh"
  - "Landing layout wraps children in main.flex-1 so page components don't need wrapper"
  - "App layout renders null (not redirect) synchronously; redirect happens in useEffect"

patterns-established:
  - "Route group split: (landing) for public, (app) for authenticated"
  - "Wallet gate pattern: useEffect redirect with reconnection grace period"

# Metrics
duration: 2min
completed: 2026-02-16
---

# Phase 13 Plan 01: Route Group Split Summary

**Next.js route group split with (landing) public layout and (app) wallet-gated layout using reconnection-aware redirect**

## Performance

- **Duration:** 2 min
- **Started:** 2026-02-16T00:15:24Z
- **Completed:** 2026-02-16T00:17:14Z
- **Tasks:** 1
- **Files modified:** 19

## Accomplishments

- Split app into (landing) and (app) route groups with distinct layouts
- Landing layout provides Navbar + Footer chrome, page only contains content sections
- App layout gates on wallet connection with reconnection grace period (no flash-redirect)
- All existing routes (trade, portfolio, profile, market, mint, redeem) moved to (app) group
- Dashboard placeholder page created at /dashboard
- Admin and API routes left untouched at top level

## Task Commits

Each task was committed atomically:

1. **Task 1: Create route groups and move existing routes** - `29b6ee4` (feat)

## Files Created/Modified

- `apps/web/app/(landing)/layout.tsx` - Public layout with Navbar + Footer wrapper
- `apps/web/app/(landing)/page.tsx` - Landing page (Hero, HowItWorks, MarketTicker, MarketCards, ProtocolStats)
- `apps/web/app/(app)/layout.tsx` - Wallet-gated layout with reconnection handling
- `apps/web/app/(app)/dashboard/page.tsx` - Dashboard placeholder page
- `apps/web/app/(app)/trade/` - Moved from app/trade/
- `apps/web/app/(app)/portfolio/` - Moved from app/portfolio/
- `apps/web/app/(app)/profile/` - Moved from app/profile/
- `apps/web/app/(app)/market/` - Moved from app/market/
- `apps/web/app/(app)/mint/` - Moved from app/mint/
- `apps/web/app/(app)/redeem/` - Moved from app/redeem/

## Decisions Made

- Reconnection grace period: show loading spinner during `isReconnecting` to prevent flash-redirect on page refresh when wagmi re-establishes connection
- Landing layout wraps children in `<main className="flex-1">` so page components render clean content without wrapper divs
- App layout returns `null` synchronously when not connected (not reconnecting); redirect fires in `useEffect` to avoid SSR issues

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Cleared stale .next/types cache**

- **Found during:** Task 1 verification (TypeScript check)
- **Issue:** `.next/types/` had cached type references to old file paths (app/page.tsx, app/trade/, etc.)
- **Fix:** Deleted `.next/` directory before re-running TypeScript check
- **Files modified:** None (build artifact)
- **Verification:** `pnpm --filter @ammo-exchange/web check` passes clean
- **Committed in:** N/A (build cache, not tracked)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Cache clearing is standard after route restructuring. No scope creep.

## Issues Encountered

None beyond the stale cache fix documented above.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Route groups in place, ready for plan 02 to add 4-tab bottom navigation in (app) layout
- Dashboard page exists as placeholder for Phase 14 content
- All existing functionality preserved in new locations

---

_Phase: 13-app-shell-restructure_
_Completed: 2026-02-16_
