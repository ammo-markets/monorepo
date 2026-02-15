# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-15)

**Core value:** Anyone worldwide can get price exposure to U.S. ammunition by minting ammo tokens with USDC, while only verified U.S. residents in allowed states can redeem for physical delivery.
**Current focus:** v1.2 Production Hardening -- Phase 11 complete (milestone complete)

## Current Position

Phase: 11 of 11 (Frontend Data Layer & Quality)
Plan: 2 of 2 in current phase (done)
Status: Phase 11 Complete
Last activity: 2026-02-15 -- Completed 11-02 Error boundaries and type cleanup

Progress: [####################] 100% (24/24 plans across all milestones)

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
| Phase 11 P01 | 6min | 2 tasks | 20 files |
| Phase 11 P02 | 5min | 2 tasks | 17 files |

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
- [Phase 11]: Module-level QueryClient with staleTime 30s, retry 2, refetchOnWindowFocus
- [Phase 11]: useMarketData gets 60s staleTime (market data less volatile than default)
- [Phase 11]: Admin finalize dialogs invalidate all ["admin"] queries broadly
- [Phase 11]: Profile page uses inline useQuery (single consumer, no separate hook)
- [Phase 11]: Typed BalanceOfContract interface with Abi cast for wagmi useReadContracts (avoids as-any)
- [Phase 11]: ContractErrorCause interface with 'in' type guard for error cause access
- [Phase 11]: Named ReactNode/Fragment imports replace default React import for type-only usage

### Pending Todos

None.

### Blockers/Concerns

None.

## Session Continuity

Last session: 2026-02-15
Stopped at: Completed 11-02-PLAN.md (Error boundaries & type cleanup -- Phase 11 fully complete)
Resume file: None
