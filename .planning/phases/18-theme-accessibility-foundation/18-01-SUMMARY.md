---
phase: 18-theme-accessibility-foundation
plan: 01
subsystem: ui
tags: [css-variables, wcag, dark-mode, tailwind, design-tokens]

# Dependency graph
requires: []
provides:
  - Unified CSS variable system (single :root block)
  - WCAG AA compliant muted text colors
  - Dark-only mode enforcement without next-themes
affects:
  [19-component-accessibility, 20-form-accessibility, 21-responsive-layout]

# Tech tracking
tech-stack:
  added: []
  removed: [next-themes]
  patterns: [dark-only-enforcement, unified-design-tokens]

key-files:
  created: []
  modified:
    - apps/web/app/globals.css
    - apps/web/components/ui/sonner.tsx
    - apps/web/package.json

key-decisions:
  - "Kept @custom-variant dark line because 15 shadcn components use dark: prefixes"
  - "Upgraded --text-muted to #8585a0 (~5.2:1 contrast) and --muted-foreground to oklch(0.63 0.01 280) (~4.5:1 contrast) for WCAG AA compliance"

patterns-established:
  - "Dark-only: all theme variables in :root, no .dark duplicate, className='dark' on html element"
  - "Design tokens: shadcn oklch colors and Ammo Exchange hex tokens coexist in single :root block with section comments"

# Metrics
duration: 2min
completed: 2026-02-16
---

# Phase 18 Plan 01: Unified CSS Variables Summary

**Consolidated dual CSS variable system into single :root block, upgraded muted text colors to WCAG AA contrast, removed next-themes dependency for dark-only enforcement**

## Performance

- **Duration:** 2 min
- **Started:** 2026-02-16T06:15:20Z
- **Completed:** 2026-02-16T06:18:11Z
- **Tasks:** 2
- **Files modified:** 4 (globals.css, sonner.tsx, package.json, pnpm-lock.yaml)

## Accomplishments

- Unified shadcn oklch colors and Ammo Exchange hex tokens into single :root block with section comments
- Upgraded --text-muted (#55556a -> #8585a0) and --muted-foreground (oklch 0.48 -> 0.63) for WCAG AA compliance
- Removed next-themes dependency and all useTheme references
- Removed dead @apply code in body rule that was overridden by explicit var() values

## Task Commits

Each task was committed atomically:

1. **Task 1: Unify CSS variable system and fix contrast** - `99d5332` (feat)
2. **Task 2: Remove next-themes and enforce dark-only** - `4fff7f4` (feat)

## Files Created/Modified

- `apps/web/app/globals.css` - Unified CSS variable system with WCAG AA contrast
- `apps/web/components/ui/sonner.tsx` - Hardcoded dark theme, removed useTheme
- `apps/web/package.json` - Removed next-themes dependency
- `pnpm-lock.yaml` - Updated lockfile

## Decisions Made

- Kept `@custom-variant dark` line because 15 shadcn UI components use `dark:` prefixes internally
- Upgraded both --text-muted (hex) and --muted-foreground (oklch) since they serve similar purposes in different systems

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Single design token source of truth established for all v1.4 phases
- All subsequent component work can reference unified :root variables
- No blockers for Phase 18 Plan 02

---

_Phase: 18-theme-accessibility-foundation_
_Completed: 2026-02-16_
