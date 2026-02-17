# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-17)

**Core value:** Anyone worldwide can get price exposure to U.S. ammunition by minting ammo tokens with USDC, while only verified U.S. residents in allowed states can redeem for physical delivery.
**Current focus:** Phase 24 -- Foundation & Setup (v1.5 Pitch Deck)

## Current Position

Milestone: v1.5 Pitch Deck
Phase: 24 of 26 (Foundation & Setup)
Plan: 1 of 1 in current phase
Status: Phase 24 complete
Last activity: 2026-02-17 -- Completed 24-01 pitchdeck scaffold

Progress: [██████████] 100%

## Performance Metrics

**v1.0 Velocity:**
- Total plans completed: 12
- Average duration: ~9 min
- Total execution time: ~2 hours

**v1.1 Velocity:**
- Total plans completed: 2
- Average duration: ~1.5 min
- Total execution time: ~3 min

**v1.2 Velocity:**
- Total plans completed: 10
- Average duration: ~3 min
- Total execution time: ~30 min

**v1.3 Velocity:**
- Total plans completed: 8
- Average duration: ~2.6 min
- Total execution time: ~21 min

**v1.4 Velocity:**
- Total plans completed: 12
- Average duration: ~2 min (estimated)
- Total execution time: ~24 min (estimated)

**v1.5 Velocity:**
- Total plans completed: 1
- Average duration: ~2 min
- Total execution time: ~2 min

## Accumulated Context

### Decisions

All decisions logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- [v1.5] Standalone pitchdeck app at apps/pitchdeck (no DB, wallet, or server deps)
- [v1.5] Hex-only CSS colors to prevent oklch crash in html2canvas PDF export
- [v1.5] Static export (output: "export") -- no API routes, pure client-side
- [v1.5] html2canvas-pro (not html2canvas) for Tailwind v4 CSS compatibility
- [24-01] Hex-only theme uses --color-*: initial to wipe Tailwind oklch defaults
- [24-01] Minimal pitchdeck deps: no wagmi, prisma, shadcn, or iron-session
- [24-01] CALIBER_SPECS import validates workspace transpilation at build time

### Pending Todos

None.

### Blockers/Concerns

None.

### Quick Tasks Completed

| # | Description | Date | Commit | Directory |
|---|-------------|------|--------|-----------|
| 1 | Refactor manual fetch mutations to use TanStack Query useMutation hooks | 2026-02-15 | 94bf174 | [1-refactor-manual-fetch-mutations-to-use-t](./quick/1-refactor-manual-fetch-mutations-to-use-t/) |
| 2 | Add Get Test USDC faucet button to dashboard for Fuji testnet | 2026-02-16 | 91292a6 | [2-add-get-test-usdc-faucet-button-to-ui-fo](./quick/2-add-get-test-usdc-faucet-button-to-ui-fo/) |

## Session Continuity

Last session: 2026-02-17
Stopped at: Completed 24-01-PLAN.md (pitchdeck scaffold)
Resume file: None
