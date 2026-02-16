---
phase: 21-user-flow-improvements
plan: 01
subsystem: ui
tags: [react, mint-flow, trade-tabs, user-experience, disclosures]

# Dependency graph
requires:
  - phase: 12-trade-page-ui
    provides: MintFlow component and TradeTabs with SwapWidget
provides:
  - Processing time disclosure banner in mint step 2
  - Price disclaimer in mint step 3 review
  - Coming Soon placeholder for swap tab
affects: [swap-feature, mint-flow]

# Tech tracking
tech-stack:
  added: []
  patterns: [amber-border-left disclosure boxes, "Soon" badge on disabled feature tabs]

key-files:
  created: []
  modified:
    - apps/web/features/mint/mint-flow.tsx
    - apps/web/features/trade/trade-tabs.tsx

key-decisions:
  - "Used borderLeft muted color for price disclaimer to differentiate from processing time warning"
  - "Badge text 'Soon' instead of full 'Coming Soon' to keep tab compact"

patterns-established:
  - "Amber left-border info boxes for time-sensitive disclosures"
  - "Muted left-border info boxes for secondary disclaimers"
  - "Feature tab Coming Soon pattern with icon circle, heading, description, and tech note"

# Metrics
duration: 1min
completed: 2026-02-16
---

# Phase 21 Plan 01: Mint Disclosures & Swap Coming Soon Summary

**Added 24-48h processing time banner and admin-price disclaimer to mint flow, replaced swap tab with Coming Soon placeholder**

## Performance

- **Duration:** 1 min
- **Started:** 2026-02-16T07:57:21Z
- **Completed:** 2026-02-16T07:58:33Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- Processing time disclosure (24-48h) shown prominently before user enters mint amount
- Price disclaimer explaining admin-set pricing shown before user confirms mint order
- Swap tab replaced with Coming Soon placeholder explaining future DEX trading functionality
- SwapWidget import removed from trade-tabs (component preserved for future use)

## Task Commits

Each task was committed atomically:

1. **Task 1: Add processing time and price disclaimers to mint flow** - `8607753` (feat)
2. **Task 2: Replace swap tab with Coming Soon placeholder** - `9e3a61f` (feat)

## Files Created/Modified

- `apps/web/features/mint/mint-flow.tsx` - Added processing time banner in StepEnterAmount and price disclaimer in StepReview
- `apps/web/features/trade/trade-tabs.tsx` - Added "Soon" badge to swap tab, replaced SwapWidget with Coming Soon placeholder, removed SwapWidget import

## Decisions Made

- Used `borderLeft: "3px solid var(--text-muted)"` for price disclaimer to visually differentiate it from the amber processing time warning
- Badge shows "Soon" (not "Coming Soon") to keep the tab button compact on small screens
- Included Info icon with flex layout in price disclaimer for consistent iconography

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Mint flow now has proper user disclosures for processing time and pricing
- Swap tab clearly marked as upcoming feature
- Ready for Phase 21 Plan 02

## Self-Check: PASSED

- FOUND: apps/web/features/mint/mint-flow.tsx
- FOUND: apps/web/features/trade/trade-tabs.tsx
- FOUND: commit 8607753 (Task 1)
- FOUND: commit 9e3a61f (Task 2)

---

_Phase: 21-user-flow-improvements_
_Completed: 2026-02-16_
