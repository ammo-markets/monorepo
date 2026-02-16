---
phase: quick
plan: 01
subsystem: ui
tags: [tanstack-query, react, useMutation, useQuery, hooks]

# Dependency graph
requires: []
provides:
  - "useKycStatus query hook and useKycSubmit mutation hook"
  - "useSaveProfile generic mutation hook"
  - "Refactored redeem-flow and profile page using TanStack Query mutations"
affects: [redeem-flow, profile-page]

# Tech tracking
tech-stack:
  added: []
  patterns: [useMutation for all API writes with automatic cache invalidation]

key-files:
  created:
    - apps/web/hooks/use-kyc.ts
    - apps/web/hooks/use-save-profile.ts
  modified:
    - apps/web/features/redeem/redeem-flow.tsx
    - apps/web/app/profile/page.tsx

key-decisions:
  - "Made useSaveProfile generic to accept any form type via type parameter"
  - "KYC data now pre-fetched on wallet connect rather than on step 2 entry"

patterns-established:
  - "useMutation pattern: hooks handle fetch + error throwing + cache invalidation; consumers only call mutateAsync"

# Metrics
duration: 5min
completed: 2026-02-15
---

# Quick Task 1: Refactor Manual Fetch Mutations to TanStack Query Summary

**Replaced all manual fetch + useState mutation patterns with TanStack Query useMutation hooks across KYC flow and profile page**

## Performance

- **Duration:** 5 min
- **Started:** 2026-02-15T15:06:50Z
- **Completed:** 2026-02-15T15:12:01Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments

- Created `useKycStatus` query hook and `useKycSubmit` mutation hook replacing manual fetch + useState in RedeemFlow
- Created `useSaveProfile` generic mutation hook replacing manual PATCH + error handling in ProfilePage
- Eliminated all manual `saving`, `kycLoading`, `saveError`, `kycStatus`, `kycPrefill` useState in both consumers
- KYC data now pre-fetched when wallet is connected (better UX - data ready before user reaches step 2)

## Task Commits

Each task was committed atomically:

1. **Task 1: Create KYC query and mutation hooks** - `6afb843` (feat)
2. **Task 2: Create profile save mutation hook and refactor both consumers** - `1409471` (refactor)

## Files Created/Modified

- `apps/web/hooks/use-kyc.ts` - useKycStatus (useQuery) and useKycSubmit (useMutation) hooks
- `apps/web/hooks/use-save-profile.ts` - Generic useSaveProfile (useMutation) hook with error extraction
- `apps/web/features/redeem/redeem-flow.tsx` - Removed manual KYC fetch/state, uses new hooks
- `apps/web/app/profile/page.tsx` - Removed manual save/error state and useQueryClient, uses useSaveProfile

## Decisions Made

- Made `useSaveProfile` generic (`<T extends object>`) so it accepts any form interface without index signature issues
- KYC query is enabled whenever wallet address exists (not gated to step 2), improving UX by pre-fetching

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed TypeScript strict mode issues with `noUncheckedIndexedAccess`**

- **Found during:** Task 1 (use-kyc.ts creation)
- **Issue:** `String.split("T")[0]` returns `string | undefined` with `noUncheckedIndexedAccess`, and `any` ternary didn't narrow properly
- **Fix:** Used explicit `let` assignment with `?? null` fallback for dateOfBirth parsing
- **Files modified:** apps/web/hooks/use-kyc.ts
- **Verification:** `pnpm --filter @ammo-exchange/web check` passes
- **Committed in:** 6afb843 (Task 1 commit)

**2. [Rule 1 - Bug] Fixed interface not assignable to Record index signature**

- **Found during:** Task 2 (profile page refactor)
- **Issue:** TypeScript interfaces don't have implicit index signatures, so `AddressForm` couldn't be passed to `Record<string, unknown>` parameter
- **Fix:** Made `useSaveProfile` generic with `<T extends object>` type parameter
- **Files modified:** apps/web/hooks/use-save-profile.ts, apps/web/app/profile/page.tsx
- **Verification:** `pnpm --filter @ammo-exchange/web check` passes
- **Committed in:** 1409471 (Task 2 commit)

---

**Total deviations:** 2 auto-fixed (2 bugs)
**Impact on plan:** Both fixes were TypeScript strict mode compatibility issues. No scope creep.

## Issues Encountered

None beyond the type fixes documented above.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- All mutation patterns now use TanStack Query consistently
- Pattern established for future mutation hooks

---

_Quick Task: 01_
_Completed: 2026-02-15_
