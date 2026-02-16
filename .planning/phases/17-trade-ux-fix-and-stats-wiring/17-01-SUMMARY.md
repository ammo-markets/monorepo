---
phase: 17-trade-ux-fix-and-stats-wiring
plan: 01
subsystem: ui
tags: [react, next.js, tanstack-query, url-params, ux]

requires:
  - phase: 15-trade-page
    provides: Trade page with CaliberInfoPanel, MintFlow/RedeemFlow tabs, URL param sync
  - phase: 12-database-schema-and-stats-worker
    provides: /api/stats endpoint with ProtocolStats DB data

provides:
  - MintFlow that skips caliber selection step when embedded via ?caliber= URL param
  - RedeemFlow that hides caliber card grid when embedded via ?caliber= URL param
  - useProtocolStats TanStack Query hook for /api/stats endpoint
  - ProtocolStats component with real unique holders and total volume data

affects: [trade-page, landing-page, protocol-stats]

tech-stack:
  added: []
  patterns:
    - "isEmbedded pattern: detect Trade page embedding via URL param presence"
    - "Conditional step rendering: guard step 0 with !isEmbedded"

key-files:
  created:
    - apps/web/hooks/use-protocol-stats.ts
  modified:
    - apps/web/features/mint/mint-flow.tsx
    - apps/web/features/redeem/redeem-flow.tsx
    - apps/web/features/home/protocol-stats.tsx

key-decisions:
  - "isEmbedded detection via searchParams.get('caliber') !== null -- no props change needed"
  - "Hide Back button in MintFlow step 1 when embedded (user re-selects via CaliberInfoPanel above)"
  - "RedeemFlow keeps step 0 but hides caliber grid and shows 'Enter Amount' heading when embedded"
  - "Renamed '24h Volume' to 'Total Volume' since API only provides cumulative totalMinted data"

patterns-established:
  - "isEmbedded: URL param presence detection for embedded vs standalone flow behavior"

duration: 4min
completed: 2026-02-16
---

# Phase 17 Plan 01: Trade UX Fix and Stats Wiring Summary

**MintFlow/RedeemFlow skip duplicate caliber selection when embedded in Trade page, ProtocolStats wired to /api/stats for real holder and volume data**

## Performance

- **Duration:** 4 min
- **Started:** 2026-02-16T03:01:09Z
- **Completed:** 2026-02-16T03:05:06Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- MintFlow skips step 0 (caliber selection) when ?caliber= URL param is set from Trade page CaliberInfoPanel
- RedeemFlow hides caliber card grid when embedded, shows streamlined "Enter Amount" heading
- useProtocolStats hook created following existing useMarketData pattern
- ProtocolStats now shows real unique holders count and total volume from /api/stats DB data

## Task Commits

Each task was committed atomically:

1. **Task 1: Make MintFlow and RedeemFlow skip caliber selection when URL param is present** - `cc5da5b` (feat)
2. **Task 2: Wire ProtocolStats to /api/stats endpoint with TanStack Query hook** - `8d484dd` (feat)

## Files Created/Modified
- `apps/web/hooks/use-protocol-stats.ts` - TanStack Query hook for /api/stats with 1min stale time
- `apps/web/features/mint/mint-flow.tsx` - isEmbedded guard on step 0, hideBack prop on StepEnterAmount, embedded-aware handleMintMore
- `apps/web/features/redeem/redeem-flow.tsx` - isEmbedded prop on StepSelectCaliberAmount to hide caliber cards, embedded-aware handleRedeemMore
- `apps/web/features/home/protocol-stats.tsx` - Wired to useProtocolStats for unique holders and total volume

## Decisions Made
- isEmbedded detection via `searchParams.get('caliber') !== null` keeps it internal -- no exported API changes
- Hide Back button entirely in MintFlow when embedded (user can re-select caliber via CaliberInfoPanel above)
- RedeemFlow keeps step 0 structure but conditionally hides caliber grid and changes heading when embedded
- Renamed "24h Volume" to "Total Volume" since /api/stats only provides cumulative totalMinted (not 24h windowed)
- handleMintMore/handleRedeemMore preserve preselected caliber in embedded mode instead of resetting to null

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Trade page UX is clean: single caliber selection via CaliberInfoPanel
- Landing page ProtocolStats shows real data from worker-computed stats
- No blockers for future phases

---
*Phase: 17-trade-ux-fix-and-stats-wiring*
*Completed: 2026-02-16*
