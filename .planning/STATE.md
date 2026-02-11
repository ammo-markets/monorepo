# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-11)

**Core value:** Anyone worldwide can get price exposure to U.S. ammunition by minting ammo tokens with USDC, while only verified U.S. residents in allowed states can redeem for physical delivery.
**Current focus:** Phase 7 -- Registration and Indexing Fixes

## Current Position

Phase: 7 of 8 (Registration and Indexing Fixes)
Plan: 2 of 2 in current phase
Status: Phase 7 complete
Last activity: 2026-02-11 -- Completed 07-02 (deployment block floor)

Progress: [##############..........] 93% (14/15 plans -- 12 v1.0 + 2 v1.1 complete, 1 v1.1 pending)

## Performance Metrics

**v1.0 Velocity:**
- Total plans completed: 12
- Average duration: ~9 min
- Total execution time: ~2 hours

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
- Used BigInt() constructor instead of n-suffix literals in shared config for ES2017 web compat
- DEPLOYMENT_BLOCK as floor (not cursor override) preserves existing cursor behavior
- Progress logging per batch for backfill visibility

### Pending Todos

None.

### Blockers/Concerns

- ~~Worker currently scans from block 0~~ -- RESOLVED in 07-02 (deployment block floor)
- ~~No user DB record until worker processes an event~~ -- RESOLVED in 07-01 (user registration API)

## Session Continuity

Last session: 2026-02-11
Stopped at: Completed 07-02-PLAN.md (deployment block floor). Phase 7 complete. Phase 8 remaining.
Resume file: None
