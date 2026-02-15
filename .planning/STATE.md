# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-15)

**Core value:** Anyone worldwide can get price exposure to U.S. ammunition by minting ammo tokens with USDC, while only verified U.S. residents in allowed states can redeem for physical delivery.
**Current focus:** v1.2 Production Hardening -- Phase 9: Authentication and API Hardening

## Current Position

Phase: 9 of 11 (Authentication and API Hardening)
Plan: 1 of 2 in current phase
Status: Executing
Last activity: 2026-02-15 -- Completed 09-01 SIWE auth infrastructure

Progress: [###############░░░░░] 75% (15/20 plans across all milestones)

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
| 09-authentication-and-api-hardening | 1 | ~4min | ~4min |

## Accumulated Context

### Decisions

All v1.0 and v1.1 decisions logged in PROJECT.md Key Decisions table.

**v1.2 Decisions:**
- iron-session v8 with cookies() from next/headers (no request param, App Router pattern)
- Registration moved server-side into /api/auth/verify for atomic auth+registration
- Legacy /api/users/register kept for worker backward compat with serializable isolation

### Pending Todos

None.

### Blockers/Concerns

None.

## Session Continuity

Last session: 2026-02-15
Stopped at: Completed 09-01-PLAN.md (SIWE auth infrastructure)
Resume file: None
