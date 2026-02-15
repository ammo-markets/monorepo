# Ammo Exchange

## What This Is

A DeFi protocol for tokenized ammunition trading on Avalanche. Users deposit USDC to mint ERC20 tokens backed 1:1 by physical ammunition stored in insured warehouses via Ammo Squared. Token holders can trade on Uniswap pools or redeem tokens for physical delivery (US only, KYC required). The protocol provides global price exposure to the U.S. ammunition market -- anyone with USDC can speculate on ammo prices, just like USDC gives USD exposure without a bank account.

## Core Value

Anyone worldwide can get price exposure to U.S. ammunition by minting ammo tokens with USDC, while only verified U.S. residents in allowed states can redeem for physical delivery.

## Requirements

### Validated

<!-- Shipped and confirmed valuable. -->

- ✓ Smart contracts: CaliberMarket (2-step mint/redeem), AmmoToken (ERC20), AmmoFactory, AmmoManager (access control) -- audited
- ✓ Contract ABIs exported as TypeScript `as const` for viem type inference
- ✓ Mock UI: Mint flow (4-step), Redeem flow (5-step with KYC), Trade (swap widget), Portfolio (holdings/orders), Market pages (caliber detail + price charts)
- ✓ Database schema: User (wallet-based), Order (mint/redeem tracking), ShippingAddress, Inventory, AuditLog -- Prisma + Neon PostgreSQL
- ✓ Shared types package: Caliber specs, fee constants, chain config, contract addresses, restricted states
- ✓ Monorepo: Turborepo + pnpm workspaces with build dependency graph
- ✓ Worker skeleton: viem public client, Prisma connection, connects to Avalanche
- ✓ Contracts deployed to Fuji with all addresses in shared config -- v1.0
- ✓ Real wallet connection (MetaMask) with network switching and balance display -- v1.0
- ✓ Mint flow wired to real contract calls (USDC approval + startMint) -- v1.0
- ✓ Redeem flow wired to real contract calls (token approval + startRedeem) -- v1.0
- ✓ Event indexer with crash recovery (BlockCursor, 4 event types, 4 markets) -- v1.0
- ✓ Admin dashboard with keeper gate, order queues, finalizeMint/finalizeRedeem -- v1.0
- ✓ 9 API routes serving real data (orders, balances, market, shipping, KYC, admin, stats) -- v1.0
- ✓ Portfolio reads on-chain balances and DB order history -- v1.0
- ✓ All mock data eliminated -- v1.0
- ✓ Auto-create user record on wallet connect -- v1.1
- ✓ Deployment block floor in shared config (51699730) -- v1.1
- ✓ Worker scans from deployment block instead of genesis -- v1.1
- ✓ SIWE authentication with server-side session verification on all API routes -- v1.2
- ✓ Admin API routes protected server-side (requireKeeper, not just UI-gated) -- v1.2
- ✓ KYC endpoint gated behind environment check (testnet auto-approve only) -- v1.2
- ✓ Shipping address endpoint verifies order ownership -- v1.2
- ✓ Worker handles all 11 CaliberMarket events (MintRefunded, RedeemCanceled, Paused, Unpaused, fee updates) -- v1.2
- ✓ Worker RPC calls with retry logic and exponential backoff -- v1.2
- ✓ Worker chain reorg protection (5-block confirmation window) -- v1.2
- ✓ Worker env variable validation at startup (fail-fast) -- v1.2
- ✓ Worker graceful shutdown with in-flight poll drain -- v1.2
- ✓ All components migrated from useEffect+fetch to TanStack Query -- v1.2
- ✓ Wallet registration race condition fixed (Prisma Serializable transaction) -- v1.2
- ✓ API rate limiting (100 req/min per IP) -- v1.2
- ✓ CORS origin whitelist via ALLOWED_ORIGINS -- v1.2
- ✓ Type safety fixes (zero as-any casts, typed interfaces) -- v1.2
- ✓ Transaction hooks use idiomatic enabled flags -- v1.2
- ✓ Fee constants from shared package -- v1.2
- ✓ React Error Boundaries on all 7 route segments -- v1.2
- ✓ TanStack Query cache invalidation after admin mutations -- v1.2
- ✓ Silent error swallowing eliminated -- v1.2
- ✓ Server-side admin page protection (non-keepers see 404) -- v1.2
- ✓ KYC identity data collection (name, DOB, state, gov ID) -- v1.2
- ✓ User profile page with wallet info, KYC status, shipping address -- v1.2

### Active

## Current Milestone: v1.3 UX Restructure & Data Enrichment

**Goal:** Split the app into a public landing site and a wallet-connected app with clean 4-tab navigation, enriched database for protocol stats/activity/preferences, and unified trade experience.

**Target features:**
- Public landing page (hero, how-it-works, caliber showcase, FAQ, Launch App CTA)
- App shell with 4-tab nav: Dashboard, Trade, Portfolio, Profile
- Personal dashboard with token balances and recent orders
- Unified Trade page (mint/redeem/swap with inline caliber info and current prices)
- Protocol stats tables (aggregate minting volume, user counts, TVL)
- Rich activity log (human-readable transaction history with status changes)
- User preferences (favorite calibers, display settings)

### Out of Scope

- Real KYC provider integration (Persona, Jumio) -- auto-approve sufficient for testnet
- Mainnet deployment -- Fuji validated, mainnet when ready for production
- Real Ammo Squared API integration -- admin manually handles procurement
- Price oracle contract implementation -- keeper supplies price at finalization
- Mobile app -- web only, PWA possible later
- Real-time chat or notifications -- not needed for MVP
- Uniswap pool creation/LP UI -- users handle this via Uniswap directly
- Batch keeper operations -- single order finalization sufficient for MVP

## Current State

**Shipped:** v1.2 Production Hardening (2026-02-15)
**Codebase:** ~22,597 LOC TypeScript across apps/web, apps/worker, packages/shared, packages/db, packages/contracts

The full DeFi protocol is functional on Avalanche Fuji testnet with production-grade security and reliability:
- 13 contracts deployed and verified (AmmoManager, AmmoFactory, 4 CaliberMarkets, 4 AmmoTokens, MockUSDC, 4 MockPriceOracles)
- SIWE wallet authentication on all API routes with iron-session cookies
- Server-side admin protection (non-keepers see 404, requireKeeper on API routes)
- Event indexer handles all 11 contract events with retry, reorg protection, and graceful shutdown
- All frontend components on TanStack Query with error boundaries on every route segment
- KYC identity collection, user profile with shipping address management
- CORS origin whitelist and rate limiting middleware
- Zero as-any casts, zero unused imports, typed interfaces throughout

## Context

**Protocol Design:**
- 4 supported calibers: 9MM (115gr FMJ), 556 (55gr FMJ), 22LR (40gr), 308 (147gr FMJ)
- 1 token = 1 round of ammunition, 18 decimals
- Fees: 1.5% mint, 1.5% redeem (150 BPS, max 500 BPS hard cap)
- Minimum orders: 9MM/556/308 = 50 rounds, 22LR = 100 rounds
- Restricted states (no redemption): CA, NY, IL, DC, NJ
- Supplier: Ammo Squared -- admin purchases ammo off-chain after mint orders

**Architecture (validated through v1.2):**
- 2-step settlement: user initiates -> admin (keeper) finalizes. Human-in-the-loop for off-chain procurement.
- Worker role: event indexer only. Writes chain events to DB. Does NOT auto-finalize. Handles all 11 CaliberMarket events.
- Admin finalization: admin reviews order in dashboard, purchases from Ammo Squared, clicks Finalize. Contract call made from admin's keeper wallet via browser (wagmi).
- API layer: Next.js API routes (not separate worker API). TanStack Query on client hits route handlers. All routes SIWE-authenticated.
- Admin UI: wallet-gated /admin/* routes in same Next.js app. Server-side layout protection + requireKeeper on API routes.
- Auth: SIWE (Sign-In with Ethereum) -> iron-session cookie -> requireSession/requireKeeper helpers.

## Constraints

- **Chain**: Avalanche Fuji testnet (chainId 43113) -- need test AVAX for gas, test USDC for minting
- **Deployment**: Vercel (frontend), Railway (worker), Neon (database)
- **Stack**: Must use existing tech -- Next.js 15, wagmi/viem, Prisma, Foundry. No new frameworks.
- **Access Control**: AmmoManager contract governs keeper/owner/guardian roles on-chain. Admin UI gates on same wallet addresses.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Fuji testnet first | Validate full flow before mainnet costs/risks | ✓ Good -- full stack validated on Fuji |
| Next.js API routes over separate API server | Single deployment, shared DB access, simpler stack | ✓ Good -- 15 routes, clean separation |
| Admin in same app (/admin/*) | Shares wagmi setup, Prisma, UI components. 1-2 admin wallets don't justify separate app | ✓ Good -- code reuse worked well |
| Worker as indexer, not keeper | Admin must review and trigger finalization. Human-in-the-loop for off-chain procurement | ✓ Good -- clean separation of concerns |
| SIWE + iron-session for auth | Wallet-native auth, no passwords, server-side session verification | ✓ Good -- cookies() pattern, no request param |
| Server-side admin protection | notFound() in async layout, no content flash for non-keepers | ✓ Good -- defense in depth |
| TanStack Query for frontend data | Centralized caching, automatic retries, cache invalidation on mutations | ✓ Good -- 15 components migrated, zero raw fetch |
| viem built-in retry transport | Native exponential backoff for RPC, no custom wrapper needed | ✓ Good -- handles 429/5xx/timeouts |
| 5-block reorg confirmation window | Avalanche ~10s margin, idempotent handlers make re-processing safe | ✓ Good -- conservative but cheap |
| In-memory rate limiter | Sufficient for testnet, Redis upgrade documented for production | ✓ Good -- simple and effective |
| Polling-based indexer over WebSocket | getContractEvents more reliable than watchContractEvent for batch processing | ✓ Good -- crash recovery via BlockCursor |
| Bidirectional caliber mapping | Bridge Prisma naming constraints (NINE_MM) to shared types (9MM) | ✓ Good -- zero type mismatches |
| Explicit return types on hooks | Prevent TS2742 non-portable type inference errors | ✓ Good -- all hooks compile across packages |

---
*Last updated: 2026-02-15 after v1.3 milestone started*
