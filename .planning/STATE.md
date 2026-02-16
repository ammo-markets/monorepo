# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-15)

**Core value:** Anyone worldwide can get price exposure to U.S. ammunition by minting ammo tokens with USDC, while only verified U.S. residents in allowed states can redeem for physical delivery.
**Current focus:** Phase 13 - App Shell Restructure (COMPLETE)

## Current Position

Phase: 13 (2 of 5 in v1.3)
Plan: 02 of 02 complete
Status: Phase Complete
Last activity: 2026-02-16 -- Completed 13-02 (responsive 4-tab navigation)

Progress: [████░░░░░░] 40% (v1.3)

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
|-------|------|----------|-------|-------|
| 12 | 01 | 3min | 2 | 4 |
| 12 | 02 | 3min | 4 | 8 |
| 13 | 01 | 2min | 1 | 19 |
| 13 | 02 | 2min | 2 | 3 |

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

### Pending Todos

None.

### Blockers/Concerns

None.

### Quick Tasks Completed

| # | Description | Date | Commit | Directory |
|---|-------------|------|--------|-----------|
| 1 | Refactor manual fetch mutations to use TanStack Query useMutation hooks | 2026-02-15 | 94bf174 | [1-refactor-manual-fetch-mutations-to-use-t](./quick/1-refactor-manual-fetch-mutations-to-use-t/) |

## Session Continuity

Last session: 2026-02-16
Stopped at: Completed 13-02-PLAN.md -- Phase 13 complete, ready for Phase 14
Resume file: None
