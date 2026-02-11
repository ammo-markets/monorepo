# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-10)

**Core value:** Anyone worldwide can get price exposure to U.S. ammunition by minting ammo tokens with USDC, while only verified U.S. residents in allowed states can redeem for physical delivery.
**Current focus:** Phase 2 complete -- ready for Phase 3

## Current Position

Phase: 2 of 6 (Event Indexer) -- COMPLETE
Plan: 2 of 2 in current phase (all done)
Status: Phase 2 Complete
Last activity: 2026-02-11 -- Completed plan 02-02 (polling loop and entry point)

Progress: [████░░░░░░] 33%

## Performance Metrics

**Velocity:**
- Total plans completed: 4
- Average duration: ~17 min
- Total execution time: ~1.2 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01-foundation | 2 | ~65min | ~33min |
| 02-event-indexer | 2 | ~4min | ~2min |

**Recent Trend:**
- Last 5 plans: 01-01 (~45min), 01-02 (~20min), 02-01 (~2min), 02-02 (~2min)
- Trend: Accelerating

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- Roadmap: Bottom-up build order (contracts -> worker -> API -> frontend -> admin) per research findings
- Roadmap: Polling-based getContractEvents over watchContractEvent for worker reliability
- Roadmap: Mock USDC with 6 decimals required for testnet (no official USDC on Fuji)
- 01-01: Hand-rolled MockUSDC (not OpenZeppelin) matching project convention
- 01-01: Deployer set as all roles (treasury, guardian, keeper, feeRecipient) for testnet
- 01-01: evm_version = cancun in foundry.toml for Avalanche C-Chain
- 01-01: avascan.info API for Snowtrace contract verification
- 01-02: Per-caliber config structure with Record<Caliber, {market, token}> for type-safe address lookups
- 01-02: Bidirectional caliber mapping (PRISMA_TO_CALIBER/CALIBER_TO_PRISMA) to bridge Prisma naming constraints
- 01-02: BlockCursor with BigInt lastBlock for correct block number storage
- 01-02: walletAddress on Order as nullable String for backward compatibility
- 02-01: EventMeta interface in constants.ts as shared infrastructure for handler decoupling
- 02-01: Clean typed interfaces (MintStartedArgs, etc.) instead of viem log types for handler testability
- 02-01: updateMany for finalization handlers since onChainOrderId is per-contract not globally unique
- 02-01: All wallet addresses stored lowercase for consistent lookups
- 02-02: pollOnce serves both backfill and polling (single function, cosmetic distinction via caller logging)
- 02-02: Empty block ranges advance cursor to prevent re-scanning
- 02-02: Polling errors are non-fatal (logged + retried), startup errors are fatal (exit 1)
- 02-02: Event args cast via `as unknown as` for viem strict generic compatibility

### Pending Todos

None yet.

### Blockers/Concerns

None yet.

## Session Continuity

Last session: 2026-02-11
Stopped at: Completed 02-02-PLAN.md (polling loop and entry point). Phase 2 complete. Ready for Phase 3 (REST API).
Resume file: None
