# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-15)

**Core value:** Anyone worldwide can get price exposure to U.S. ammunition by minting ammo tokens with USDC, while only verified U.S. residents in allowed states can redeem for physical delivery.
**Current focus:** v1.2 Production Hardening -- Phase 10 in progress

## Current Position

Phase: 10 of 11 (Worker Hardening)
Plan: 2 of 2 in current phase (done)
Status: Phase 10 Complete
Last activity: 2026-02-15 -- Completed 10-02 worker hardening (retry, reorg, env, shutdown)

Progress: [####################] 100% (22/22 plans across all milestones)

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
| 09-authentication-and-api-hardening | 2 | ~7min | ~3.5min |
| Phase 09.1 P01 | 2min | 1 task | 2 files |
| Phase 09.1 P02 | 1min | 2 tasks | 2 files |
| Phase 09.1 P03 | 3min | 3 tasks | 3 files |
| Phase 09.1 P04 | 2min | 2 tasks | 2 files |
| Phase 10 P01 | 2min | 2 tasks | 3 files |
| Phase 10 P02 | 2min | 2 tasks | 5 files |

## Accumulated Context

### Decisions

All v1.0 and v1.1 decisions logged in PROJECT.md Key Decisions table.

**v1.2 Decisions:**
- iron-session v8 with cookies() from next/headers (no request param, App Router pattern)
- Registration moved server-side into /api/auth/verify for atomic auth+registration
- Legacy /api/users/register kept for worker backward compat with serializable isolation
- requireSession/requireKeeper throw Response (use try/catch, not return-check pattern)
- In-memory rate limiter sufficient for testnet; Redis upgrade for production
- Market and activity routes intentionally left public
- [Phase 09.1]: notFound() instead of redirect to hide admin route from non-keepers
- [Phase 09.1]: Keep AdminLayoutGate as client-side fallback for hydration edge cases
- [Phase 09.1]: All 11 new User fields nullable to preserve existing records
- [Phase 09.1]: Extracted profileSelect constant for consistent GET/PATCH response shape
- [Phase 09.1]: Inline US_STATES in kyc-form.tsx to avoid coupling with redeem-flow.tsx
- [Phase 09.1]: Client+server 18+ age validation for defense in depth
- [Phase 10]: Lifecycle events are log-only (no DB writes) -- sufficient for testnet observability
- [Phase 10]: RedeemCanceled sets status to CANCELLED, MintRefunded sets to FAILED
- [Phase 10]: 5-block confirmation window for Avalanche reorg safety (~10s margin)
- [Phase 10]: viem built-in retry transport instead of custom retry wrapper
- [Phase 10]: env validation via side-effect import at top of entry point

### Pending Todos

None.

### Blockers/Concerns

None.

## Session Continuity

Last session: 2026-02-15
Stopped at: Completed 10-02-PLAN.md (worker hardening -- Phase 10 complete)
Resume file: None
