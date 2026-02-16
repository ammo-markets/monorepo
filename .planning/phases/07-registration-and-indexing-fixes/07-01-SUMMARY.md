---
phase: 07-registration-and-indexing-fixes
plan: 01
subsystem: api
tags: [next.js, prisma, wagmi, react, upsert, wallet-registration]

# Dependency graph
requires:
  - phase: 03-wallet-and-api-layer
    provides: useWallet hook and API route patterns (zod validation, prisma imports)
provides:
  - POST /api/users/register endpoint for idempotent wallet-based user creation
  - Auto-registration on wallet connect via useWallet hook
affects: [07-02-indexing-fixes, worker-event-handlers]

# Tech tracking
tech-stack:
  added: []
  patterns:
    [
      fire-and-forget registration,
      upsert for idempotency,
      silent-fail best-effort,
    ]

key-files:
  created:
    - apps/web/app/api/users/register/route.ts
  modified:
    - apps/web/hooks/use-wallet.ts

key-decisions:
  - "Fire-and-forget registration: no await, no UI loading state, silent catch -- worker fallback exists"
  - "Upsert with empty update for idempotency -- no duplicate records on reconnect or account switch"

patterns-established:
  - "Best-effort registration: frontend fires POST, silent fail acceptable because worker creates User on first on-chain event as fallback"

# Metrics
duration: 12min
completed: 2026-02-11
---

# Phase 7 Plan 1: User Auto-Registration Summary

**POST /api/users/register endpoint with useWallet hook integration for automatic database record creation on wallet connect**

## Performance

- **Duration:** 12 min
- **Started:** 2026-02-11T15:09:04Z
- **Completed:** 2026-02-11T15:21:30Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- POST /api/users/register endpoint that upserts User by wallet address with zod validation
- useWallet hook fires registration call on wallet connect and account switch, fire-and-forget
- Fully idempotent: duplicate calls for the same wallet are no-ops (upsert with empty update)

## Task Commits

Each task was committed atomically:

1. **Task 1: Create POST /api/users/register endpoint** - `9ca293e` (feat)
2. **Task 2: Wire useWallet hook to auto-register on connect** - `cc5c62a` (feat)

## Files Created/Modified

- `apps/web/app/api/users/register/route.ts` - POST endpoint that upserts User by wallet address, returns walletAddress and kycStatus
- `apps/web/hooks/use-wallet.ts` - Added useEffect to fire POST /api/users/register when account.address changes

## Decisions Made

- Fire-and-forget pattern: registration call is not awaited and errors are silently caught. The worker's connectOrCreate in event handlers serves as a fallback, so the UI is never blocked by registration.
- Upsert with empty update: calling register for an already-registered wallet is a safe no-op. No duplicate records possible.
- No new state variables in useWallet: the hook's return type is unchanged, so no breaking changes for consumers.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- User records are now auto-created on wallet connect, fixing REG-01 and REG-02
- API calls (orders, KYC status) will succeed for first-time users immediately after connect
- Worker event handlers still serve as fallback for edge cases

## Self-Check: PASSED

- FOUND: apps/web/app/api/users/register/route.ts
- FOUND: apps/web/hooks/use-wallet.ts
- FOUND: 07-01-SUMMARY.md
- FOUND: commit 9ca293e (Task 1)
- FOUND: commit cc5c62a (Task 2)

---

_Phase: 07-registration-and-indexing-fixes_
_Completed: 2026-02-11_
