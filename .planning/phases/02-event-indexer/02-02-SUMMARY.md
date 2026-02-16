---
phase: 02-event-indexer
plan: 02
subsystem: worker
tags: [viem, prisma, event-indexer, polling, backfill, avalanche-fuji, bun]

# Dependency graph
requires:
  - phase: 02-event-indexer
    plan: 01
    provides: "Viem client, polling constants, BlockCursor helpers, MintStarted/MintFinalized/RedeemRequested/RedeemFinalized handlers"
  - phase: 01-foundation
    provides: "Prisma schema (Order, User, BlockCursor), shared config (CONTRACT_ADDRESSES), CaliberMarket ABI"
provides:
  - "Core indexer with parallel event fetching, block-ordered processing, and atomic Prisma transactions (apps/worker/src/indexer.ts)"
  - "Complete worker entry point with backfill-on-startup, 4s polling loop, overlap guard, and graceful shutdown (apps/worker/src/index.ts)"
  - "Runnable event indexer: start to poll to shutdown lifecycle"
affects: [03-rest-api, worker, deployment]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Parallel event fetching via Promise.all with 4 getContractEvents calls"
    - "Block-ordered event processing: sort by blockNumber then logIndex before handler dispatch"
    - "Prisma interactive transaction ($transaction) with 30s timeout for atomic batch processing"
    - "Cursor advancement inside same transaction for crash recovery"
    - "isProcessing guard for non-overlapping polling ticks"
    - "SIGTERM/SIGINT graceful shutdown with clearInterval"

key-files:
  created:
    - "apps/worker/src/indexer.ts"
  modified:
    - "apps/worker/src/index.ts"

key-decisions:
  - "pollOnce serves both backfill and polling (single function, cosmetic distinction via caller logging)"
  - "Empty block ranges still advance cursor to prevent re-scanning on next tick"
  - "Polling errors are non-fatal (logged and retried), startup errors are fatal (exit 1)"
  - "Event args cast through unknown for handler type compatibility with viem's strict generics"

patterns-established:
  - "pollOnce pattern: cursor read -> batch loop -> fetch events -> processAndCommit -> cursor advance"
  - "Non-overlapping polling with isProcessing flag"
  - "Graceful shutdown: SIGTERM/SIGINT -> clearInterval -> process.exit(0)"

# Metrics
duration: 2min
completed: 2026-02-11
---

# Phase 2 Plan 2: Polling Loop and Entry Point Summary

**Event indexer runtime with parallel 4-event fetching, block-ordered Prisma transactions, 2000-block batch backfill, 4s polling loop with overlap guard, and SIGTERM graceful shutdown**

## Performance

- **Duration:** 2 min
- **Started:** 2026-02-11T02:31:56Z
- **Completed:** 2026-02-11T02:33:50Z
- **Tasks:** 2
- **Files created:** 1
- **Files modified:** 1

## Accomplishments

- Core indexer fetches all 4 event types (MintStarted, MintFinalized, RedeemRequested, RedeemFinalized) from all 4 CaliberMarket contracts in parallel using Promise.all
- Events sorted by blockNumber then logIndex before processing, ensuring correct ordering (e.g., MintStarted before MintFinalized within same block)
- All event writes and cursor update happen inside a single Prisma interactive transaction with 30s timeout for atomic crash recovery
- Entry point runs initial backfill from last cursor to chain head, then enters a 4s polling loop with isProcessing guard to prevent overlapping ticks
- Graceful shutdown on SIGTERM/SIGINT clears the polling interval and exits cleanly
- Old mainnet stub completely replaced -- no references to `avalanche` (mainnet) remain in worker source

## Task Commits

Each task was committed atomically:

1. **Task 1: Create indexer core with event fetching, processing, and batch commits** - `5069487` (feat)
2. **Task 2: Rewrite entry point with backfill, polling loop, and graceful shutdown** - `e6b35a5` (feat)

## Files Created/Modified

- `apps/worker/src/indexer.ts` - Core indexer: fetchEvents (parallel 4-event fetch), processAndCommit (block-ordered Prisma transaction), pollOnce (batched cursor-to-head scan)
- `apps/worker/src/index.ts` - Entry point: startup logging, backfill, polling loop with overlap guard, graceful shutdown handlers

## Decisions Made

- **pollOnce as single function for both backfill and polling:** Rather than maintaining separate backfill() and poll() functions with duplicated logic, pollOnce processes all blocks from cursor to head in batches. The distinction is cosmetic -- the caller logs "Backfilling..." or runs silently in the interval.
- **Empty block ranges advance the cursor:** When a batch contains zero events, the cursor is still upserted to the batch end block. This prevents re-scanning empty ranges on subsequent ticks and keeps progress moving forward.
- **Polling errors are non-fatal:** Errors during the interval polling loop are caught, logged, and retried on the next tick. Only startup/backfill errors kill the process (exit code 1).
- **Event args cast via `as unknown as` for type compatibility:** Viem's strict getContractEvents returns deeply generic log types that don't directly match our clean handler interfaces. Using `as unknown as MintStartedArgs` bridges the gap cleanly.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- The event indexer is complete and runnable: backfill, poll, process, shutdown
- All 7 worker source files are in place (5 from plan 02-01, 2 from this plan)
- Full monorepo type-check passes (7/7 tasks, zero errors)
- Phase 2 success criteria fully met:
  1. Worker detects MintStarted, MintFinalized, RedeemRequested, RedeemFinalized across all 4 markets
  2. Order records include on-chain order ID, tx hash, caliber, wallet address, amounts, status
  3. BlockCursor tracks last processed block and resumes after restart
  4. Worker backfills on startup before entering polling loop
- Ready for Phase 3 (REST API) which can query the indexed Order/User data

## Self-Check: PASSED

All files verified present. Both task commits (5069487, e6b35a5) verified in git log. Type check passes with zero errors across full monorepo.

---

_Phase: 02-event-indexer_
_Plan: 02_
_Completed: 2026-02-11_
