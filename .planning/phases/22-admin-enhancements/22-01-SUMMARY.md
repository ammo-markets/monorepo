---
phase: 22-admin-enhancements
plan: 01
subsystem: ui
tags: [react, wagmi, alert-dialog, admin, contract-hooks]

requires:
  - phase: 14-admin-dashboard
    provides: admin order tables, finalize dialogs, protocol stats
provides:
  - useRefundMint and useCancelRedeem contract hooks
  - RejectMintDialog and CancelRedeemDialog AlertDialog components
  - Inline reject/cancel buttons in admin order tables
  - Separate pending mint/redeem stat cards with brass highlight and navigation
affects: [admin-dashboard]

tech-stack:
  added: []
  patterns:
    - AlertDialog for destructive admin actions with required reason textarea
    - Highlighted clickable stat cards with brass border when count > 0

key-files:
  created:
    - apps/web/hooks/use-refund-mint.ts
    - apps/web/hooks/use-cancel-redeem.ts
    - apps/web/features/admin/reject-mint-dialog.tsx
    - apps/web/features/admin/cancel-redeem-dialog.tsx
  modified:
    - apps/web/features/admin/mint-orders-table.tsx
    - apps/web/features/admin/redeem-orders-table.tsx
    - apps/web/features/admin/protocol-stats.tsx
    - apps/web/app/api/admin/stats/route.ts
    - apps/web/hooks/use-admin-stats.ts
    - apps/web/features/admin/index.ts

key-decisions:
  - "Used reasonCode=1 default for on-chain refundMint/cancelRedeem (ABI requires uint8 reasonCode param)"
  - "Pending stat cards use Link component for client-side navigation to order tables"

patterns-established:
  - "AlertDialog with required reason textarea for destructive admin operations"
  - "Brass border/glow highlight on stat cards when pending count > 0"

duration: 3.5min
completed: 2026-02-16
---

# Phase 22 Plan 01: Admin Reject/Cancel & Dashboard Stats Summary

**Reject/cancel order actions via AlertDialog with required reason, and split pending stat cards with brass highlight navigation**

## Performance

- **Duration:** 3.5 min
- **Started:** 2026-02-16T08:31:24Z
- **Completed:** 2026-02-16T08:34:54Z
- **Tasks:** 2
- **Files modified:** 10

## Accomplishments
- Admin can reject mint orders and cancel redeem orders via on-chain refundMint/cancelRedeem calls
- AlertDialog confirmation with required reason textarea for both destructive actions
- Dashboard shows separate Pending Mints and Pending Redeems stat cards with brass highlight when count > 0
- Highlighted pending stat cards are clickable links navigating to respective order table pages

## Task Commits

Each task was committed atomically:

1. **Task 1: Create refund/cancel hooks and AlertDialog confirmation components** - `7d95bfd` (feat)
2. **Task 2: Add inline reject/cancel buttons to order tables and enrich dashboard stat cards** - `245c6ec` (feat)

## Files Created/Modified
- `apps/web/hooks/use-refund-mint.ts` - Hook wrapping CaliberMarket.refundMint with reasonCode
- `apps/web/hooks/use-cancel-redeem.ts` - Hook wrapping CaliberMarket.cancelRedeem with reasonCode
- `apps/web/features/admin/reject-mint-dialog.tsx` - AlertDialog for rejecting mint orders with reason
- `apps/web/features/admin/cancel-redeem-dialog.tsx` - AlertDialog for cancelling redeem orders with reason
- `apps/web/features/admin/mint-orders-table.tsx` - Added inline Reject button next to Finalize
- `apps/web/features/admin/redeem-orders-table.tsx` - Added inline Cancel button next to Finalize
- `apps/web/features/admin/protocol-stats.tsx` - Split into 5 cards with highlighted pending navigation
- `apps/web/app/api/admin/stats/route.ts` - Split pendingOrders into pendingMints and pendingRedeems
- `apps/web/hooks/use-admin-stats.ts` - Updated StatsData type for separate pending counts
- `apps/web/features/admin/index.ts` - Added exports for new dialog components

## Decisions Made
- Used `reasonCode=1` as default for on-chain refundMint/cancelRedeem calls (ABI requires uint8 reasonCode parameter alongside orderId)
- Pending stat cards use Next.js Link component for client-side navigation to order table pages

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Added missing reasonCode argument to refundMint and cancelRedeem hooks**
- **Found during:** Task 1 (hook creation)
- **Issue:** Plan specified `args: [orderId]` but contract ABI requires `[orderId, reasonCode]` (uint8)
- **Fix:** Added `reasonCode` parameter with default value of 1 to both hooks
- **Files modified:** apps/web/hooks/use-refund-mint.ts, apps/web/hooks/use-cancel-redeem.ts
- **Verification:** `pnpm --filter @ammo-exchange/web check` passes
- **Committed in:** 7d95bfd (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Essential fix for contract call correctness. No scope creep.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Admin reject/cancel flows complete, ready for Phase 22 Plan 02
- All type checks pass

---
*Phase: 22-admin-enhancements*
*Completed: 2026-02-16*
