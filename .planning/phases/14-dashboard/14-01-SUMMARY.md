---
phase: 14-dashboard
plan: 01
subsystem: ui
tags: [react, next.js, dashboard, portfolio, wagmi, viem]

requires:
  - phase: 12-database-schema-and-stats-worker
    provides: order and market data API endpoints
  - phase: 13-app-shell-restructure
    provides: app layout with sidebar/bottom nav and (app) route group

provides:
  - Dashboard page at /dashboard with balance cards, recent orders, quick actions, pending banner
  - 4 reusable dashboard feature components in features/dashboard/
affects: [14-dashboard remaining plans, portfolio enhancements]

tech-stack:
  added: []
  patterns:
    [
      feature component with props-driven data,
      shimmer skeleton loading,
      conditional banner rendering,
    ]

key-files:
  created:
    - apps/web/features/dashboard/balance-cards.tsx
    - apps/web/features/dashboard/recent-orders.tsx
    - apps/web/features/dashboard/quick-actions.tsx
    - apps/web/features/dashboard/pending-banner.tsx
    - apps/web/features/dashboard/index.ts
  modified:
    - apps/web/app/(app)/dashboard/page.tsx

key-decisions:
  - "Dashboard components receive data via props (not internal hooks) for testability and reuse"
  - "Portfolio value includes USDC balance in total calculation"
  - "Recent orders display limited to 5 with View All link to /portfolio"

patterns-established:
  - "Dashboard feature components: props-driven with isLoading for skeleton states"
  - "Conditional banner pattern: render null when count is 0"

duration: 2min
completed: 2026-02-16
---

# Phase 14 Plan 01: Dashboard Page Components Summary

**Personal dashboard with 4-caliber balance grid, portfolio value header, recent orders list, quick action buttons, and pending order warning banner**

## Performance

- **Duration:** 2 min
- **Started:** 2026-02-16T00:56:26Z
- **Completed:** 2026-02-16T00:58:42Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments

- Built 4 dashboard feature components with loading skeletons and empty states
- Wired dashboard page to existing hooks (useTokenBalances, useMarketData, useOrders, useWallet)
- Balance cards show all 4 calibers with USD values computed from on-chain balances x market prices
- Pending banner conditionally appears when user has PENDING or PROCESSING orders

## Task Commits

Each task was committed atomically:

1. **Task 1: Create dashboard feature components** - `c17af3c` (feat)
2. **Task 2: Wire dashboard page with hooks and components** - `e8ee519` (feat)

## Files Created/Modified

- `apps/web/features/dashboard/balance-cards.tsx` - 4-caliber balance grid with portfolio value, USDC row, shimmer skeletons
- `apps/web/features/dashboard/recent-orders.tsx` - Last 5 orders with status/type badges, time-ago, desktop table + mobile cards
- `apps/web/features/dashboard/quick-actions.tsx` - Mint and Redeem navigation buttons
- `apps/web/features/dashboard/pending-banner.tsx` - Amber warning banner for pending/processing orders
- `apps/web/features/dashboard/index.ts` - Barrel exports for all 4 components
- `apps/web/app/(app)/dashboard/page.tsx` - Dashboard page wiring all components with hooks

## Decisions Made

- Dashboard components receive data via props rather than calling hooks internally, following separation of concerns and matching portfolio-dashboard.tsx patterns
- Portfolio value total includes USDC balance for a complete picture
- Recent orders capped at 5 entries with "View All Orders" link to /portfolio

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Dashboard page fully functional at /dashboard
- All components follow existing CSS variable patterns (--bg-secondary, --text-primary, --brass, etc.)
- Ready for additional dashboard enhancements or Phase 14 remaining plans

---

_Phase: 14-dashboard_
_Completed: 2026-02-16_
