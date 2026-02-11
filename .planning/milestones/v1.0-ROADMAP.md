# Roadmap: Ammo Exchange -- Fuji Testnet Integration

## Overview

This roadmap delivers a fully functional DeFi protocol on Avalanche Fuji testnet, transforming an existing mock UI and audited smart contracts into a real end-to-end system. The work proceeds bottom-up: deploy contracts, index events to the database, expose data via API routes and wallet connection, wire user-facing mint/redeem flows, integrate portfolio reads, and finally build the admin dashboard for keeper operations. Each phase depends on the one below it -- contracts must exist before events can be indexed, the database must be populated before APIs return data, and the full stack must work before admin finalization makes sense.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Foundation** - Deploy contracts to Fuji and migrate database schema
- [x] **Phase 2: Event Indexer** - Worker indexes on-chain events to database
- [x] **Phase 3: Wallet and API Layer** - Real wallet connection and data access routes
- [x] **Phase 4: Mint and Redeem Flows** - Wire contract interactions from the UI
- [x] **Phase 5: Portfolio and Data Integration** - Replace all mock data with real reads
- [x] **Phase 6: Admin Dashboard** - Keeper operations for order finalization

## Phase Details

### Phase 1: Foundation
**Goal**: Contracts are deployed on Fuji with all addresses in shared config, and the database schema supports the full data model
**Depends on**: Nothing (first phase)
**Requirements**: DEPLOY-01, DEPLOY-02, DEPLOY-03, DEPLOY-04, DB-01, DB-02, DB-03
**Success Criteria** (what must be TRUE):
  1. All contracts (AmmoManager, AmmoFactory, 4 CaliberMarkets, 4 AmmoTokens, mock USDC) are deployed and verified on Snowtrace Fuji
  2. Shared config exports correct Fuji addresses for every contract, and importing packages resolve them without errors
  3. Mock USDC contract has exactly 6 decimals and a faucet function for testnet minting
  4. Database schema is migrated to Neon with Order.onChainOrderId field and BlockCursor table present
  5. Treasury and keeper roles are set on-chain -- a test startMint call does not revert with TreasuryNotSet or access control errors
**Plans**: 2 plans

Plans:
- [x] 01-01-PLAN.md -- MockUSDC, MockPriceOracle, DeployFuji.s.sol, Makefile, foundry.toml (wave 1)
- [x] 01-02-PLAN.md -- Shared config with Fuji addresses, caliber mapping, Prisma schema migration (wave 2)

### Phase 2: Event Indexer
**Goal**: The worker reliably indexes all on-chain settlement events into the database with crash recovery
**Depends on**: Phase 1
**Requirements**: INDEX-01, INDEX-02, INDEX-03, INDEX-04
**Success Criteria** (what must be TRUE):
  1. Worker detects MintStarted, MintFinalized, RedeemRequested, and RedeemFinalized events across all 4 CaliberMarket contracts and writes corresponding Order records to the database
  2. Each Order record includes the on-chain order ID, transaction hash, block number, caliber, user address, amounts, and current status
  3. Worker stores its last processed block in the BlockCursor table and resumes from that checkpoint after restart without missing or duplicating events
  4. Worker backfills all events from the last checkpoint to the current block on startup before entering its polling loop
**Plans**: 2 plans

Plans:
- [x] 02-01-PLAN.md -- Viem client, constants, cursor helpers, mint and redeem event handlers (wave 1)
- [x] 02-02-PLAN.md -- Indexer core with polling loop, backfill, and entry point rewrite (wave 2)

### Phase 3: Wallet and API Layer
**Goal**: Users can connect wallets and the app serves real data from the database and chain
**Depends on**: Phase 2
**Requirements**: WALLET-01, WALLET-02, WALLET-03, WALLET-04, API-01, API-02, API-03, API-04, API-05
**Success Criteria** (what must be TRUE):
  1. User can connect MetaMask (or injected provider) and sees their wallet address in the UI header
  2. User can disconnect wallet from any page, and the UI reverts to the disconnected state
  3. App detects wrong network and prompts the user to switch to Fuji -- switching succeeds without page reload
  4. Connected user sees their USDC balance and per-caliber ammo token balances read from the chain
  5. API routes return real data: GET /api/orders filters by wallet, GET /api/balances returns on-chain balances, GET /api/market returns worker-computed prices, POST /api/redeem/shipping persists a shipping address
**Plans**: 2 plans

Plans:
- [x] 03-01-PLAN.md -- Wallet hooks, WalletButton component, navbar rewrite with real wagmi state (wave 1)
- [x] 03-02-PLAN.md -- Server-side viem client, 5 API route handlers: orders, balances, market, shipping (wave 1)

### Phase 4: Mint and Redeem Flows
**Goal**: Users can execute real mint and redeem transactions from the UI with full status feedback
**Depends on**: Phase 3
**Requirements**: MINT-01, MINT-02, MINT-03, MINT-04, MINT-05, REDEEM-01, REDEEM-02, REDEEM-03, REDEEM-04, REDEEM-05
**Success Criteria** (what must be TRUE):
  1. User can approve USDC spending and call startMint for any caliber -- tokens appear in their wallet after admin finalization
  2. User can call startRedeem for any caliber, submit a shipping address, and see their KYC status as auto-approved
  3. User sees real-time transaction status (pending, confirming, confirmed, failed) during both mint and redeem flows
  4. User sees a Snowtrace explorer link for every submitted transaction
  5. Contract reverts, wallet rejections, insufficient balances, and deadline expiry produce clear, human-readable error messages -- the UI never shows raw hex or silently fails
**Plans**: 2 plans

Plans:
- [x] 04-01-PLAN.md -- Shared utilities (errors, tx-utils, allowance hook), mint transaction hook, mint-flow.tsx rewire (wave 1)
- [x] 04-02-PLAN.md -- Redeem transaction hook, KYC API route, redeem-flow.tsx rewire (wave 2)

### Phase 5: Portfolio and Data Integration
**Goal**: All mock data is replaced with real database queries and on-chain reads across the entire app
**Depends on**: Phase 4
**Requirements**: PORT-01, PORT-02, PORT-03, DB-04
**Success Criteria** (what must be TRUE):
  1. Portfolio page shows real on-chain token balances per caliber via AmmoToken.balanceOf multicall
  2. Portfolio page shows order history from the database with current status (pending, finalized, failed)
  3. User can click into an order detail page showing on-chain transaction links to Snowtrace and full order metadata
  4. No mock data remains in the app -- every data display (balances, orders, prices, market stats) reads from the chain or database
**Plans**: 2 plans

Plans:
- [x] 05-01-PLAN.md -- Extract types, rewire portfolio dashboard and order detail with real data (wave 1)
- [x] 05-02-PLAN.md -- Replace all remaining mock-data imports, create /api/activity, delete mock-data.ts (wave 2)

### Phase 6: Admin Dashboard
**Goal**: Keepers can manage the protocol -- review pending orders, finalize settlements, and monitor protocol health
**Depends on**: Phase 5
**Requirements**: ADMIN-01, ADMIN-02, ADMIN-03, ADMIN-04, ADMIN-05, ADMIN-06
**Success Criteria** (what must be TRUE):
  1. Non-keeper wallets are blocked from /admin/* routes via middleware -- they see an access denied message, not a broken page
  2. Admin sees a queue of pending mint orders showing user address, USDC amount, caliber, and timestamp with sorting and filtering
  3. Admin sees a queue of pending redeem orders showing user address, token amount, caliber, shipping address, and KYC status
  4. Admin can trigger finalizeMint with an actualPriceX18 parameter and finalizeRedeem from the dashboard -- the transaction confirms and the order status updates
  5. Admin sees protocol stats: total minted per caliber, total redeemed, and treasury USDC balance read from the chain
**Plans**: 2 plans

Plans:
- [x] 06-01-PLAN.md -- Admin hooks, layout gate, sidebar, API route, and order queue pages (wave 1)
- [x] 06-02-PLAN.md -- Finalize hooks, dialogs, protocol stats API and dashboard (wave 2)

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4 -> 5 -> 6

| Phase | Plans Complete | Status | Completed |
|-------|---------------|--------|-----------|
| 1. Foundation | 2/2 | Complete | 2026-02-11 |
| 2. Event Indexer | 2/2 | Complete | 2026-02-11 |
| 3. Wallet and API Layer | 2/2 | Complete | 2026-02-11 |
| 4. Mint and Redeem Flows | 2/2 | Complete | 2026-02-11 |
| 5. Portfolio and Data Integration | 2/2 | Complete | 2026-02-11 |
| 6. Admin Dashboard | 2/2 | Complete | 2026-02-11 |

---
*Roadmap created: 2026-02-10*
*Last updated: 2026-02-11 (Phase 6 complete — all phases done)*
