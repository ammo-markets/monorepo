# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-10)

**Core value:** Anyone worldwide can get price exposure to U.S. ammunition by minting ammo tokens with USDC, while only verified U.S. residents in allowed states can redeem for physical delivery.
**Current focus:** Phase 1 -- Foundation

## Current Position

Phase: 1 of 6 (Foundation) -- COMPLETE
Plan: 2 of 2 in current phase (all plans complete)
Status: Phase complete, ready for Phase 2
Last activity: 2026-02-11 -- Completed plan 01-02 (shared config + schema migration)

Progress: [██░░░░░░░░] 17%

## Performance Metrics

**Velocity:**
- Total plans completed: 2
- Average duration: ~33 min
- Total execution time: ~1.1 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01-foundation | 2 | ~65min | ~33min |

**Recent Trend:**
- Last 5 plans: 01-01 (~45min), 01-02 (~20min)
- Trend: --

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

### Pending Todos

None yet.

### Blockers/Concerns

None yet.

## Session Continuity

Last session: 2026-02-11
Stopped at: Completed 01-02-PLAN.md (shared config + schema migration). Phase 1 complete. Ready for Phase 2 (Event Indexer).
Resume file: None
