---
phase: 06-admin-dashboard
plan: 02
subsystem: ui
tags: [admin, wagmi, finalization, keeper, protocol-stats, sonner, viem, prisma]

# Dependency graph
requires:
  - phase: 06-admin-dashboard
    provides: Admin layout gate, order tables with disabled Finalize buttons, /api/admin/orders endpoint
  - phase: 01-foundation
    provides: CaliberMarket contract with finalizeMint/finalizeRedeem, AmmoManager with treasury/isKeeper
  - phase: 04-mint-and-redeem-flows
    provides: useWriteContract + useWaitForTransactionReceipt pattern, parseContractError
provides:
  - useFinalizeMint and useFinalizeRedeem hooks for keeper on-chain calls
  - FinalizeMintDialog with price input and X18 conversion via parseUnits
  - FinalizeRedeemDialog with one-click confirmation
  - Working Finalize buttons in mint/redeem order tables
  - GET /api/admin/stats endpoint reading treasury USDC, per-caliber supply, and order counts
  - ProtocolStats dashboard with summary cards and per-caliber supply table
affects: [future keeper management features, protocol monitoring]

# Tech tracking
tech-stack:
  added: []
  patterns:
    [
      finalize dialog pattern with price conversion,
      protocol stats API combining chain reads and DB queries,
    ]

key-files:
  created:
    - apps/web/hooks/use-finalize-mint.ts
    - apps/web/hooks/use-finalize-redeem.ts
    - apps/web/features/admin/finalize-mint-dialog.tsx
    - apps/web/features/admin/finalize-redeem-dialog.tsx
    - apps/web/features/admin/protocol-stats.tsx
    - apps/web/app/api/admin/stats/route.ts
  modified:
    - apps/web/features/admin/mint-orders-table.tsx
    - apps/web/features/admin/redeem-orders-table.tsx
    - apps/web/features/admin/index.ts
    - apps/web/app/admin/page.tsx
    - apps/web/app/layout.tsx

key-decisions:
  - "Sonner Toaster added directly to root layout with theme='dark' (no ThemeProvider needed for dark-only app)"
  - "Finalize buttons disabled when onChainOrderId is null (orders without on-chain IDs cannot be finalized)"
  - "Price input uses parseUnits(price, 18) for X18 conversion (human-readable USD to contract format)"
  - "Stats API combines chain reads (treasury balance, token supply) with DB queries (order counts) in single endpoint"
  - "Refetch-based optimistic update: after finalization, trigger immediate refetch instead of manual cache manipulation"

patterns-established:
  - "Finalize dialog pattern: modal overlay with order details, hook state watching via useEffect, toast notifications"
  - "Stats API pattern: readContract + Promise.all for multi-contract reads, Prisma count queries for order stats"

# Metrics
duration: 4min
completed: 2026-02-11
---

# Phase 6 Plan 2: Admin Finalization and Stats Summary

**Keeper finalizeMint/finalizeRedeem flows with confirmation dialogs, price X18 conversion, and protocol stats dashboard showing treasury balance and per-caliber token supply**

## Performance

- **Duration:** 4 min
- **Started:** 2026-02-11T05:41:10Z
- **Completed:** 2026-02-11T05:46:04Z
- **Tasks:** 2
- **Files modified:** 11

## Accomplishments

- useFinalizeMint and useFinalizeRedeem hooks with explicit return types (TS2742 prevention)
- FinalizeMintDialog accepts human-readable USD price (e.g., 0.35) and converts to X18 via parseUnits
- FinalizeRedeemDialog provides one-click confirmation with order details display
- Finalize buttons enabled in both order tables when onChainOrderId exists
- GET /api/admin/stats reads treasury USDC balance and per-caliber token totalSupply from chain
- ProtocolStats shows 4 summary cards (treasury, pending, minted, redeemed) and per-caliber supply table
- Admin dashboard page replaced placeholder with real protocol stats

## Task Commits

Each task was committed atomically:

1. **Task 1: Finalize hooks, dialogs, and wire into order tables** - `309855d` (feat)
2. **Task 2: Protocol stats API and admin dashboard page** - `aa1909e` (feat)

## Files Created/Modified

- `apps/web/hooks/use-finalize-mint.ts` - useWriteContract hook for CaliberMarket.finalizeMint
- `apps/web/hooks/use-finalize-redeem.ts` - useWriteContract hook for CaliberMarket.finalizeRedeem
- `apps/web/features/admin/finalize-mint-dialog.tsx` - Confirmation dialog with price input for finalizeMint
- `apps/web/features/admin/finalize-redeem-dialog.tsx` - Confirmation dialog for finalizeRedeem
- `apps/web/features/admin/mint-orders-table.tsx` - Wired Finalize button to dialog with selectedOrder state
- `apps/web/features/admin/redeem-orders-table.tsx` - Wired Finalize button to dialog with selectedOrder state
- `apps/web/features/admin/protocol-stats.tsx` - Stats dashboard with summary cards and caliber supply table
- `apps/web/features/admin/index.ts` - Added exports for new dialog and stats components
- `apps/web/app/api/admin/stats/route.ts` - GET endpoint combining chain reads and DB queries
- `apps/web/app/admin/page.tsx` - Updated with ProtocolStats component
- `apps/web/app/layout.tsx` - Added Sonner Toaster for toast notifications

## Decisions Made

- Sonner Toaster added directly to root layout with `theme="dark"` since the app is dark-only (no ThemeProvider setup needed)
- Finalize buttons disabled when `onChainOrderId` is null since orders without on-chain IDs cannot be finalized on-chain
- Price input uses `parseUnits(price, 18)` from viem for accurate X18 conversion (e.g., "0.35" -> 350000000000000000n)
- Stats API combines chain reads (treasury USDC balance, token totalSupply) with Prisma count queries in a single endpoint
- Used refetch-based optimistic update after finalization instead of manual TanStack Query cache manipulation

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added Sonner Toaster to root layout**

- **Found during:** Task 1 (Finalize dialogs)
- **Issue:** Toast notifications (toast.success, toast.error) would not render without the Toaster component mounted in the React tree
- **Fix:** Added `<Toaster theme="dark" />` to root layout.tsx, imported directly from sonner
- **Files modified:** apps/web/app/layout.tsx
- **Verification:** TypeScript check passes, build succeeds
- **Committed in:** 309855d (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Essential for toast notifications to work. No scope creep.

## Issues Encountered

None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Admin dashboard is fully operational with finalization flows and protocol stats
- Phase 6 (Admin Dashboard) is complete -- all plans executed
- The entire v1.0 milestone roadmap is complete

## Self-Check: PASSED

All 11 files verified present. Both task commits (309855d, aa1909e) verified in git log.
