---
phase: 10-worker-hardening
plan: 02
subsystem: infra
tags: [viem, retry, backoff, reorg, graceful-shutdown, env-validation]

# Dependency graph
requires:
  - phase: 10-01
    provides: "Event handlers for all 9 CaliberMarket events"
provides:
  - "RPC retry transport with exponential backoff (5 retries, 30s timeout)"
  - "Reorg-safe polling with 5-block confirmation window rollback"
  - "Fail-fast env validation for FUJI_RPC_URL and DATABASE_URL"
  - "Graceful shutdown that drains in-flight poll before exit"
affects: []

# Tech tracking
tech-stack:
  added: []
  patterns:
    [
      "fail-fast env validation at import time",
      "confirmation window rollback for reorg safety",
      "graceful shutdown with in-flight work drain",
    ]

key-files:
  created:
    - apps/worker/src/lib/env.ts
  modified:
    - apps/worker/src/lib/client.ts
    - apps/worker/src/lib/constants.ts
    - apps/worker/src/indexer.ts
    - apps/worker/src/index.ts

key-decisions:
  - "5-block confirmation window for Avalanche reorg safety (~10s margin)"
  - "viem built-in retry transport instead of custom retry wrapper"
  - "env validation via side-effect import at top of entry point"

patterns-established:
  - "Fail-fast env validation: import env.ts first in entry point to crash before any work"
  - "Reorg-safe polling: subtract CONFIRMATION_BLOCKS from cursor on each poll, rely on idempotent handlers"
  - "Graceful shutdown: track currentPoll promise, await it on SIGTERM before process.exit"

# Metrics
duration: 2min
completed: 2026-02-15
---

# Phase 10 Plan 02: Worker Hardening Summary

**RPC retry transport with exponential backoff, 5-block reorg rollback, fail-fast env validation, and graceful shutdown with in-flight poll drain**

## Performance

- **Duration:** 2 min
- **Started:** 2026-02-15T14:13:32Z
- **Completed:** 2026-02-15T14:15:01Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments

- Worker retries transient RPC failures (429, 502, 503, timeouts) with viem's built-in exponential backoff (5 retries, 1s base)
- Each poll re-scans last 5 blocks to catch shallow reorgs; idempotent txHash-based upserts make re-processing safe
- Missing FUJI_RPC_URL or DATABASE_URL causes immediate exit with clear error message before any work begins
- SIGTERM/SIGINT waits for current poll cycle to complete before exiting (no partial transaction commits)

## Task Commits

Each task was committed atomically:

1. **Task 1: Add env validation, retry transport, and reorg constant** - `fe24ac0` (feat)
2. **Task 2: Add reorg protection and graceful shutdown** - `5d5272e` (feat)

## Files Created/Modified

- `apps/worker/src/lib/env.ts` - Fail-fast validation of FUJI_RPC_URL and DATABASE_URL at import time
- `apps/worker/src/lib/client.ts` - Viem public client with retry transport (5 retries, exponential backoff, 30s timeout)
- `apps/worker/src/lib/constants.ts` - Added CONFIRMATION_BLOCKS = 5n for reorg window
- `apps/worker/src/indexer.ts` - Reorg-safe polling: rolls back cursor by CONFIRMATION_BLOCKS on each poll
- `apps/worker/src/index.ts` - Graceful shutdown draining in-flight poll, env import at top for fail-fast

## Decisions Made

- 5-block confirmation window for Avalanche (~10s margin) -- conservative but cheap since handlers are idempotent
- Used viem's built-in retry transport rather than custom wrapper -- handles 429, 5xx, timeouts natively
- env validation via side-effect import (import at top of entry point triggers requireEnv checks)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Worker is now production-hardened: retries transient failures, handles reorgs, validates config, and shuts down cleanly
- Ready for deployment to Railway with confidence in resilience

---

_Phase: 10-worker-hardening_
_Completed: 2026-02-15_
