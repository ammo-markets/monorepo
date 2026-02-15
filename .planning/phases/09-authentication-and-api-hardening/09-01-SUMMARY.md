---
phase: 09-authentication-and-api-hardening
plan: 01
subsystem: auth
tags: [siwe, iron-session, wagmi, wallet-auth, session-cookies]

# Dependency graph
requires:
  - phase: 03-wallet-and-api-layer
    provides: "wagmi wallet hooks, viem publicClient, user registration endpoint"
  - phase: 01-foundation
    provides: "Prisma User model, contract ABIs, shared config"
provides:
  - "SIWE authentication flow (nonce -> sign -> verify -> cookie session)"
  - "Auth helper library: getSession, requireSession, requireKeeper"
  - "4 auth API routes: nonce, verify, session, logout"
  - "useSiwe React hook for client-side sign-in"
  - "Race-condition-safe registration with serializable transaction"
affects: [09-02-route-protection, api-middleware, admin-dashboard]

# Tech tracking
tech-stack:
  added: [siwe@3.0.0, iron-session@8.0.4]
  patterns: [cookie-based-session-auth, siwe-wallet-auth, no-request-param-session]

key-files:
  created:
    - apps/web/lib/auth.ts
    - apps/web/app/api/auth/nonce/route.ts
    - apps/web/app/api/auth/verify/route.ts
    - apps/web/app/api/auth/session/route.ts
    - apps/web/app/api/auth/logout/route.ts
    - apps/web/hooks/use-siwe.ts
  modified:
    - apps/web/hooks/use-wallet.ts
    - apps/web/app/api/users/register/route.ts
    - CLAUDE.md

key-decisions:
  - "iron-session uses cookies() from next/headers -- no request parameter, modern App Router pattern"
  - "Registration moved server-side into /api/auth/verify for atomic auth+registration"
  - "Legacy /api/users/register kept for worker backward compatibility with serializable isolation"

patterns-established:
  - "Session auth pattern: getSession()/requireSession()/requireKeeper() -- all use cookies() internally"
  - "SIWE flow: GET /api/auth/nonce -> client signs -> POST /api/auth/verify -> cookie set"
  - "Wallet switch invalidation: useSiwe signs out when wagmi address changes"

# Metrics
duration: 4min
completed: 2026-02-15
---

# Phase 9 Plan 01: SIWE Authentication Infrastructure Summary

**SIWE wallet auth with iron-session cookies, 4 auth endpoints, useSiwe hook, and race-safe registration**

## Performance

- **Duration:** 4 min
- **Started:** 2026-02-15T09:24:02Z
- **Completed:** 2026-02-15T09:28:00Z
- **Tasks:** 2
- **Files modified:** 10

## Accomplishments
- Built complete SIWE authentication flow: nonce generation, message signing, signature verification, and cookie-based sessions
- Created auth helper library (getSession, requireSession, requireKeeper) using Next.js 15 cookies() pattern -- no request parameter needed
- Created useSiwe React hook with signIn/signOut/checkSession and automatic session invalidation on wallet switch
- Removed client-side registration from useWallet (now handled server-side in /api/auth/verify)
- Fixed registration race condition with Prisma serializable transaction isolation

## Task Commits

Each task was committed atomically:

1. **Task 1: Install dependencies and create auth library with SIWE endpoints** - `4437533` (feat)
2. **Task 2: Create useSiwe hook and fix registration race condition** - `5327277` (feat)

## Files Created/Modified
- `apps/web/lib/auth.ts` - Auth helper library: sessionOptions, getSession, requireSession, requireKeeper
- `apps/web/app/api/auth/nonce/route.ts` - GET endpoint generating random SIWE nonce
- `apps/web/app/api/auth/verify/route.ts` - POST endpoint verifying SIWE signature and creating session + user
- `apps/web/app/api/auth/session/route.ts` - GET endpoint returning current session state
- `apps/web/app/api/auth/logout/route.ts` - POST endpoint destroying session
- `apps/web/hooks/use-siwe.ts` - React hook for SIWE sign-in flow with session restore
- `apps/web/hooks/use-wallet.ts` - Removed registration logic (registerWallet, registrationFailed, retryRegistration)
- `apps/web/app/api/users/register/route.ts` - Added serializable transaction isolation for race safety
- `CLAUDE.md` - Documented SESSION_SECRET and ALLOWED_ORIGINS env vars

## Decisions Made
- Used iron-session v8 with cookies() from next/headers (modern App Router pattern, no request parameter)
- Combined auth + registration into /api/auth/verify for atomic single-step onboarding
- Kept legacy /api/users/register endpoint for worker backward compatibility but wrapped in serializable transaction
- Session invalidation on wallet switch handled client-side in useSiwe hook via useEffect watching address changes

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

Environment variable required before auth will work:
- `SESSION_SECRET` - 32+ character secret for iron-session cookie encryption (add to `.env`)

## Next Phase Readiness
- Auth helpers (requireSession, requireKeeper) ready for route protection in Plan 02
- All 4 auth endpoints operational, useSiwe hook ready for UI integration
- No blockers for Plan 02 (route protection and middleware)

---
*Phase: 09-authentication-and-api-hardening*
*Completed: 2026-02-15*
