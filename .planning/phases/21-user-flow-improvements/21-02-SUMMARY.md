---
phase: 21-user-flow-improvements
plan: 02
subsystem: ui
tags: [kyc, redeem, profile, react, next.js]

requires:
  - phase: 21-user-flow-improvements
    provides: Phase plan structure
provides:
  - KYC pre-check gate blocking unverified users at redeem Step 0
  - Embedded KYC form on profile page with id="kyc" anchor
  - Profile page KYC status display (Verified/Pending/form)
affects: [redeem-flow, profile]

tech-stack:
  added: []
  patterns:
    - "KYC interstitial banner pattern (show warning above step, block progression)"
    - "Inline form embedding on profile page with query invalidation"

key-files:
  created: []
  modified:
    - apps/web/features/redeem/redeem-flow.tsx
    - apps/web/app/(app)/profile/page.tsx

key-decisions:
  - "KYC gate as banner above Step 0 (not separate step) to avoid renumbering"
  - "PENDING users allowed past Step 0 (they hit Step 2 KYC check)"
  - "Profile page invalidates both kyc and profile queries on KYC submit"

patterns-established:
  - "Pre-check gate pattern: show dismissible banner, block Next handler"

duration: 2min
completed: 2026-02-16
---

# Phase 21 Plan 02: KYC Pre-check & Profile Verification Summary

**KYC pre-check gate on redeem flow blocking unverified users at Step 0, plus embedded KYC form on profile page with direct-link anchor**

## Performance

- **Duration:** 2 min
- **Started:** 2026-02-16T07:57:18Z
- **Completed:** 2026-02-16T07:59:28Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- Unverified users see a prominent KYC banner above Step 0 in redeem flow, preventing wasted time on shipping info
- "Next" button on Step 0 blocks progression for NONE/REJECTED KYC status, re-shows banner
- Profile page now has inline KYC form for unverified users with id="kyc" anchor for direct linking
- Profile page shows contextual KYC status (Verified badge, Pending review message, or embedded form)

## Task Commits

Each task was committed atomically:

1. **Task 1: Add KYC pre-check gate to redeem flow** - `17440ed` (feat)
2. **Task 2: Add KYC verification form to profile page** - `e1079a1` (feat)

## Files Created/Modified

- `apps/web/features/redeem/redeem-flow.tsx` - Added showKycPrompt state, KYC banner above Step 0, blocked Next handler for unverified users
- `apps/web/app/(app)/profile/page.tsx` - Added KycForm imports, useKycStatus/useKycSubmit hooks, conditional KYC section with form/pending/verified states

## Decisions Made

- Used banner above Step 0 rather than a new step to avoid renumbering all existing steps
- PENDING users can proceed past Step 0 since they already have an active KYC submission and will hit the Step 2 pending check
- Profile page uses useKycStatus hook (independent of profile query) for real-time KYC status, with fallback to profile.kycStatus
- Invalidate both "kyc" and "profile" query keys after KYC submission to ensure badge and status refresh

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- KYC pre-check and profile form complete
- Ready for next phase plans
- All type checks pass

---

_Phase: 21-user-flow-improvements_
_Completed: 2026-02-16_
