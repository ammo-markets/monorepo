# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-15)

**Core value:** Anyone worldwide can get price exposure to U.S. ammunition by minting ammo tokens with USDC, while only verified U.S. residents in allowed states can redeem for physical delivery.
**Current focus:** v1.3 Milestone Complete

## Current Position

Milestone: v1.3 UX Restructure & Data Enrichment — COMPLETE
Phase: 17 (6 of 6 in v1.3) — final phase
Plan: 01 of 01 complete
Status: Milestone Complete
Last activity: 2026-02-16 -- Phase 17 verified, v1.3 shipped

Progress: [██████████] 100% (v1.3)

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

| Phase | Plan | Duration | Tasks | Files |
| ----- | ---- | -------- | ----- | ----- |
| 12    | 01   | 3min     | 2     | 4     |
| 12    | 02   | 3min     | 4     | 8     |
| 13    | 01   | 2min     | 1     | 19    |
| 13    | 02   | 2min     | 2     | 3     |
| 14    | 01   | 2min     | 2     | 6     |
| 15    | 01   | 3min     | 2     | 6     |
| 16    | 01   | 2min     | 2     | 5     |
| 17    | 01   | 4min     | 2     | 4     |

## Accumulated Context

### Decisions

All decisions logged in PROJECT.md Key Decisions table.

- 12-01: ActivityLog has no status field (final-state-only, only completed transactions stored)
- 12-01: String type for amount fields in ProtocolStats (consistent with Order.amount pattern)
- 12-01: UserPreference created on first use, not eagerly for all users
- 12-02: Stats computed from DB only (no on-chain reads)
- 12-02: ActivityLog handler writes use transaction client (tx) for atomicity
- 12-02: Activity endpoint default limit 5, max 50
- 13-01: Reconnection grace period in (app) layout to prevent flash-redirect on page refresh
- 13-01: Landing layout wraps children in main.flex-1; page renders content only
- 13-01: App layout returns null synchronously when disconnected; redirect in useEffect
- 13-02: Single AppNav component renders both sidebar and bottom tabs (CSS-driven responsiveness)
- 13-02: Active link detection uses startsWith for nested route support
- 13-02: Sidebar width 240px (w-60) with matching ml-60 offset on main content
- 14-01: Dashboard components receive data via props (not internal hooks) for testability
- 14-01: Portfolio value includes USDC balance in total calculation
- 14-01: Recent orders limited to 5 with View All link to /portfolio
- 15-01: MintFlow/RedeemFlow rendered as-is in tabs (they have built-in caliber selectors)
- 15-01: Caliber selection synced to URL search params for cross-flow pre-selection
- 15-01: Trade page uses (app) layout group (AppNav shell provided automatically)
- 16-01: Simple useState accordion for FAQ (no external library dependency)
- 16-01: Middot separators between caliber spec items (grain, case type, min order)
- 17-01: isEmbedded detection via searchParams.get('caliber') !== null for embedded vs standalone flow
- 17-01: Hide Back button in MintFlow step 1 when embedded (CaliberInfoPanel above handles re-selection)
- 17-01: RedeemFlow hides caliber grid but keeps step 0 structure when embedded
- 17-01: Renamed "24h Volume" to "Total Volume" (API only provides cumulative data)

### Pending Todos

None.

### Blockers/Concerns

None.

### Quick Tasks Completed

| #   | Description                                                             | Date       | Commit  | Directory                                                                                         |
| --- | ----------------------------------------------------------------------- | ---------- | ------- | ------------------------------------------------------------------------------------------------- |
| 1   | Refactor manual fetch mutations to use TanStack Query useMutation hooks | 2026-02-15 | 94bf174 | [1-refactor-manual-fetch-mutations-to-use-t](./quick/1-refactor-manual-fetch-mutations-to-use-t/) |

## Session Continuity

Last session: 2026-02-16
Stopped at: v1.3 milestone complete — all 6 phases (12-17) shipped
Resume file: None
