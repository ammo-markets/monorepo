---
phase: 29-security-hardening
plan: 01
subsystem: api, auth, ui
tags: [siwe, zod, rate-limiting, security, kyc, masking]

# Dependency graph
requires:
  - phase: 09-authentication-and-api-hardening
    provides: SIWE auth flow, rate limiter middleware, KYC routes
provides:
  - Masked govIdNumber in KYC API responses (SEC-01)
  - Error-throwing KYC mutation/query hooks (SEC-02)
  - Trusted proxy IP extraction for rate limiting (SEC-03)
  - Server-side state code validation with VALID_US_STATE_CODES (SEC-04)
  - SIWE domain/chainId/scheme policy enforcement (SEC-05)
affects: [30-contract-redeployment, 31-testing]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Zod transform + refine pipeline for state code normalization and validation"
    - "Trusted proxy IP extraction (last x-forwarded-for entry)"
    - "SIWE verify with domain/scheme options plus post-verify chainId check"

key-files:
  created: []
  modified:
    - packages/shared/src/constants/index.ts
    - apps/web/app/api/users/kyc/route.ts
    - apps/web/app/api/redeem/shipping/route.ts
    - apps/web/app/api/users/profile/route.ts
    - apps/web/middleware.ts
    - apps/web/app/api/auth/verify/route.ts
    - apps/web/hooks/use-kyc.ts

key-decisions:
  - "VALID_US_STATE_CODES typed as Set<string> for Zod transform compatibility"
  - "SIWE chainId checked post-verify (not in verify options) since siwe library verify() does not accept chainId"

patterns-established:
  - "Zod state validation: length(2) -> transform(toUpperCase) -> refine(VALID_US_STATE_CODES) -> refine(not restricted)"
  - "API data masking: sensitive fields masked server-side before JSON response"

# Metrics
duration: 3min
completed: 2026-02-21
---

# Phase 29 Plan 01: Security Hardening Summary

**Hardened 5 security findings: KYC data masking, mutation error surfacing, trusted proxy IP, state code validation, and SIWE domain/chain policy enforcement**

## Performance

- **Duration:** 3 min
- **Started:** 2026-02-21T04:50:25Z
- **Completed:** 2026-02-21T04:53:43Z
- **Tasks:** 3
- **Files modified:** 7

## Accomplishments

- SEC-01: GET /api/users/kyc now returns masked govIdNumber (only last 4 chars visible)
- SEC-02: KYC mutation and query hooks throw on non-2xx so TanStack Query error state activates
- SEC-03: Rate limiter uses last x-forwarded-for entry (trusted proxy) instead of first (client-supplied)
- SEC-04: All state-accepting routes uppercase and validate against VALID_US_STATE_CODES before restricted-state checks
- SEC-05: SIWE verification enforces domain, URI scheme, and chainId policy

## Task Commits

Each task was committed atomically:

1. **Task 1: KYC data masking and state code validation (SEC-01, SEC-04)** - `47d01cc` (feat)
2. **Task 2: Rate limiter IP trust and SIWE policy enforcement (SEC-03, SEC-05)** - `b813796` (feat)
3. **Task 3: KYC mutation hook error surfacing (SEC-02)** - `6221c22` (fix)
4. **Formatting: VALID_US_STATE_CODES prettier format** - `742443c` (chore)

## Files Created/Modified

- `packages/shared/src/constants/index.ts` - Added VALID_US_STATE_CODES Set (50 states + DC + 5 territories)
- `apps/web/app/api/users/kyc/route.ts` - Masked govIdNumber in GET, state validation in POST schema
- `apps/web/app/api/redeem/shipping/route.ts` - State uppercase + validation before restricted-state check
- `apps/web/app/api/users/profile/route.ts` - State uppercase + validation in address schema
- `apps/web/middleware.ts` - Fixed IP extraction to use last x-forwarded-for entry
- `apps/web/app/api/auth/verify/route.ts` - Added domain, scheme, and chainId enforcement to SIWE verify
- `apps/web/hooks/use-kyc.ts` - Added res.ok checks in mutation and query hooks

## Decisions Made

- Typed VALID_US_STATE_CODES as `Set<string>` instead of using `as const` to avoid TypeScript narrowing issues with Zod's string transform output
- SIWE chainId checked post-verify with explicit if-check since the siwe library's verify() options do not accept chainId directly

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed Set<string> type for VALID_US_STATE_CODES**
- **Found during:** Task 1 (KYC data masking and state code validation)
- **Issue:** `new Set([...] as const)` creates `Set<"AL" | "AK" | ...>` which rejects `string` from Zod transform
- **Fix:** Changed to `Set<string>` explicit type annotation
- **Files modified:** packages/shared/src/constants/index.ts
- **Verification:** `pnpm --filter @ammo-exchange/web check` passes
- **Committed in:** 47d01cc (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Type fix necessary for correctness. No scope creep.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- All 5 security audit findings (SEC-01 through SEC-05) are resolved
- Ready for Phase 30 (contract redeployment) and Phase 31 (testing)

---
*Phase: 29-security-hardening*
*Completed: 2026-02-21*
