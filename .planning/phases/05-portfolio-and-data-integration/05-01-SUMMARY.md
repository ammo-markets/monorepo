---
phase: 05-portfolio-and-data-integration
plan: 01
subsystem: ui
tags: [react, wagmi, viem, portfolio, on-chain-balances, order-history]

# Dependency graph
requires:
  - phase: 03-wallet-and-api-layer
    provides: "useWallet, useTokenBalances hooks, /api/orders, /api/market endpoints"
  - phase: 04-mint-and-redeem-flows
    provides: "Established patterns for real wallet/balance integration in React components"
provides:
  - "Portfolio dashboard wired to real on-chain balances and DB orders"
  - "Order detail page with API-fetched data and 3-step stepper"
  - "Shared frontend types in lib/types.ts (OrderFromAPI, MarketCaliberFromAPI, etc.)"
affects: [05-02, admin-dashboard, market-pages]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "OrderFromAPI type for all order API responses"
    - "MarketCaliberFromAPI type for market price responses"
    - "mapOrderStatus() for DB status -> display status mapping"
    - "3-step stepper pattern for mint/redeem order progress"

key-files:
  created:
    - apps/web/lib/types.ts
  modified:
    - apps/web/features/portfolio/portfolio-dashboard.tsx
    - apps/web/features/portfolio/order-detail.tsx

key-decisions:
  - "Drop P&L columns from holdings table (no historical price data available)"
  - "3-step stepper instead of 5-6 step mock stepper (matches available DB fields)"
  - "Display order ID as first 8 chars of UUID (Prisma IDs are UUIDs, not AMX-format strings)"
  - "Primers section hardcoded to 0 (no real primers data source yet)"
  - "Removed demo variant selector from order detail (was mock-only scaffolding)"

patterns-established:
  - "DisplayStatus type mapping: PENDING/PROCESSING -> Processing, COMPLETED -> Completed, FAILED/CANCELLED -> Failed"
  - "Holdings computed from useTokenBalances + /api/market prices via useMemo"
  - "formatDate() helper for ISO date strings to human-readable format"

# Metrics
duration: 5min
completed: 2026-02-11
---

# Phase 5 Plan 1: Portfolio Data Wiring Summary

**Portfolio dashboard and order detail page wired to real on-chain balances (useTokenBalances), DB orders (/api/orders), and oracle prices (/api/market) with shared types extracted to lib/types.ts**

## Performance

- **Duration:** 5 min
- **Started:** 2026-02-11T04:46:17Z
- **Completed:** 2026-02-11T04:52:07Z
- **Tasks:** 3
- **Files modified:** 3

## Accomplishments

- Extracted 5 reusable frontend types (CaliberDetailData, OrderFromAPI, StepStatus, OrderStep, MarketCaliberFromAPI) to lib/types.ts matching real API shapes
- Portfolio dashboard displays real on-chain token balances, computed portfolio value from oracle prices, and DB-backed order history
- Order detail page fetches from /api/orders/[id] with a simplified 3-step stepper and working Snowtrace links from real txHash
- Zero mock-data imports remain in portfolio feature files

## Task Commits

Each task was committed atomically:

1. **Task 1: Extract shared frontend types to lib/types.ts** - `abd5d11` (feat)
2. **Task 2: Rewire portfolio-dashboard.tsx with real wallet, balance, and order data** - `b3913d2` (feat)
3. **Task 3: Rewire order-detail.tsx with real API data and simplified stepper** - `e4c8c36` (feat)

## Files Created/Modified

- `apps/web/lib/types.ts` - Shared frontend types for API response shapes (CaliberDetailData, OrderFromAPI, StepStatus, OrderStep, MarketCaliberFromAPI)
- `apps/web/features/portfolio/portfolio-dashboard.tsx` - Portfolio dashboard wired to useWallet, useTokenBalances, /api/orders, /api/market
- `apps/web/features/portfolio/order-detail.tsx` - Order detail page fetching from /api/orders/[id] with 3-step stepper

## Decisions Made

- Dropped P&L columns (avgCost, pnl, pnlPercent) from holdings table since no historical price data is available
- Simplified stepper from 5-6 mock steps to 3 real steps: matches what the DB actually tracks (order placed, tx confirmed, completed)
- Display order IDs as first 8 chars of Prisma UUID instead of mock AMX-format strings
- Primers section hardcoded to 0 since no real primers data source exists yet
- Removed demo variant selector from order-detail.tsx (was mock-only scaffolding for previewing different order states)
- Used `as Caliber` cast in order-detail for order.caliber since API response type uses Caliber but component receives it dynamically

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Portfolio pages are fully data-driven, ready for integration testing with live testnet
- lib/types.ts provides reusable types for any future page that consumes /api/orders or /api/market
- Plan 05-02 (market pages and remaining data wiring) can proceed immediately

---

_Phase: 05-portfolio-and-data-integration_
_Completed: 2026-02-11_

## Self-Check: PASSED

- [x] apps/web/lib/types.ts exists
- [x] apps/web/features/portfolio/portfolio-dashboard.tsx exists
- [x] apps/web/features/portfolio/order-detail.tsx exists
- [x] 05-01-SUMMARY.md exists
- [x] Commit abd5d11 (Task 1) verified
- [x] Commit b3913d2 (Task 2) verified
- [x] Commit e4c8c36 (Task 3) verified
- [x] TypeScript check passes (pnpm --filter @ammo-exchange/web check)
- [x] Zero mock-data imports in portfolio directory
