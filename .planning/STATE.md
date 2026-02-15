# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-15)

**Core value:** Anyone worldwide can get price exposure to U.S. ammunition by minting ammo tokens with USDC, while only verified U.S. residents in allowed states can redeem for physical delivery.
**Current focus:** v1.2 Production Hardening

## Current Position

Phase: Not started (defining requirements)
Plan: —
Status: Defining requirements
Last activity: 2026-02-15 — Milestone v1.2 started

## Performance Metrics

**v1.0 Velocity:**
- Total plans completed: 12
- Average duration: ~9 min
- Total execution time: ~2 hours

**v1.1 Velocity:**
- Total plans completed: 2
- Average duration: ~1.5 min
- Total execution time: ~3 min

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01-foundation | 2 | ~65min | ~33min |
| 02-event-indexer | 2 | ~4min | ~2min |
| 03-wallet-and-api-layer | 2 | ~19min | ~10min |
| 04-mint-and-redeem-flows | 2 | ~11min | ~6min |
| 05-portfolio-and-data-integration | 2 | ~9min | ~5min |
| 06-admin-dashboard | 2 | ~7min | ~4min |
| 07-registration-and-indexing-fixes | 2 | ~3min | ~1.5min |

## Accumulated Context

### Decisions

All v1.0 decisions logged in PROJECT.md Key Decisions table.

**v1.1 Phase 7:**
- Fire-and-forget registration: no await, silent catch -- worker fallback exists (07-01)
- Upsert with empty update for idempotency -- no duplicate records on reconnect (07-01)
- Used BigInt() constructor instead of n-suffix literals in shared config for ES2017 web compat (07-02)
- DEPLOYMENT_BLOCK as floor (not cursor override) preserves existing cursor behavior (07-02)
- Progress logging per batch for backfill visibility (07-02)

### Pending Todos

None.

### Blockers/Concerns

None.

## Session Continuity

Last session: 2026-02-15
Stopped at: Starting v1.2 Production Hardening milestone
Resume file: None
