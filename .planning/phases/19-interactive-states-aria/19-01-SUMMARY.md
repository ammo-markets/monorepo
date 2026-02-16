---
phase: 19-interactive-states-aria
plan: 01
subsystem: ui
tags: [tailwind, css, hover-states, focus-visible, accessibility]

# Dependency graph
requires:
  - phase: 18-theme-consolidation
    provides: CSS variable design system with custom properties
provides:
  - Tailwind color mappings for all custom CSS variables
  - Global focus-visible outline for raw interactive elements
  - All hover states as declarative Tailwind classes (no JS handlers)
affects: [all-feature-components, future-ui-work]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Conditional hover via className template literals with ternary"
    - "Tailwind custom colors mapped from CSS variables via @theme inline"
    - "Global focus-visible rule for a11y on raw interactive elements"

key-files:
  created: []
  modified:
    - apps/web/app/globals.css
    - apps/web/features/dashboard/quick-actions.tsx
    - apps/web/features/home/hero.tsx
    - apps/web/features/layout/app-nav.tsx
    - apps/web/features/layout/footer.tsx
    - apps/web/features/layout/landing-navbar.tsx
    - apps/web/features/layout/navbar.tsx
    - apps/web/features/market/action-panel.tsx
    - apps/web/features/market/caliber-header.tsx
    - apps/web/features/market/market-cards.tsx
    - apps/web/features/market/market-table.tsx
    - apps/web/features/market/proof-of-reserves.tsx
    - apps/web/features/mint/mint-flow.tsx
    - apps/web/features/portfolio/order-detail.tsx
    - apps/web/features/portfolio/portfolio-dashboard.tsx
    - apps/web/features/redeem/kyc-form.tsx
    - apps/web/features/redeem/redeem-flow.tsx
    - apps/web/features/shared/connect-wallet-cta.tsx
    - apps/web/features/trade/swap-widget.tsx

key-decisions:
  - "Mapped 6 new Tailwind colors from CSS variables (border-hover, border-active, border-default, text-primary, text-secondary, text-muted)"
  - "Used className template literals with ternary for conditional hover states (active vs inactive)"
  - "Kept setShowTooltip onMouseEnter/onMouseLeave handlers as they control functional behavior not styling"
  - "Applied global focus-visible outline to raw interactive elements (button, a, input, select, textarea, role=button, role=tab)"

patterns-established:
  - "Brass primary button: bg-brass text-ax-primary hover:bg-brass-hover"
  - "Ghost/outline button: bg-transparent border border-border-hover text-text-secondary hover:bg-ax-tertiary hover:border-brass-border"
  - "Text link hover: text-brass hover:text-brass-hover"
  - "Conditional active/inactive: template literal className with ternary operator"

# Metrics
duration: ~25min
completed: 2026-02-16
---

# Phase 19 Plan 01: Interactive States & Hover Migration Summary

**Replaced all JS onMouseEnter/onMouseLeave handlers with Tailwind hover: classes across 19 component files and added global focus-visible states**

## Performance

- **Duration:** ~25 min (across two sessions)
- **Tasks:** 2/2
- **Files modified:** 19

## Accomplishments

- Added 6 Tailwind color mappings from CSS variables to enable hover: class usage
- Added global focus-visible CSS rule for keyboard accessibility on all raw interactive elements
- Eliminated 894 lines of inline JS hover handlers across 18 component files
- Established reusable patterns for conditional hover states using className template literals

## Task Commits

Each task was committed atomically:

1. **Task 1: Add Tailwind color mappings and focus-visible utility** - `5e86fa8` (feat)
2. **Task 2: Migrate all onMouseEnter/onMouseLeave to Tailwind hover: classes** - `c8d31f0` (feat)

## Files Created/Modified

- `apps/web/app/globals.css` - Added 6 color mappings to @theme inline + focus-visible rule
- `apps/web/features/dashboard/quick-actions.tsx` - Brass button + ghost button hover
- `apps/web/features/home/hero.tsx` - Primary CTA with shadow + ghost button hover
- `apps/web/features/layout/app-nav.tsx` - Nav links + admin link with border-l hover
- `apps/web/features/layout/footer.tsx` - Text color hover on links
- `apps/web/features/layout/landing-navbar.tsx` - Opacity hover on CTA
- `apps/web/features/layout/navbar.tsx` - Text + bg hover on nav links
- `apps/web/features/market/action-panel.tsx` - Conditional wallet connected/disconnected CTAs
- `apps/web/features/market/caliber-header.tsx` - Brass text hover
- `apps/web/features/market/market-cards.tsx` - Complex hover with transform + shadow
- `apps/web/features/market/market-table.tsx` - Sort headers, table rows, action buttons
- `apps/web/features/market/proof-of-reserves.tsx` - Opacity hover
- `apps/web/features/mint/mint-flow.tsx` - Caliber cards, back buttons, CTA buttons
- `apps/web/features/portfolio/order-detail.tsx` - Brass links, ghost button
- `apps/web/features/portfolio/portfolio-dashboard.tsx` - Holdings rows, order rows, action buttons
- `apps/web/features/redeem/kyc-form.tsx` - Conditional disabled/enabled button
- `apps/web/features/redeem/redeem-flow.tsx` - BackButton, PrimaryButton, GhostButton helpers + caliber cards
- `apps/web/features/shared/connect-wallet-cta.tsx` - CTA buttons
- `apps/web/features/trade/swap-widget.tsx` - Token selector, pills, tabs, direction button, CTAs

## Decisions Made

- Mapped 6 new Tailwind colors from CSS variables to enable `hover:text-text-primary` patterns
- Used className template literals with ternary for conditional hover (active items get no hover, inactive get hover)
- Kept `setShowTooltip` onMouseEnter/onMouseLeave handlers as they control tooltip visibility (functional, not styling)
- Applied global `focus-visible` outline to all raw interactive elements for keyboard a11y

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed duplicate className attribute in market-table.tsx**

- **Found during:** Task 2 (market-table migration)
- **Issue:** Mint button had two `className` attributes from a previous edit
- **Fix:** Removed the first empty className, kept the one with proper classes
- **Files modified:** apps/web/features/market/market-table.tsx
- **Verification:** TypeScript check passes (TS17001 resolved)
- **Committed in:** c8d31f0 (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Minor fix for pre-existing issue. No scope creep.

## Issues Encountered

- CSS specificity: inline `style` has higher specificity than Tailwind classes, requiring conditional base+hover states to all move into className together (not partially)
- Auto-formatter modified files between read and edit operations, requiring re-reads before edits

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- All hover states are now declarative Tailwind classes
- Focus-visible states provide keyboard accessibility
- Ready for Phase 20 (Navigation & Discoverability)

## Self-Check: PASSED

- [x] 19-01-SUMMARY.md exists
- [x] Commit 5e86fa8 (Task 1) exists
- [x] Commit c8d31f0 (Task 2) exists

---

_Phase: 19-interactive-states-aria_
_Completed: 2026-02-16_
