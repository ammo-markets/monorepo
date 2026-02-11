---
phase: 06-admin-dashboard
plan: 01
subsystem: ui
tags: [admin, wagmi, tanstack-query, prisma, next.js, keeper, access-control]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: AmmoManager contract with isKeeper function, contract ABIs
  - phase: 03-wallet-and-api-layer
    provides: WalletButton component, useWallet hook, wagmi config, Prisma API patterns
  - phase: 04-mint-and-redeem-flows
    provides: Order model with PENDING status, shipping address relation
provides:
  - Keeper-gated admin layout with sidebar navigation
  - useKeeperCheck hook for on-chain role verification
  - AdminLayoutGate with three-state access control (loading/connect/denied)
  - GET /api/admin/orders endpoint for pending orders with type filter
  - Mint orders table with USDC amount display and auto-refresh
  - Redeem orders table with KYC badges, shipping info, and auto-refresh
affects: [06-admin-dashboard plan 02, future keeper management features]

# Tech tracking
tech-stack:
  added: []
  patterns: [admin layout gate pattern, TanStack Query for admin data fetching, KYC badge component]

key-files:
  created:
    - apps/web/hooks/use-keeper-check.ts
    - apps/web/features/admin/admin-layout-gate.tsx
    - apps/web/features/admin/admin-sidebar.tsx
    - apps/web/features/admin/mint-orders-table.tsx
    - apps/web/features/admin/redeem-orders-table.tsx
    - apps/web/features/admin/index.ts
    - apps/web/app/admin/layout.tsx
    - apps/web/app/admin/page.tsx
    - apps/web/app/admin/mint-orders/page.tsx
    - apps/web/app/admin/redeem-orders/page.tsx
    - apps/web/app/api/admin/orders/route.ts
  modified: []

key-decisions:
  - "TanStack Query useQuery for admin table data fetching (already available via wagmi's QueryClientProvider)"
  - "30s auto-refresh interval for order tables to keep admin view current"
  - "No server-side auth check on /api/admin/orders (testnet -- UI gate sufficient, contract enforces real security)"
  - "AdminLayoutGate as client component wrapping server layout for three-state access control"

patterns-established:
  - "Admin layout gate pattern: useKeeperCheck -> three states (loading/connect/denied/children)"
  - "Admin sidebar pattern: NAV_ITEMS array with active state via usePathname"
  - "KYC badge pattern: colored status badges (green/yellow/red/gray)"
  - "Admin table pattern: useQuery with loading/error/empty states, auto-refresh"

# Metrics
duration: 3min
completed: 2026-02-11
---

# Phase 6 Plan 1: Admin Dashboard Shell Summary

**Keeper-gated admin area with sidebar navigation, pending mint/redeem order tables using TanStack Query with on-chain isKeeper access control**

## Performance

- **Duration:** 3 min
- **Started:** 2026-02-11T05:34:37Z
- **Completed:** 2026-02-11T05:37:59Z
- **Tasks:** 2
- **Files modified:** 11

## Accomplishments
- useKeeperCheck hook reads isKeeper from AmmoManager contract for client-side role verification
- AdminLayoutGate blocks non-keepers with three clear states: loading spinner, connect wallet prompt, access denied message
- Admin sidebar with amber-highlighted active navigation between dashboard, mint orders, and redeem orders
- GET /api/admin/orders returns pending orders with PRISMA_TO_CALIBER mapping, BigInt serialization, and optional type filter
- Mint orders table displays wallet, USDC amount (raw/1e6), caliber, and relative timestamp
- Redeem orders table displays wallet, token amount (raw/1e18), caliber, KYC status badges, shipping city/state, and timestamp
- Both tables auto-refresh every 30 seconds with proper loading, error, and empty states

## Task Commits

Each task was committed atomically:

1. **Task 1: Admin hooks, layout gate, API route, and sidebar** - `3dce4e0` (feat)
2. **Task 2: Mint orders and redeem orders queue pages** - `1987148` (feat)

## Files Created/Modified
- `apps/web/hooks/use-keeper-check.ts` - Client-side isKeeper on-chain check via useReadContract
- `apps/web/features/admin/admin-layout-gate.tsx` - Three-state gate: loading, not-connected, not-keeper, children
- `apps/web/features/admin/admin-sidebar.tsx` - Sidebar navigation with active state highlighting
- `apps/web/features/admin/mint-orders-table.tsx` - Table rendering pending mint orders with USDC amounts
- `apps/web/features/admin/redeem-orders-table.tsx` - Table rendering pending redeem orders with KYC/shipping
- `apps/web/features/admin/index.ts` - Barrel exports for all admin feature components
- `apps/web/app/admin/layout.tsx` - Admin layout wrapping /admin/* with keeper gate and sidebar
- `apps/web/app/admin/page.tsx` - Placeholder dashboard page
- `apps/web/app/admin/mint-orders/page.tsx` - Mint orders queue page
- `apps/web/app/admin/redeem-orders/page.tsx` - Redeem orders queue page
- `apps/web/app/api/admin/orders/route.ts` - GET endpoint for pending orders with type filter

## Decisions Made
- Used TanStack Query useQuery instead of useEffect+useState since QueryClientProvider is already available via wagmi setup
- Set 30-second auto-refresh interval for order tables to keep admin view current without excessive polling
- No server-side auth on /api/admin/orders -- testnet app where UI gate is sufficient and contract enforces real security
- AdminLayoutGate is a client component wrapping the server layout to enable three-state access control with useKeeperCheck
- Finalize buttons present but disabled (cursor-not-allowed) with "Coming soon" tooltip -- wired in plan 06-02

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Admin area shell complete with keeper gate, sidebar, and read-only order views
- Plan 06-02 will wire Finalize buttons to on-chain finalization hooks and add protocol stats dashboard
- All admin feature components exported via barrel file for easy import

## Self-Check: PASSED

All 11 files verified present. Both task commits (3dce4e0, 1987148) verified in git log.

---
*Phase: 06-admin-dashboard*
*Completed: 2026-02-11*
