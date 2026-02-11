# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-10)

**Core value:** Anyone worldwide can get price exposure to U.S. ammunition by minting ammo tokens with USDC, while only verified U.S. residents in allowed states can redeem for physical delivery.
**Current focus:** Phase 5 complete -- ready for Phase 6

## Current Position

Phase: 5 of 6 (Portfolio and Data Integration) -- COMPLETE
Plan: 2 of 2 in current phase (all plans complete)
Status: Phase 5 complete, ready for Phase 6
Last activity: 2026-02-11 -- Completed plan 05-02 (mock-data elimination)

Progress: [██████████] 83%

## Performance Metrics

**Velocity:**
- Total plans completed: 10
- Average duration: ~10 min
- Total execution time: ~2 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01-foundation | 2 | ~65min | ~33min |
| 02-event-indexer | 2 | ~4min | ~2min |
| 03-wallet-and-api-layer | 2 | ~19min | ~10min |
| 04-mint-and-redeem-flows | 2 | ~11min | ~6min |
| 05-portfolio-and-data-integration | 2 | ~9min | ~5min |

**Recent Trend:**
- Last 5 plans: 04-01 (~5min), 04-02 (~6min), 05-01 (~5min), 05-02 (~4min)
- Trend: Steady and fast

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
- 03-01: `as any` cast for useReadContracts dynamic contracts array (wagmi tuple type limitation)
- 03-01: isReconnecting guard in WalletButton to prevent SSR hydration mismatch
- 03-01: USDC balance inline; ammo token balances deferred to portfolio page
- 03-01: Network badge text fixed to "Avalanche Fuji" (testnet app, was "Mainnet")
- 03-02: readContract + Promise.all over multicall for mapped arrays (avoids viem TypeScript tuple inference errors)
- 03-02: BigInt(0) over 0n literal for ES2017 target compatibility
- 03-02: serverExternalPackages for @ammo-exchange/db to prevent Prisma WASM bundling
- 03-02: Explicit @prisma/client@7 dependency in db package (Prisma 7 generated code needs matching runtime)
- 03-02: webpack extensionAlias .js -> .ts for ESM workspace packages in Next.js
- 04-01: Explicit return type on useMintTransaction to avoid non-portable @wagmi/core type inference (TS2742)
- 04-01: TxStatus state machine derived via useMemo from hook booleans, not manual setState
- 04-01: Two separate useWriteContract instances for approve vs startMint to prevent state collision
- 04-01: Error priority: confirmed/pending states checked before error states to avoid false "failed"
- 04-02: Explicit return type on useRedeemTransaction to match useMintTransaction pattern (TS2742 prevention)
- 04-02: Shipping address stored locally (not via API) since shipping route requires orderId from on-chain indexing
- 04-02: KYC status uses Prisma enum values (NONE/PENDING/APPROVED/REJECTED) directly in frontend state
- 04-02: Token balances displayed as floor(formatUnits(raw, 18)) to show whole rounds only
- 05-01: Drop P&L columns from holdings table (no historical price data available)
- 05-01: 3-step stepper instead of 5-6 step mock stepper (matches available DB fields)
- 05-01: Display order ID as first 8 chars of UUID (Prisma IDs are UUIDs, not AMX-format strings)
- 05-01: Primers section hardcoded to 0 (no real primers data source yet)
- 05-01: Removed demo variant selector from order detail (was mock-only scaffolding)
- 05-02: Simplified components to only show data available from real sources (dropped change24h, volume24h, sparklineData)
- 05-02: Price chart shows "coming soon" placeholder with oracle price instead of fabricated chart data
- 05-02: buildCaliberDetail helper duplicated in mint-flow and redeem-flow (self-contained features)
- 05-02: Action panel uses link buttons to /mint and /redeem instead of inline forms

### Pending Todos

None yet.

### Blockers/Concerns

None yet.

## Session Continuity

Last session: 2026-02-11
Stopped at: Completed 05-02-PLAN.md (mock-data elimination). Phase 5 complete. Ready for Phase 6.
Resume file: None
