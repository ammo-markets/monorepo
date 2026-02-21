---
phase: 28-data-flow-completion
plan: 02
subsystem: ui
tags: [react, typescript, amount-display, shipping, redeem-flow]

# Dependency graph
requires:
  - phase: 28-data-flow-completion
    plan: 01
    provides: Updated OrderFromAPI types with usdcAmount/tokenAmount, BigInt-safe API responses
  - phase: 27-data-model-migration
    provides: usdcAmount/tokenAmount DB fields replacing deleted amount column
provides:
  - Context-aware amount display across all UI components (USDC for mint, rounds for redeem)
  - Shipping address persistence to user profile before redeem confirmation
  - Zero references to deleted amount field in any UI component
affects: [29-admin-api-hardening, 31-tests]

# Tech tracking
tech-stack:
  added: []
  patterns: [type-aware amount formatting (MINT->USDC divide by 1e6, REDEEM->rounds divide by 1e18)]

key-files:
  created: []
  modified:
    - apps/web/features/admin/finalize-mint-dialog.tsx
    - apps/web/features/admin/finalize-redeem-dialog.tsx
    - apps/web/features/admin/mint-orders-table.tsx
    - apps/web/features/admin/redeem-orders-table.tsx
    - apps/web/features/admin/order-detail-drawer.tsx
    - apps/web/features/portfolio/orders-row.tsx
    - apps/web/features/portfolio/order-detail.tsx
    - apps/web/features/dashboard/recent-orders.tsx
    - apps/web/features/market/activity-feed.tsx
    - apps/web/features/redeem/redeem-flow.tsx

key-decisions:
  - "Activity feed amount uses type-aware formatting since worker coalesces usdcAmount for MINT and tokenAmount for REDEEM into ActivityLog.amount"
  - "Shipping persistence uses PATCH /api/users/profile with defaultShipping* fields (no orderId needed at step 1)"
  - "Portfolio/dashboard show USDC for MINT orders and rounds for REDEEM orders instead of raw coalesced value"

patterns-established:
  - "Amount display pattern: MINT orders show (value / 1e6).toFixed(2) USDC, REDEEM orders show Math.floor(value / 1e18).toLocaleString() rounds"
  - "Null amount fallback: show em-dash character when usdcAmount or tokenAmount is null"

# Metrics
duration: 3min
completed: 2026-02-21
---

# Phase 28 Plan 02: UI Amount Display and Shipping Persistence Summary

**Context-aware amount rendering (USDC for mint, rounds for redeem) across all UI components with shipping address persistence to user profile in redeem flow**

## Performance

- **Duration:** 3 min
- **Started:** 2026-02-21T04:29:12Z
- **Completed:** 2026-02-21T04:32:50Z
- **Tasks:** 2
- **Files modified:** 10

## Accomplishments
- Admin components (tables, dialogs, drawer) display usdcAmount for mint and tokenAmount for redeem
- Portfolio, dashboard, and activity feed show type-appropriate amounts instead of raw coalesced values
- Redeem flow step 1 persists shipping address to user profile via PATCH /api/users/profile before advancing
- Zero references to deleted `amount` field remain in any UI component

## Task Commits

Each task was committed atomically:

1. **Task 1: Update admin components to use usdcAmount/tokenAmount** - `19e2ddc` (feat)
2. **Task 2: Update portfolio, dashboard, activity components and wire redeem shipping persistence** - `2233e38` (feat)

## Files Created/Modified
- `apps/web/features/admin/finalize-mint-dialog.tsx` - AdminMintOrder interface updated, displays usdcAmount
- `apps/web/features/admin/finalize-redeem-dialog.tsx` - AdminRedeemOrder interface updated, displays tokenAmount
- `apps/web/features/admin/mint-orders-table.tsx` - Table cell uses order.usdcAmount
- `apps/web/features/admin/redeem-orders-table.tsx` - Table cell uses order.tokenAmount
- `apps/web/features/admin/order-detail-drawer.tsx` - Conditional display per order type
- `apps/web/features/portfolio/orders-row.tsx` - Type-aware display (USDC/rounds) for desktop and mobile
- `apps/web/features/portfolio/order-detail.tsx` - Type-aware display in order detail view
- `apps/web/features/dashboard/recent-orders.tsx` - Type-aware display in dashboard rows and cards
- `apps/web/features/market/activity-feed.tsx` - Type-aware formatting for coalesced amount
- `apps/web/features/redeem/redeem-flow.tsx` - PATCH /api/users/profile for shipping persistence

## Decisions Made
- Activity feed `item.amount` is type-aware: worker stores USDC-wei for MINT and token-wei for REDEEM in ActivityLog.amount, so UI divides by 1e6 or 1e18 respectively
- Shipping persisted to user profile defaultShipping fields since orderId doesn't exist at step 1
- Portfolio/dashboard orders now show context-appropriate units (USDC vs rounds) instead of displaying everything as "rounds"

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Full data flow from normalized DB fields through APIs to UI is complete
- All UI components compile with zero type errors
- Ready for Phase 29 (Admin API Hardening) and Phase 31 (Tests)

---
*Phase: 28-data-flow-completion*
*Completed: 2026-02-21*
