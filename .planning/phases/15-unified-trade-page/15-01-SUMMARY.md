---
phase: 15-unified-trade-page
plan: 01
subsystem: ui
tags: [react, next.js, trade, mint, redeem, swap, tabs]

requires:
  - phase: 10-mint-flow
    provides: MintFlow component with multi-step wizard
  - phase: 11-redeem-flow
    provides: RedeemFlow component with multi-step wizard
  - phase: 08-swap-widget
    provides: SwapWidget component for token trading

provides:
  - Unified trade page at /trade with CaliberInfoPanel and TradeTabs
  - CaliberInfoPanel component with caliber specs and prices
  - TradeTabs component switching between Mint/Redeem/Swap flows

affects: []

tech-stack:
  added: []
  patterns:
    - "Server component page.tsx wrapping client component in Suspense for useSearchParams"
    - "URL param syncing for caliber pre-selection across embedded flows"

key-files:
  created:
    - apps/web/features/trade/caliber-info-panel.tsx
    - apps/web/features/trade/trade-tabs.tsx
    - apps/web/app/(app)/trade/trade-client.tsx
  modified:
    - apps/web/features/trade/index.ts
    - apps/web/app/(app)/trade/page.tsx

key-decisions:
  - "MintFlow and RedeemFlow rendered as-is (they have built-in caliber selectors); CaliberInfoPanel provides quick reference context"
  - "Caliber selection synced to URL search params so embedded flows can pre-select via useSearchParams"
  - "Trade page lives in (app) layout group, no Navbar/Footer needed (AppNav shell provided by layout)"

patterns-established:
  - "Unified page pattern: info panel + tabbed flows composing existing feature components"

duration: 3min
completed: 2026-02-16
---

# Phase 15 Plan 01: Unified Trade Page Summary

**Unified /trade page with caliber info panel (specs + prices) and Mint/Redeem/Swap tabs composing existing flows**

## Performance

- **Duration:** 3 min
- **Started:** 2026-02-16T01:29:42Z
- **Completed:** 2026-02-16T01:32:24Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments

- CaliberInfoPanel shows all 4 calibers with grain weight, case type, min order, and live price per round
- TradeTabs provides pill-style Mint/Redeem/Swap tab switcher rendering the correct flow for each
- Unified trade page replaces old TradeDemo with full-featured trading interface
- Caliber selection syncs to URL params for cross-component pre-selection

## Task Commits

Each task was committed atomically:

1. **Task 1: Create CaliberInfoPanel and TradeTabs components** - `be8ad41` (feat)
2. **Task 2: Wire unified trade page and remove old demo** - `4acd9e7` (feat)

## Files Created/Modified

- `apps/web/features/trade/caliber-info-panel.tsx` - Caliber card grid with specs, price, and selection state
- `apps/web/features/trade/trade-tabs.tsx` - Tab switcher rendering MintFlow/RedeemFlow/SwapWidget
- `apps/web/features/trade/index.ts` - Updated barrel exports
- `apps/web/app/(app)/trade/trade-client.tsx` - Client component orchestrating caliber state and tab state
- `apps/web/app/(app)/trade/page.tsx` - Server component with metadata wrapping client in Suspense
- `apps/web/app/(app)/trade/trade-demo.tsx` - Deleted (replaced by unified page)

## Decisions Made

- MintFlow and RedeemFlow rendered as-is since they have built-in caliber selectors; CaliberInfoPanel provides quick reference/context at the top
- Caliber selection synced to URL search params so embedded flows can pre-select via their existing useSearchParams logic
- Trade page uses (app) layout group so AppNav shell is provided automatically

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Unified trade page is fully functional at /trade
- Existing /mint and /redeem standalone routes remain operational
- Ready for any future trade-related enhancements

---

_Phase: 15-unified-trade-page_
_Completed: 2026-02-16_
