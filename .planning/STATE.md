# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-21)

**Core value:** Anyone worldwide can get price exposure to U.S. ammunition by minting ammo tokens with USDC, while only verified U.S. residents in allowed states can redeem for physical delivery.
**Current focus:** Phase 27 - Data Model Migration (v1.6 Audit Remediation)

## Current Position

Milestone: v1.6 Audit Remediation
Phase: 27 of 31 (Data Model Migration)
Plan: —
Status: Ready to plan
Last activity: 2026-02-21 — Roadmap created for v1.6

Progress: [░░░░░░░░░░] 0% (v1.6)

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
- Total plans completed: 3
- Average duration: ~2 min
- Total execution time: ~6 min

## Accumulated Context

### Decisions

All decisions logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- [v1.6] Composite uniqueness (txHash + logIndex) replaces txHash-only order dedup
- [v1.6] Separate usdcAmount/tokenAmount fields replace single ambiguous amount column
- [v1.6] Contract changes (CNTR-01, CNTR-02) require Fuji redeployment in Phase 30
- [v1.6] Tests (Phase 31) come last since they exercise code from all prior phases

### Pending Todos

None.

### Blockers/Concerns

None.

### Quick Tasks Completed

| # | Description | Date | Commit | Directory |
|---|-------------|------|--------|-----------|
| 1 | Refactor manual fetch mutations to use TanStack Query useMutation hooks | 2026-02-15 | 94bf174 | [1-refactor-manual-fetch-mutations-to-use-t](./quick/1-refactor-manual-fetch-mutations-to-use-t/) |
| 2 | Add Get Test USDC faucet button to dashboard for Fuji testnet | 2026-02-16 | 91292a6 | [2-add-get-test-usdc-faucet-button-to-ui-fo](./quick/2-add-get-test-usdc-faucet-button-to-ui-fo/) |
| 3 | Fix wallet connection UX -- connector selection dialog instead of Phantom auto-open | 2026-02-21 | ef192cd | [3-fix-wallet-connection-ux-switch-to-fuji-](./quick/3-fix-wallet-connection-ux-switch-to-fuji-/) |

## Session Continuity

Last session: 2026-02-21
Stopped at: Created v1.6 Audit Remediation roadmap (Phases 27-31)
Resume file: None
