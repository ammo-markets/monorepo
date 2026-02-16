---
phase: 05-portfolio-and-data-integration
plan: 02
subsystem: ui, api
tags: [next.js, react, fetch, mock-data-removal, api-routes, prisma, viem]

# Dependency graph
requires:
  - phase: 05-01
    provides: CaliberDetailData type in lib/types.ts, portfolio/order pages already rewired
  - phase: 03-02
    provides: /api/market route, /api/orders route, Prisma integration
provides:
  - /api/activity route returning recent completed orders
  - /api/market now includes totalSupply per caliber
  - All 15 frontend files use real data sources (zero mock-data imports)
  - mock-data.ts deleted from codebase
affects: [06-admin-and-polish]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "buildCaliberDetail pattern: construct CaliberDetailData from MarketCaliberFromAPI + CALIBER_SPECS + FEES"
    - "Client-side /api/market fetch pattern: useEffect + fetch + setState in all market/trade/mint/redeem components"

key-files:
  created:
    - apps/web/app/api/activity/route.ts
  modified:
    - apps/web/app/api/market/route.ts
    - apps/web/app/market/[caliber]/page.tsx
    - apps/web/lib/types.ts
    - apps/web/features/market/market-ticker.tsx
    - apps/web/features/market/market-cards.tsx
    - apps/web/features/market/market-table.tsx
    - apps/web/features/market/caliber-header.tsx
    - apps/web/features/market/action-panel.tsx
    - apps/web/features/market/token-stats.tsx
    - apps/web/features/market/price-chart.tsx
    - apps/web/features/market/activity-feed.tsx
    - apps/web/features/trade/swap-widget.tsx
    - apps/web/features/home/protocol-stats.tsx
    - apps/web/features/mint/mint-flow.tsx
    - apps/web/features/redeem/redeem-flow.tsx

key-decisions:
  - "Simplified components to only show data available from real sources (dropped change24h, volume24h, sparklineData, warehouseInventory)"
  - "Price chart shows placeholder with current oracle price instead of fake historical data"
  - "Protocol stats show -- for unique holders and 24h volume (no real data source yet)"
  - "buildCaliberDetail helper duplicated in mint-flow and redeem-flow to avoid cross-feature imports"

patterns-established:
  - "buildCaliberDetail: construct CaliberDetailData from API response + shared constants"
  - "All display components fetch from /api/market or /api/activity, never from static mock objects"

# Metrics
duration: 4min
completed: 2026-02-11
---

# Phase 5 Plan 2: Mock-Data Elimination Summary

**Replaced all 15 mock-data imports with real /api/market and /api/activity fetches, created activity endpoint, and deleted mock-data.ts**

## Performance

- **Duration:** ~4 min
- **Started:** 2026-02-11T04:54:32Z
- **Completed:** 2026-02-11T05:02:39Z
- **Tasks:** 2
- **Files modified:** 17 (14 modified, 1 created, 1 deleted, 1 type update)

## Accomplishments

- Created /api/activity route querying 10 most recent COMPLETED orders from Prisma with caliber mapping
- Updated /api/market to include on-chain totalSupply per caliber (reads AmmoToken.totalSupply)
- Rewired all 13 market/home/trade components to fetch from /api/market instead of mock-data
- Rewired mint-flow.tsx and redeem-flow.tsx to build CaliberDetailData from API + CALIBER_SPECS + FEES
- Deleted mock-data.ts (751 lines removed) -- zero imports remain anywhere in the codebase
- pnpm check and pnpm build both pass with zero errors

## Task Commits

Each task was committed atomically:

1. **Task 1: Create /api/activity route and rewire market/home/trade components** - `74c6a28` (feat)
2. **Task 2: Remove residual mock-data imports from mint/redeem flows and delete mock-data.ts** - `0874974` (feat)

## Files Created/Modified

- `apps/web/app/api/activity/route.ts` - New endpoint: queries recent COMPLETED orders from Prisma
- `apps/web/app/api/market/route.ts` - Added totalSupply per caliber from on-chain AmmoToken reads
- `apps/web/lib/types.ts` - Added totalSupply to MarketCaliberFromAPI interface
- `apps/web/app/market/[caliber]/page.tsx` - Fetches from /api/market, builds CaliberDetailData, loading skeleton
- `apps/web/features/market/market-ticker.tsx` - Fetches from /api/market, shows real prices
- `apps/web/features/market/market-cards.tsx` - Fetches from /api/market, shows price + supply
- `apps/web/features/market/market-table.tsx` - Fetches from /api/market, sortable by price/supply
- `apps/web/features/market/caliber-header.tsx` - Uses CaliberDetailData from lib/types
- `apps/web/features/market/action-panel.tsx` - Uses CaliberDetailData, links to /mint and /redeem
- `apps/web/features/market/token-stats.tsx` - Uses CaliberDetailData, computes market cap
- `apps/web/features/market/price-chart.tsx` - Shows current oracle price with "historical data coming soon"
- `apps/web/features/market/activity-feed.tsx` - Fetches from /api/activity, truncated addresses, relative time
- `apps/web/features/trade/swap-widget.tsx` - Builds token list dynamically from /api/market
- `apps/web/features/home/protocol-stats.tsx` - Computes TVL and rounds from /api/market
- `apps/web/features/mint/mint-flow.tsx` - Builds caliberDetailsMap from /api/market fetch
- `apps/web/features/redeem/redeem-flow.tsx` - Builds caliberDetailsMap from /api/market fetch
- `apps/web/lib/mock-data.ts` - DELETED (751 lines of mock types and data)

## Decisions Made

- Simplified all components to only display data available from real sources. Fields like change24h, volume24h, sparklineData, warehouseInventory, high24h, low24h were dropped since no real data source exists
- Price chart shows "Historical price data coming soon" with current oracle price instead of fabricated chart data
- Protocol stats show "--" for unique holders and 24h volume since no real tracking exists yet
- buildCaliberDetail helper is duplicated in mint-flow and redeem-flow (2 copies) to keep features self-contained rather than adding a shared utility import
- Action panel changed from inline mint/redeem forms to link buttons pointing to /mint and /redeem pages (user balance data not available without wallet context in the market detail page)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- All mock data eliminated from the codebase
- Every frontend component reads from real API routes or on-chain data
- Phase 5 objective (portfolio and data integration) is complete
- Ready for Phase 6 (admin and polish)

## Self-Check: PASSED

- All 16 modified/created files verified present on disk
- mock-data.ts confirmed deleted
- Both task commits (74c6a28, 0874974) verified in git log
- Zero mock-data imports confirmed via grep

---

_Phase: 05-portfolio-and-data-integration_
_Completed: 2026-02-11_
