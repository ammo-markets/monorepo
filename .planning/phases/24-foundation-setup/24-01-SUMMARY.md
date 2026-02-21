---
phase: 24-foundation-setup
plan: 01
subsystem: ui
tags: [nextjs, tailwindcss, static-export, pitchdeck, hex-colors]

# Dependency graph
requires: []
provides:
  - "Pitchdeck Next.js 15 app scaffold at apps/pitchdeck"
  - "Hex-only Tailwind v4 theme (no oklch) for PDF export compatibility"
  - "Static export configuration producing out/ directory"
  - "Turborepo integration with out/** build output caching"
affects: [24-02, 24-03, pitch-deck-slides, pdf-export]

# Tech tracking
tech-stack:
  added: [next@15, tailwindcss@4, "@tailwindcss/postcss"]
  patterns: [hex-only-css-theme, static-export, workspace-shared-import]

key-files:
  created:
    - apps/pitchdeck/package.json
    - apps/pitchdeck/next.config.ts
    - apps/pitchdeck/postcss.config.mjs
    - apps/pitchdeck/tsconfig.json
    - apps/pitchdeck/app/globals.css
    - apps/pitchdeck/app/layout.tsx
    - apps/pitchdeck/app/page.tsx
  modified:
    - turbo.json

key-decisions:
  - "Hex-only color palette with --color-*: initial to wipe Tailwind oklch defaults"
  - "Minimal dependency set -- no wagmi, prisma, shadcn, or iron-session"
  - "Used CALIBER_SPECS import from shared to validate workspace transpilation"

patterns-established:
  - "Hex-only theme: Use --color-*: initial first in @theme inline to prevent oklch leakage"
  - "Pitchdeck follows same Next.js/TS patterns as apps/web but stripped to static-only"

# Metrics
duration: 2min
completed: 2026-02-17
---

# Phase 24 Plan 01: Pitchdeck Scaffold Summary

**Next.js 15 pitchdeck app with hex-only Tailwind v4 theme producing static HTML export at apps/pitchdeck**

## Performance

- **Duration:** 2 min
- **Started:** 2026-02-17T02:30:03Z
- **Completed:** 2026-02-17T02:31:56Z
- **Tasks:** 2
- **Files modified:** 9

## Accomplishments

- Scaffolded complete pitchdeck app with package.json, next.config.ts, postcss, tsconfig, layout, page, and globals.css
- Hex-only color palette confirmed zero oklch values in both source CSS and build output
- Static export produces out/index.html -- verified with successful build
- Workspace import of @ammo-exchange/shared (CALIBER_SPECS) works via transpilePackages

## Task Commits

Each task was committed atomically:

1. **Task 1: Scaffold pitchdeck app files with hex-only theme** - `646010c` (feat)
2. **Task 2: Install dependencies and verify build** - `d28a4e2` (chore)

## Files Created/Modified

- `apps/pitchdeck/package.json` - App package with port 3001, shared workspace dep
- `apps/pitchdeck/next.config.ts` - Static export, transpilePackages, extensionAlias
- `apps/pitchdeck/postcss.config.mjs` - Tailwind v4 PostCSS plugin
- `apps/pitchdeck/tsconfig.json` - TypeScript config extending root
- `apps/pitchdeck/app/globals.css` - Hex-only Tailwind v4 theme with brass/dark palette
- `apps/pitchdeck/app/layout.tsx` - Root layout with Inter + JetBrains Mono fonts
- `apps/pitchdeck/app/page.tsx` - Test slide with color validation squares
- `turbo.json` - Added out/\*\* to build outputs

## Decisions Made

- Used `--color-*: initial` as first line in `@theme inline` to wipe all Tailwind oklch defaults
- Minimal dependencies: only next, react, react-dom, shared, and tailwind tooling
- Imported CALIBER_SPECS (not a type) from shared to prove runtime workspace import works

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Pitchdeck app scaffold complete and building successfully
- Ready for slide components, content, and PDF export implementation
- Dev server runs on port 3001 (no conflict with web on 3000)

## Self-Check: PASSED

All 8 key files verified on disk. Both task commits (646010c, d28a4e2) found in git log.

---

_Phase: 24-foundation-setup_
_Completed: 2026-02-17_
