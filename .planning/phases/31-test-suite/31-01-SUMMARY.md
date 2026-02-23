---
phase: 31-test-suite
plan: 01
subsystem: testing
tags: [bun-test, unit-tests, idempotency, prisma-mock, worker-handlers]

# Dependency graph
requires:
  - phase: 27-audit-remediation
    provides: "Composite txHash+logIndex dedup in order creation handlers"
  - phase: 30-architecture-hardening
    provides: "Config-driven caliber registry and CONTRACT_ADDRESSES"
provides:
  - "Unit test suite proving handler idempotency and composite uniqueness"
  - "Reusable mock PrismaTx factory and event builders for worker tests"
affects: [31-02, 31-03]

# Tech tracking
tech-stack:
  added: []
  patterns:
    [
      "Mock PrismaTx with in-memory Map simulating upsert semantics",
      "Event builder helpers with override pattern",
    ]

key-files:
  created:
    - apps/worker/src/__tests__/handlers.test.ts
    - apps/worker/src/__tests__/helpers.ts
  modified:
    - apps/worker/tsconfig.json

key-decisions:
  - "Used in-memory Map keyed by composite txHash_logIndex to simulate Prisma upsert"
  - "No external test deps needed -- bun:test built-in runner sufficient"

patterns-established:
  - "MockPrismaTx factory: createMockPrismaTx() returns typed mock with call tracking"
  - "Event builders: buildEventMeta/buildMintStartedArgs etc with partial override pattern"

# Metrics
duration: 2min
completed: 2026-02-21
---

# Phase 31 Plan 01: Worker Handler Tests Summary

**9 unit tests proving handler idempotent replay (same event = 1 order) and composite uniqueness (same tx, different logIndex = 2 orders) using mock PrismaTx**

## Performance

- **Duration:** 2 min
- **Started:** 2026-02-21T09:27:38Z
- **Completed:** 2026-02-21T09:30:06Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments

- Mock PrismaTx factory with in-memory Map simulating Prisma upsert semantics and call tracking
- 9 passing tests covering MintStarted and RedeemRequested handlers
- TEST-01 proven: replaying identical event produces exactly 1 order record
- TEST-02 proven: two events in same tx (different logIndex) produce 2 distinct orders
- Data correctness: usdcAmount, tokenAmount, caliber resolution all verified

## Task Commits

Each task was committed atomically:

1. **Task 1: Create test helpers and mock Prisma transaction factory** - `5eaa6c9` (test)
2. **Task 2: Write handler tests for idempotency and composite uniqueness** - `9f63c20` (test)

## Files Created/Modified

- `apps/worker/src/__tests__/helpers.ts` - Mock PrismaTx factory, EventMeta/args builders with override pattern
- `apps/worker/src/__tests__/handlers.test.ts` - 9 unit tests for handler idempotency and data correctness
- `apps/worker/tsconfig.json` - Updated include to cover **tests** directory

## Decisions Made

- Used in-memory Map keyed by composite `txHash_logIndex` string to simulate Prisma upsert semantics -- first call stores create payload, subsequent calls apply update (empty object = no-op)
- No additional test dependencies -- Bun's built-in test runner provides describe/test/expect

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed TypeScript strict indexing on array access**

- **Found during:** Task 2 (handler tests)
- **Issue:** `_upsertCalls[0]` flagged as possibly undefined by strict TypeScript
- **Fix:** Added non-null assertion operator (`!`) on all `_upsertCalls[0]` accesses
- **Files modified:** apps/worker/src/**tests**/handlers.test.ts
- **Verification:** `pnpm --filter @ammo-exchange/worker check` passes clean
- **Committed in:** 9f63c20 (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Minor TypeScript strictness fix. No scope creep.

## Issues Encountered

None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Test helpers (createMockPrismaTx, event builders) ready for reuse in plans 31-02 and 31-03
- Worker typecheck clean, all 9 tests passing

---

_Phase: 31-test-suite_
_Completed: 2026-02-21_
