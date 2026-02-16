---
phase: 16-landing-page
plan: 01
subsystem: ui
tags: [react, landing-page, faq, accordion, cta]

requires:
  - phase: 13-app-shell-restructure
    provides: Landing layout with (landing) route group
  - phase: 11-frontend-data-layer-and-quality
    provides: MarketCards, HowItWorks, ProtocolStats components
provides:
  - Landing page with Launch App CTA, caliber specs, and FAQ section
  - FAQ accordion component for protocol questions
affects: []

tech-stack:
  added: []
  patterns:
    - FAQ accordion with useState toggle (no external dependency)
    - CALIBER_SPECS usage in UI for spec display

key-files:
  created:
    - apps/web/features/home/faq.tsx
  modified:
    - apps/web/features/home/hero.tsx
    - apps/web/features/market/market-cards.tsx
    - apps/web/features/home/index.ts
    - apps/web/app/(landing)/page.tsx

key-decisions:
  - "Simple useState accordion for FAQ (no radix/headless UI dependency needed)"
  - "Middot separators between spec items for clean visual separation"

patterns-established:
  - "FAQ data as typed array of {question, answer} objects for easy maintenance"

duration: 2min
completed: 2026-02-16
---

# Phase 16 Plan 01: Landing Page Summary

**Landing page with Launch App CTA, caliber spec cards (grain/case/min order), and 8-item FAQ accordion**

## Performance

- **Duration:** 2 min
- **Started:** 2026-02-16T01:57:19Z
- **Completed:** 2026-02-16T01:59:29Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments

- Hero CTA updated from "Start Minting" (/mint) to "Launch App" (/dashboard)
- Caliber cards enhanced with grain weight, case type, and minimum order specs from CALIBER_SPECS
- FAQ section created with 8 expandable protocol questions covering minting, trading, redemption, fees, and calibers

## Task Commits

Each task was committed atomically:

1. **Task 1: Update Hero CTA and enhance caliber showcase with specs** - `e7a11da` (feat)
2. **Task 2: Create FAQ section and wire into landing page** - `0e81988` (feat)

## Files Created/Modified

- `apps/web/features/home/faq.tsx` - FAQ accordion component with 8 protocol questions
- `apps/web/features/home/hero.tsx` - Updated CTA text and href
- `apps/web/features/market/market-cards.tsx` - Added CALIBER_SPECS import and specs row
- `apps/web/features/home/index.ts` - Added Faq barrel export
- `apps/web/app/(landing)/page.tsx` - Wired Faq between MarketCards and ProtocolStats

## Decisions Made

- Used simple useState accordion for FAQ instead of external library (keeps bundle small, only 8 items)
- Used middot character between spec items for visual separation (grain, case type, min order)
- Landing page section order: Hero, MarketTicker, HowItWorks, MarketCards, Faq, ProtocolStats

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Landing page complete with all planned sections
- Phase 16 is the final phase of v1.3 milestone

## Self-Check: PASSED

All 5 files verified present. Both commit hashes (e7a11da, 0e81988) found in git log.

---

_Phase: 16-landing-page_
_Completed: 2026-02-16_
