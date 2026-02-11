# Ammo Exchange

## What This Is

A DeFi protocol for tokenized ammunition trading on Avalanche. Users deposit USDC to mint ERC20 tokens backed 1:1 by physical ammunition stored in insured warehouses via Ammo Squared. Token holders can trade on Uniswap pools or redeem tokens for physical delivery (US only, KYC required). The protocol provides global price exposure to the U.S. ammunition market — anyone with USDC can speculate on ammo prices, just like USDC gives USD exposure without a bank account.

## Core Value

Anyone worldwide can get price exposure to U.S. ammunition by minting ammo tokens with USDC, while only verified U.S. residents in allowed states can redeem for physical delivery.

## Requirements

### Validated

<!-- Shipped and confirmed valuable. -->

- ✓ Smart contracts: CaliberMarket (2-step mint/redeem), AmmoToken (ERC20), AmmoFactory, AmmoManager (access control) — audited
- ✓ Contract ABIs exported as TypeScript `as const` for viem type inference
- ✓ Mock UI: Mint flow (4-step), Redeem flow (5-step with KYC), Trade (swap widget), Portfolio (holdings/orders), Market pages (caliber detail + price charts)
- ✓ Database schema: User (wallet-based), Order (mint/redeem tracking), ShippingAddress, Inventory, AuditLog — Prisma + Neon PostgreSQL
- ✓ Shared types package: Caliber specs, fee constants, chain config, contract addresses, restricted states
- ✓ Monorepo: Turborepo + pnpm workspaces with build dependency graph
- ✓ Worker skeleton: viem public client, Prisma connection, connects to Avalanche
- ✓ Contracts deployed to Fuji with all addresses in shared config — v1.0
- ✓ Real wallet connection (MetaMask) with network switching and balance display — v1.0
- ✓ Mint flow wired to real contract calls (USDC approval + startMint) — v1.0
- ✓ Redeem flow wired to real contract calls (token approval + startRedeem) — v1.0
- ✓ Event indexer with crash recovery (BlockCursor, 4 event types, 4 markets) — v1.0
- ✓ Admin dashboard with keeper gate, order queues, finalizeMint/finalizeRedeem — v1.0
- ✓ 9 API routes serving real data (orders, balances, market, shipping, KYC, admin, stats) — v1.0
- ✓ Portfolio reads on-chain balances and DB order history — v1.0
- ✓ All mock data eliminated — v1.0

### Active

<!-- Current milestone: v1.1 End-to-End Flow Fix -->

- [ ] Auto-create user record in database when wallet connects for the first time
- [ ] Add deployment start block (51699730) to shared config
- [ ] Fix worker to use deployment block as floor — never scan below it
- [ ] Verify full mint flow works end-to-end (connect → mint → indexed → visible in portfolio)

### Out of Scope

- Real KYC provider integration (Persona, Jumio) — auto-approve sufficient for testnet
- Mainnet deployment — Fuji validated, mainnet when ready for production
- Real Ammo Squared API integration — admin manually handles procurement
- Price oracle contract implementation — keeper supplies price at finalization
- Mobile app — web only, PWA possible later
- Real-time chat or notifications — not needed for MVP
- Uniswap pool creation/LP UI — users handle this via Uniswap directly
- Batch keeper operations — single order finalization sufficient for MVP

## Current Milestone: v1.1 End-to-End Flow Fix

**Goal:** Fix critical gaps that prevent the v1.0 mint flow from working end-to-end — user creation on wallet connect and worker event indexing from the correct starting block.

**Target features:**
- Auto user registration on wallet connect
- Deployment start block in shared config (51699730)
- Worker backfill from deployment block instead of genesis
- Verified end-to-end mint flow

## Current State

**Shipped:** v1.0 Fuji Testnet Integration (2026-02-11)
**Codebase:** ~22,876 LOC TypeScript across apps/web, apps/worker, packages/shared, packages/db, packages/contracts

The full DeFi protocol is functional on Avalanche Fuji testnet:
- 13 contracts deployed and verified (AmmoManager, AmmoFactory, 4 CaliberMarkets, 4 AmmoTokens, MockUSDC, 4 MockPriceOracles)
- Event indexer polls chain events into PostgreSQL with crash recovery
- Frontend connects real wallets, executes real transactions, displays real data
- Admin dashboard enables keeper finalization with protocol health monitoring
- Zero mock data remains — all displays read from chain or database

**Known gaps (discovered during manual testing):**
- No user auto-creation on wallet connect — users only get DB records when worker processes their first event
- Worker backfill starts from block 0 instead of deployment block — scans 51M+ empty blocks before finding events
- Block cursor advances through empty blocks, wasting RPC calls on pre-deployment blocks

## Context

**Protocol Design:**
- 4 supported calibers: 9MM (115gr FMJ), 556 (55gr FMJ), 22LR (40gr), 308 (147gr FMJ)
- 1 token = 1 round of ammunition, 18 decimals
- Fees: 1.5% mint, 1.5% redeem (150 BPS, max 500 BPS hard cap)
- Minimum orders: 9MM/556/308 = 50 rounds, 22LR = 100 rounds
- Restricted states (no redemption): CA, NY, IL, DC, NJ
- Supplier: Ammo Squared — admin purchases ammo off-chain after mint orders

**Architecture (validated in v1.0):**
- 2-step settlement: user initiates → admin (keeper) finalizes. Human-in-the-loop for off-chain procurement.
- Worker role: event indexer only. Writes chain events to DB. Does NOT auto-finalize.
- Admin finalization: admin reviews order in dashboard, purchases from Ammo Squared, clicks Finalize. Contract call made from admin's keeper wallet via browser (wagmi).
- API layer: Next.js API routes (not separate worker API). TanStack Query on client hits route handlers.
- Admin UI: wallet-gated /admin/* routes in same Next.js app. Keeper wallet = admin access. Contract access control IS the auth (finalizeMint reverts for non-keepers anyway).

## Constraints

- **Chain**: Avalanche Fuji testnet (chainId 43113) — need test AVAX for gas, test USDC for minting
- **Deployment**: Vercel (frontend), Railway (worker), Neon (database)
- **Stack**: Must use existing tech — Next.js 15, wagmi/viem, Prisma, Foundry. No new frameworks.
- **Access Control**: AmmoManager contract governs keeper/owner/guardian roles on-chain. Admin UI gates on same wallet addresses.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Fuji testnet first | Validate full flow before mainnet costs/risks | ✓ Good — full stack validated on Fuji |
| Next.js API routes over separate API server | Single deployment, shared DB access, simpler stack | ✓ Good — 9 routes, clean separation |
| Admin in same app (/admin/*) | Shares wagmi setup, Prisma, UI components. 1-2 admin wallets don't justify separate app | ✓ Good — code reuse worked well |
| Worker as indexer, not keeper | Admin must review and trigger finalization. Human-in-the-loop for off-chain procurement | ✓ Good — clean separation of concerns |
| Admin auth = wallet address check | Contract already reverts for non-keepers. Middleware is UX, not security | ✓ Good — client-side gate, contract enforces |
| TanStack Query for frontend data | Already in stack. API routes return JSON, client caches and refreshes | ✓ Good — 30s auto-refresh in admin tables |
| Hand-rolled MockUSDC (not OpenZeppelin) | Match project convention, minimal dependencies | ✓ Good — simple and works |
| Polling-based indexer over WebSocket | getContractEvents more reliable than watchContractEvent for batch processing | ✓ Good — crash recovery via BlockCursor |
| Bidirectional caliber mapping | Bridge Prisma naming constraints (NINE_MM) to shared types (9MM) | ✓ Good — zero type mismatches across 6 phases |
| Explicit return types on hooks | Prevent TS2742 non-portable type inference errors | ✓ Good — all hooks compile across packages |
| parseUnits for X18 price conversion | Human-readable price input converted to contract format | ✓ Good — "0.35" → 350000000000000000n |

---
*Last updated: 2026-02-11 after v1.1 milestone start*
