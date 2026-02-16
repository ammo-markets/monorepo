---
phase: 02-event-indexer
plan: 01
subsystem: worker
tags: [viem, prisma, event-indexer, avalanche-fuji, blockchain, bun]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: "Prisma schema (Order, User, BlockCursor), shared config (CONTRACT_ADDRESSES, CALIBER_TO_PRISMA), CaliberMarket ABI"
provides:
  - "Viem public client configured for Avalanche Fuji (apps/worker/src/lib/client.ts)"
  - "Polling constants, market address array, address-to-caliber reverse lookup (apps/worker/src/lib/constants.ts)"
  - "BlockCursor read/upsert helpers with PrismaTx type (apps/worker/src/lib/cursor.ts)"
  - "MintStarted and MintFinalized event handlers (apps/worker/src/handlers/mint.ts)"
  - "RedeemRequested and RedeemFinalized event handlers (apps/worker/src/handlers/redeem.ts)"
affects: [02-02-polling-loop, worker]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "addressToCaliber reverse lookup from CONTRACT_ADDRESSES for multi-contract event routing"
    - "PrismaTx type extraction for transaction-scoped handlers"
    - "txHash-based upsert for idempotent event processing"
    - "connectOrCreate for auto-creating User records from on-chain events"
    - "EventMeta interface for decoupling handlers from viem log types"

key-files:
  created:
    - "apps/worker/src/lib/client.ts"
    - "apps/worker/src/lib/constants.ts"
    - "apps/worker/src/lib/cursor.ts"
    - "apps/worker/src/handlers/mint.ts"
    - "apps/worker/src/handlers/redeem.ts"
  modified: []

key-decisions:
  - "EventMeta interface defined in constants.ts (shared infrastructure) rather than in handler files"
  - "Single cursor key 'all-markets' for all 4 CaliberMarket contracts"
  - "Handlers accept clean typed interfaces (MintStartedArgs, etc.) instead of viem log types for decoupling"
  - "updateMany for finalization handlers since onChainOrderId is not unique across calibers"

patterns-established:
  - "Handler pattern: (tx, args, meta) => Promise<void> for all event handlers"
  - "addressToCaliber(address) for contract-to-caliber resolution"
  - "txHash upsert for idempotent order creation"
  - "connectOrCreate for User auto-creation from wallet addresses"

# Metrics
duration: 2min
completed: 2026-02-11
---

# Phase 2 Plan 1: Worker Foundation Modules Summary

**Viem Fuji client, polling constants, BlockCursor helpers, and four event handlers (MintStarted, MintFinalized, RedeemRequested, RedeemFinalized) with idempotent upserts and user auto-creation**

## Performance

- **Duration:** 2 min
- **Started:** 2026-02-11T02:27:17Z
- **Completed:** 2026-02-11T02:29:28Z
- **Tasks:** 2
- **Files created:** 5

## Accomplishments

- Viem public client correctly targeting Avalanche Fuji (chain ID 43113), fixing the mainnet chain bug in the existing index.ts
- MARKET_ADDRESSES array with all 4 CaliberMarket addresses and bidirectional address-to-caliber lookup
- BlockCursor helpers (getCursor, upsertCursor) for atomic cursor management within Prisma transactions
- Four event handlers implementing idempotent order creation (via txHash upsert) and status updates (via updateMany)
- User records auto-created via connectOrCreate when processing events for new wallets

## Task Commits

Each task was committed atomically:

1. **Task 1: Create viem client, constants, and cursor helpers** - `6d2fdce` (feat)
2. **Task 2: Create mint and redeem event handlers** - `b92a83f` (feat)

## Files Created/Modified

- `apps/worker/src/lib/client.ts` - Viem public client for Avalanche Fuji with FUJI_RPC_URL transport
- `apps/worker/src/lib/constants.ts` - POLL_INTERVAL_MS, BATCH_SIZE, CURSOR_KEY, CHAIN_ID, MARKET_ADDRESSES, addressToCaliber, EventMeta
- `apps/worker/src/lib/cursor.ts` - PrismaTx type, getCursor, upsertCursor for BlockCursor management
- `apps/worker/src/handlers/mint.ts` - handleMintStarted (PENDING MINT creation), handleMintFinalized (COMPLETED update)
- `apps/worker/src/handlers/redeem.ts` - handleRedeemRequested (PENDING REDEEM creation), handleRedeemFinalized (COMPLETED update)

## Decisions Made

- Defined EventMeta interface in constants.ts as shared infrastructure rather than duplicating in each handler file. Both handlers import from the same location.
- Handlers accept clean typed interfaces (MintStartedArgs, MintFinalizedArgs, etc.) instead of viem log types directly. This decouples handlers from viem internals and makes them independently testable.
- Used updateMany for finalization handlers (MintFinalized, RedeemFinalized) because onChainOrderId is per-contract (not globally unique), so the lookup is by composite (onChainOrderId + caliber + type + status).
- All wallet addresses stored lowercase for consistent database lookups.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- All 5 foundation modules are implemented, type-safe, and ready for composition
- Plan 02-02 (polling loop / indexer.ts) can now import these modules to build the complete event indexer
- The existing index.ts still uses the old mainnet chain -- plan 02-02 will replace it with the new polling loop

## Self-Check: PASSED

All 5 created files verified present. Both task commits (6d2fdce, b92a83f) verified in git log. Type check passes with zero errors.

---

_Phase: 02-event-indexer_
_Plan: 01_
_Completed: 2026-02-11_
