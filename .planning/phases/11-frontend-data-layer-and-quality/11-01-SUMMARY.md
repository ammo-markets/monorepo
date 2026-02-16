---
phase: 11-frontend-data-layer-and-quality
plan: 01
subsystem: ui
tags: [tanstack-query, react, data-fetching, cache-invalidation]

requires:
  - phase: 03-wallet-and-api-layer
    provides: API routes for market, orders, activity, admin stats
  - phase: 06-admin-dashboard
    provides: Admin finalize mint/redeem dialogs
provides:
  - Shared TanStack Query hooks for all data fetching (useMarketData, useOrders, useOrderDetail, useAdminStats, useActivity)
  - QueryClient with retry/staleTime defaults
  - Cache invalidation on admin finalize actions
  - Error state handling replacing silent .catch(() => {})
affects: [11-frontend-data-layer-and-quality]

tech-stack:
  added: []
  patterns:
    [
      TanStack Query hooks for all API data,
      cache invalidation on mutations,
      useMemo for derived data,
    ]

key-files:
  created:
    - apps/web/hooks/use-market-data.ts
    - apps/web/hooks/use-orders.ts
    - apps/web/hooks/use-admin-stats.ts
    - apps/web/hooks/use-activity.ts
  modified:
    - apps/web/app/providers.tsx
    - apps/web/features/market/market-cards.tsx
    - apps/web/features/market/market-table.tsx
    - apps/web/features/market/market-ticker.tsx
    - apps/web/features/market/activity-feed.tsx
    - apps/web/features/home/protocol-stats.tsx
    - apps/web/features/admin/protocol-stats.tsx
    - apps/web/features/portfolio/portfolio-dashboard.tsx
    - apps/web/features/portfolio/order-detail.tsx
    - apps/web/app/market/[caliber]/page.tsx
    - apps/web/features/mint/mint-flow.tsx
    - apps/web/features/redeem/redeem-flow.tsx
    - apps/web/features/trade/swap-widget.tsx
    - apps/web/app/profile/page.tsx
    - apps/web/features/admin/finalize-mint-dialog.tsx
    - apps/web/features/admin/finalize-redeem-dialog.tsx

key-decisions:
  - "Keep module-level QueryClient since it already works with Next.js 15 App Router"
  - "useMarketData gets 60s staleTime (market data changes less frequently than global 30s default)"
  - "Admin finalize dialogs invalidate all ['admin'] queries for broad cache bust"
  - "Profile page uses inline useQuery (not separate hook) since only used in one place"
  - "Clipboard .catch(() => {}) kept -- not data fetching, just preventing clipboard API errors"

patterns-established:
  - "All data fetching through TanStack Query hooks -- no raw useEffect+fetch"
  - "Derived state from query data via useMemo (e.g., caliberDetailsMap, protocol stats)"
  - "Cache invalidation via useQueryClient().invalidateQueries on mutation success"

duration: 6min
completed: 2026-02-15
---

# Phase 11 Plan 01: TanStack Query Migration Summary

**Replaced all useEffect+fetch patterns with TanStack Query hooks across 15 components, with retry/staleTime defaults and admin cache invalidation**

## Performance

- **Duration:** 6 min
- **Started:** 2026-02-15T13:30:53Z
- **Completed:** 2026-02-15T13:36:53Z
- **Tasks:** 2
- **Files modified:** 20

## Accomplishments

- Created 4 shared query hooks (useMarketData, useOrders/useOrderDetail, useAdminStats, useActivity)
- Migrated 15 components from manual useEffect+fetch to query hooks
- Configured QueryClient with staleTime: 30s, retry: 2, refetchOnWindowFocus
- Wired cache invalidation in finalize-mint and finalize-redeem dialogs
- Eliminated all silent error swallowing (.catch(() => {})) from data fetching
- Added error fallback UI to activity feed

## Task Commits

Each task was committed atomically:

1. **Task 1: Create TanStack Query hooks and configure QueryClient** - `296043c` (feat)
2. **Task 2: Migrate all components from useEffect+fetch to query hooks** - `375eb4d` (feat)

## Files Created/Modified

- `apps/web/hooks/use-market-data.ts` - Shared hook for /api/market data
- `apps/web/hooks/use-orders.ts` - useOrders(address) and useOrderDetail(orderId) hooks
- `apps/web/hooks/use-admin-stats.ts` - Hook for /api/admin/stats with StatsData type
- `apps/web/hooks/use-activity.ts` - Hook for /api/activity with ActivityItem type
- `apps/web/app/providers.tsx` - QueryClient configured with defaults
- `apps/web/features/market/market-cards.tsx` - Uses useMarketData()
- `apps/web/features/market/market-table.tsx` - Uses useMarketData()
- `apps/web/features/market/market-ticker.tsx` - Uses useMarketData()
- `apps/web/features/market/activity-feed.tsx` - Uses useActivity() with error UI
- `apps/web/features/home/protocol-stats.tsx` - Derives stats from useMarketData via useMemo
- `apps/web/features/admin/protocol-stats.tsx` - Uses useAdminStats() with refetch
- `apps/web/features/portfolio/portfolio-dashboard.tsx` - Uses useMarketData + useOrders
- `apps/web/features/portfolio/order-detail.tsx` - Uses useOrderDetail
- `apps/web/app/market/[caliber]/page.tsx` - Uses useMarketData + useMemo
- `apps/web/features/mint/mint-flow.tsx` - Uses useMarketData + useMemo
- `apps/web/features/redeem/redeem-flow.tsx` - Uses useMarketData + useMemo
- `apps/web/features/trade/swap-widget.tsx` - Uses useMarketData
- `apps/web/app/profile/page.tsx` - Uses inline useQuery for profile + cache invalidation
- `apps/web/features/admin/finalize-mint-dialog.tsx` - Invalidates ["admin"] on success
- `apps/web/features/admin/finalize-redeem-dialog.tsx` - Invalidates ["admin"] on success

## Decisions Made

- Kept module-level QueryClient creation (works with Next.js 15 App Router SSR)
- useMarketData gets 60s staleTime since market prices change less frequently
- Admin finalize dialogs invalidate all ["admin"] queries broadly to catch stats and orders
- Profile page uses inline useQuery rather than a separate hook (single consumer)
- Clipboard .catch(() => {}) preserved as it prevents benign API errors, not data fetching

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- All data fetching now goes through TanStack Query with automatic retries and error handling
- Ready for Phase 11 Plan 02 (if applicable)

---

_Phase: 11-frontend-data-layer-and-quality_
_Completed: 2026-02-15_
