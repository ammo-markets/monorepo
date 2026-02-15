---
phase: 09-authentication-and-api-hardening
plan: 02
subsystem: api
tags: [route-protection, cors, rate-limiting, session-auth, middleware, authorization]

# Dependency graph
requires:
  - phase: 09-authentication-and-api-hardening
    plan: 01
    provides: "requireSession, requireKeeper auth helpers with iron-session cookies"
  - phase: 03-wallet-and-api-layer
    provides: "API route handlers for orders, balances, kyc, admin"
provides:
  - "Session-authenticated user API routes (orders, balances, kyc, shipping)"
  - "Keeper-authenticated admin API routes (admin/orders, admin/stats)"
  - "Order ownership verification on orders/[id] and shipping endpoints"
  - "KYC auto-approve production gate (AUTH-04)"
  - "CORS middleware rejecting unknown origins (API-02)"
  - "In-memory rate limiting at 100 req/min per IP (API-01)"
affects: [frontend-api-calls, deployment-config]

# Tech tracking
tech-stack:
  added: []
  patterns: [try-catch-thrown-response, cors-origin-whitelist, in-memory-rate-limiter]

key-files:
  created:
    - apps/web/middleware.ts
  modified:
    - apps/web/app/api/orders/route.ts
    - apps/web/app/api/orders/[id]/route.ts
    - apps/web/app/api/balances/route.ts
    - apps/web/app/api/redeem/shipping/route.ts
    - apps/web/app/api/users/kyc/route.ts
    - apps/web/app/api/admin/orders/route.ts
    - apps/web/app/api/admin/stats/route.ts

key-decisions:
  - "Used try/catch pattern for requireSession/requireKeeper since they throw Response objects"
  - "In-memory rate limiter sufficient for testnet; document Redis upgrade path for production"
  - "Market and activity routes remain public (no auth required)"

patterns-established:
  - "Auth pattern: try { await requireSession() } catch (e) { if (e instanceof Response) return e; throw e; }"
  - "Ownership check: compare order.walletAddress to session.address (lowercased)"
  - "CORS: whitelist via ALLOWED_ORIGINS env var, block only when Origin header present but not allowed"

# Metrics
duration: 3min
completed: 2026-02-15
---

# Phase 9 Plan 02: Route Protection and API Hardening Summary

**Session auth on all user routes, keeper auth on admin routes, CORS origin whitelist, and 100 req/min rate limiting middleware**

## Performance

- **Duration:** 3 min
- **Started:** 2026-02-15T09:30:05Z
- **Completed:** 2026-02-15T09:33:04Z
- **Tasks:** 2
- **Files modified:** 8

## Accomplishments
- Protected 6 user-facing API routes with requireSession (orders, orders/[id], balances, shipping, kyc GET+POST)
- Protected 2 admin API routes with requireKeeper (admin/orders, admin/stats)
- Added ownership verification on orders/[id] and shipping endpoints (AUTH-05)
- Gated KYC auto-approve to non-production environments (AUTH-04)
- Created Next.js middleware with CORS origin whitelist and in-memory rate limiting
- Removed wallet query params from protected routes (identity now comes from session)

## Task Commits

Each task was committed atomically:

1. **Task 1: Protect all API routes with session/keeper authentication** - `68cb275` (feat)
2. **Task 2: Add Next.js middleware for CORS and rate limiting** - `cfe7463` (feat)

## Files Created/Modified
- `apps/web/middleware.ts` - CORS origin validation, rate limiting (100/min/IP), preflight handling
- `apps/web/app/api/orders/route.ts` - Session auth, wallet param removed, uses session.address
- `apps/web/app/api/orders/[id]/route.ts` - Session auth + ownership check (403 on mismatch)
- `apps/web/app/api/balances/route.ts` - Session auth, wallet param removed
- `apps/web/app/api/redeem/shipping/route.ts` - Session auth + order ownership check ("Not your order")
- `apps/web/app/api/users/kyc/route.ts` - Session auth, POST gated to non-production
- `apps/web/app/api/admin/orders/route.ts` - Keeper auth (401/403)
- `apps/web/app/api/admin/stats/route.ts` - Keeper auth (401/403)

## Decisions Made
- Used try/catch pattern since requireSession/requireKeeper throw Response objects (not return)
- In-memory Map rate limiter is per-instance on Vercel serverless; documented Redis as production upgrade
- Market and activity routes intentionally left public (read-only, no user data)
- CORS allows requests with no Origin header (server-to-server, curl) but blocks unknown origins

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed NextRequest.ip type error**
- **Found during:** Task 2 (middleware creation)
- **Issue:** `request.ip` property not in NextRequest types for Next.js 15 (available at runtime on Vercel but not typed)
- **Fix:** Cast to extended type `(request as NextRequest & { ip?: string }).ip`
- **Files modified:** apps/web/middleware.ts
- **Verification:** TypeScript check passes
- **Committed in:** cfe7463

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Minor type fix, no scope change.

## Issues Encountered

None.

## User Setup Required

Environment variable for CORS (optional, defaults to localhost):
- `ALLOWED_ORIGINS` - Comma-separated list of allowed origins (e.g., `https://ammo.exchange,http://localhost:3000`)

## Next Phase Readiness
- All API routes are now protected with appropriate auth levels
- CORS and rate limiting middleware active on all /api/* routes
- Phase 09 (Authentication and API Hardening) is complete
- Ready for Phase 10 (Input Validation and Error Handling)

## Self-Check: PASSED

All 8 files verified present. Both task commits (68cb275, cfe7463) verified in git log.

---
*Phase: 09-authentication-and-api-hardening*
*Completed: 2026-02-15*
