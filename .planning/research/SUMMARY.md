# Project Research Summary

**Project:** Ammo Exchange
**Domain:** DeFi protocol integration -- tokenized RWA (physical ammunition) on Avalanche
**Researched:** 2026-02-10
**Confidence:** HIGH

## Executive Summary

Ammo Exchange is a 2-step settlement DeFi protocol where users deposit USDC to mint ERC20 tokens backed 1:1 by physical ammunition, and a human keeper finalizes orders after off-chain procurement. The existing codebase has all the raw materials -- audited smart contracts, a complete mock UI, a database schema, and a worker skeleton -- but none of them are wired together. The milestone is clear: deploy contracts to Avalanche Fuji, connect every layer (chain, worker, database, API, frontend, admin), and replace all mock data with real on-chain and off-chain reads.

The recommended approach is to build strictly bottom-up: deploy contracts and update shared config first, then build the event indexer (the backbone that populates the database), then API routes (data access layer), then wire the frontend, and finally build the admin dashboard. This order is non-negotiable because each layer depends on the one below it. The existing stack (Next.js 15, wagmi 2.x, viem, Prisma 7, Foundry, Bun worker) is correct and requires almost no changes -- only `@wagmi/connectors` needs to be added as a new dependency. Do not upgrade wagmi to v3, Next.js to 16, or add Ponder/The Graph. The stack is right; the work is wiring, not tooling.

The dominant risk is the event indexer silently dying without anyone noticing, leaving user funds locked in contracts with no corresponding database records. viem's `watchContractEvent` is unreliable on public Avalanche endpoints. The worker must use a polling-based `getContractEvents` loop with persistent block checkpoints, not real-time watchers. The second major risk is decimal scaling errors -- USDC has 6 decimals, AmmoToken has 18, and oracle prices use 18-decimal fixed-point. Every contract interaction must use viem's `parseUnits`/`formatUnits` with the correct decimal parameter. Third, the deployment script must be comprehensive: deploy mock USDC (6 decimals), set treasury, set keeper, and output all addresses atomically. Missing any step (especially `setTreasury`) causes silent failures during finalization.

## Key Findings

### Recommended Stack

The existing stack is production-ready for this milestone. No major dependency changes are needed. The only addition is `@wagmi/connectors` for wallet connection setup. Every other package stays at its current version range.

**Core technologies:**
- **Foundry (forge):** Contract deployment to Fuji -- already configured, use `--slow` flag for Avalanche's fast finality
- **wagmi 2.x + viem 2.x:** Frontend contract interaction -- stay on v2; ecosystem (RainbowKit, ConnectKit) has inconsistent v3 support
- **Next.js 15 App Router:** Dashboard + API routes -- Server Components for data display, Client Components for wallet interaction
- **Prisma 7 + Neon PostgreSQL:** Off-chain data persistence -- existing schema covers orders, users, audit logs
- **Bun worker + viem:** Event indexer -- custom `getContractEvents` polling loop, not Ponder or The Graph
- **Bare wagmi (no RainbowKit):** Wallet connection UI -- simple `useConnect`/`useDisconnect` hooks sufficient for testnet
- **Zod 4:** API route validation -- already installed, use for all route handler input parsing

**Do NOT add:** RainbowKit, Ponder, The Graph, ethers.js, tRPC, wagmi v3, Next.js 16.

### Expected Features

**Must have (table stakes) -- user-facing:**
- Wallet connection with chain switching to Fuji
- Real ERC20 token balances (multicall `balanceOf` for all calibers + USDC)
- Mint flow with real USDC approval + `startMint()` contract calls
- Redeem flow with real token approval + `startRedeem()` contract calls
- Order status tracking from database (populated by worker)
- Transaction hash links to Snowtrace explorer
- Oracle price display with proper decimal scaling
- Fee transparency (read `mintFeeBps`/`redeemFeeBps` from contract)

**Must have (table stakes) -- admin:**
- Wallet-gated admin access (`isKeeper` check)
- Pending order queue (filterable by status/type)
- Finalize/refund mint actions with price input
- Finalize/cancel redeem actions
- Protocol stats overview (total minted, fees collected, treasury balance)

**Should have (differentiators) -- build after core works:**
- Proof of reserves dashboard (on-chain supply vs. off-chain inventory)
- Activity feed (recent protocol activity for social proof)
- Admin audit trail (every keeper action logged with tx hash)

**Defer to v2+:**
- KYC provider integration (Persona/Jumio) -- auto-approve for testnet
- Push notifications for order status changes
- Price charts with historical data
- DEX swap widget with real Uniswap integration
- Fiat on-ramp, cross-chain bridging, mobile app, governance

### Architecture Approach

The system is a six-component integration: smart contracts emit events, the worker indexes events to the database, API routes serve database data to the frontend, the frontend reads on-chain state directly via wagmi and off-chain state via API routes, and the admin dashboard triggers keeper contract calls from the browser. The worker is strictly an indexer -- it never calls finalization functions. The admin human reviews orders, procures ammunition off-chain, and triggers finalization from the browser using their keeper wallet. The database is a read-optimized cache of enriched off-chain data; the chain is the source of truth for settlement state.

**Major components:**
1. **Smart Contracts (Fuji)** -- settlement logic, token minting/burning, fee distribution, access control
2. **Event Indexer Worker (Railway)** -- chain-to-database bridge; watches 6 event types across 4 CaliberMarket contracts
3. **PostgreSQL via Prisma (Neon)** -- off-chain state: users, orders, shipping, audit logs, inventory
4. **Next.js API Routes (Vercel)** -- thin data-access wrappers for frontend consumption
5. **Frontend UI (Vercel)** -- wallet interaction, transaction submission, data display
6. **Admin Dashboard (Vercel, same app)** -- keeper operations UI for order finalization

### Critical Pitfalls

1. **Event listener silently dies (P1, CRITICAL)** -- viem's `watchContractEvent` drops filters on public Avalanche endpoints without error. Use polling-based `getContractEvents` with persistent `lastProcessedBlock` stored in database. Add heartbeat checks and gap detection.

2. **USDC approval UX breaks mint flow (P2, HIGH)** -- Two sequential transactions (approve + startMint) create multiple failure modes. Always check current allowance before prompting approval. Wait for approval receipt before enabling mint. Parse CaliberMarket custom errors for human-readable messages.

3. **No official USDC on Fuji (P3, HIGH)** -- Must deploy mock USDC with exactly 6 decimals. If decimals are wrong, all price calculations are off by 10^12. Deploy script must set treasury address or first `finalizeMint` reverts with `TreasuryNotSet`.

4. **Admin gas and nonce issues (P4, HIGH)** -- Browser-based finalization has unreliable gas estimation on Fuji. Set explicit gas limit (500k). Show keeper AVAX balance on admin dashboard. Add price calculation helper to prevent `actualPriceX18` unit errors.

5. **On-chain and off-chain state diverge (P6, MEDIUM-HIGH)** -- Worker misses events, DB update fails after finalization, or chain reorg causes discrepancy. Treat on-chain as canonical. Upsert orders on finalization events (create if missing). Add reconciliation job comparing `nextOrderId` against DB count.

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Foundation -- Contracts and Config

**Rationale:** Everything depends on deployed contracts and correct addresses in the shared config. The schema also needs new fields (`onChainOrderId`, `marketAddress`, `BlockCheckpoint` model) before the worker can write data.
**Delivers:** Deployed contracts on Fuji, updated `CONTRACT_ADDRESSES.fuji` with all addresses (AmmoManager, AmmoFactory, 4x CaliberMarket, 4x AmmoToken, mock USDC, mock oracle), database migration with new fields.
**Addresses:** Contract deployment (PROJECT.md active requirement), shared config update
**Avoids:** P3 (USDC decimal mismatch) by deploying mock USDC with 6 decimals; P8 (hardcoded addresses) by restructuring config to include market + token per caliber; P3 (`TreasuryNotSet`) by setting treasury in deploy script.

### Phase 2: Event Indexer Worker

**Rationale:** The worker populates the database. API routes, the portfolio page, the admin order queue, and protocol stats all need data in the database. Without the indexer, the rest of the app has nothing to display.
**Delivers:** Working Bun worker that watches all 6 CaliberMarket events across 4 markets, writes orders/users/audit logs to Prisma, recovers from restarts using persistent block checkpoints.
**Addresses:** Features 1.8 (worker event indexing)
**Avoids:** P1 (silent watcher death) by using polling `getContractEvents` instead of `watchContractEvent`; P11 (crash recovery) by storing `lastProcessedBlock` and processing in Prisma transactions; P6 (state divergence) by upserting orders on finalization events.

### Phase 3: API Routes

**Rationale:** The frontend needs API routes to query off-chain data (orders, users, market stats). These are thin Prisma wrappers that depend on the worker having populated the database.
**Delivers:** REST endpoints for orders, markets, portfolio, admin order queue, admin stats, and shipping address submission. Zod validation on all inputs.
**Addresses:** Features 1.5 (order status tracking), 2.2 (pending order queue), 2.5 (protocol stats)
**Avoids:** P5 (connection pooling) by using Neon pooled connection string and `connection_limit=1` for serverless.

### Phase 4: Frontend Wiring

**Rationale:** With contracts deployed, events indexed, and API routes serving data, the frontend can replace all mock data with real reads. Wallet connection is the foundation; token balances and prices come next; then transaction flows.
**Delivers:** Real wallet connection, on-chain token/USDC balances, oracle prices, mint flow with USDC approval + `startMint`, redeem flow with token approval + `startRedeem`, order status from API, tx hash links to Snowtrace.
**Addresses:** Features 1.1 (wallet connection), 1.2 (balances), 1.3 (mint flow), 1.4 (redeem flow), 1.5 (order status), 1.6 (tx links), 1.7 (oracle price), 1.9 (fee transparency)
**Avoids:** P2 (approval UX) by checking allowance first and waiting for approval receipt; P7 (SSR hydration) by keeping wallet hooks in client components and using `useState` for QueryClient; P9 (deadline) by setting 7-day deadline; P10 (mock data leak) by incrementally replacing mocks with gated `NEXT_PUBLIC_USE_MOCKS` flag; P14 (decimal scaling) by creating shared `parseUnits`/`formatUnits` utility functions.

### Phase 5: Admin Dashboard

**Rationale:** The admin dashboard depends on everything: deployed contracts (to call finalize), indexed events (to see pending orders), API routes (to query orders), and wagmi (to submit keeper transactions). Build this last.
**Delivers:** Wallet-gated `/admin` layout, pending order queue with filters, finalize/refund mint actions with price calculator, finalize/cancel redeem actions, protocol stats overview, audit trail display.
**Addresses:** Features 2.1 (admin gate), 2.2 (order queue), 2.3 (finalize/refund mint), 2.4 (finalize/cancel redeem), 2.5 (protocol stats), 3.7 (audit trail)
**Avoids:** P4 (gas/nonce) by setting explicit gas limits and showing AVAX balance; P12 (auth UX) by checking `isKeeper` on page load and showing status in header; P13 (ABI staleness) by ensuring `contracts:build` runs before dev/build.

### Phase 6: Differentiators (Post-MVP Polish)

**Rationale:** These features add trust and polish but are not required for the Fuji testnet milestone to be functional. Build them after the core mint-trade-redeem loop works end-to-end.
**Delivers:** Dynamic proof of reserves, activity feed, price charts, enhanced audit trail.
**Addresses:** Features 3.1 (proof of reserves), 3.5 (activity feed), 3.3 (price charts)

### Phase Ordering Rationale

- **Bottom-up is mandatory:** Each layer depends on the one below it. Contracts must exist before the worker can index events. The worker must populate the database before API routes return data. API routes must serve data before the frontend can display it. The frontend must work before the admin dashboard makes sense.
- **Worker before frontend:** The worker is the backbone that connects on-chain activity to the database. Without it, the portfolio page, order tracking, admin queue, and protocol stats all show empty data. Building the worker early means data is available for every subsequent phase.
- **Admin last, not first:** The admin dashboard is the most complex phase (forms, contract writes, price calculations, multi-step workflows) and depends on all other layers working. Building it last means fewer "works in isolation but fails in integration" bugs.
- **Differentiators are separate:** Proof of reserves, activity feed, and price charts are valuable but orthogonal to the core settlement flow. They can be built in parallel or deferred without blocking testnet validation.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 1 (Foundation):** The deployment script is the highest-risk deliverable. Must handle mock USDC, mock oracle, correct constructor params, role setup, and address export atomically. Research the existing `MockERC20.sol` and Foundry broadcast artifact format.
- **Phase 2 (Worker):** viem's event watching reliability on Avalanche public endpoints is the project's biggest technical risk. Need to validate the polling pattern with actual Fuji RPC behavior, test crash recovery, and measure block lag.
- **Phase 5 (Admin):** The `actualPriceX18` calculation for `finalizeMint` is easy to get wrong. Need to research the exact formula: how does the contract compute token amounts from USDC and price, and how should the admin UI reverse-engineer the expected output to validate the input.

Phases with standard patterns (skip additional research):
- **Phase 3 (API Routes):** Standard Next.js route handlers + Prisma queries. Well-documented, established patterns.
- **Phase 4 (Frontend Wiring):** wagmi hooks (`useWriteContract`, `useReadContract`, `useWaitForTransactionReceipt`) are well-documented. The existing mock UI provides the component structure -- just swap data sources.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Existing stack is correct. Research confirms no changes needed except adding `@wagmi/connectors`. All version decisions are well-justified with specific rationale for staying vs. upgrading. |
| Features | HIGH | Clear separation of table stakes vs. differentiators. Feature dependency graph is well-mapped. Existing mock UI provides exact scope for what needs wiring. |
| Architecture | HIGH | Six-component architecture with clear boundaries matches the existing codebase structure. Data flows are fully documented for both mint and redeem paths. Worker-as-indexer and admin-as-keeper pattern is explicitly defined in PROJECT.md. |
| Pitfalls | HIGH | 15 pitfalls identified with specific warning signs and prevention strategies. The most critical ones (silent watcher death, USDC decimals, state divergence) have actionable mitigations. References to actual viem GitHub issues add credibility. |

**Overall confidence:** HIGH

### Gaps to Address

- **Mock USDC behavior vs. mainnet USDC:** The project will use a custom mock USDC on Fuji. Need to verify it matches mainnet Avalanche USDC (6 decimals, standard ERC20 returns). The existing `MockERC20.sol` in the test directory should be checked for configurable decimals.
- **Fuji WebSocket RPC availability:** The worker ideally uses WebSocket for lower latency, but Fuji public WebSocket endpoints may be unreliable. Need to test `wss://api.avax-test.network/ext/bc/C/ws` and have HTTP polling as a fallback.
- **Oracle price source for testnet:** The price oracle contract is listed as "out of scope" for implementation. The deploy script needs a mock oracle that returns configurable prices. Need to determine what price values to use for each caliber during testing.
- **Neon free tier connection limits:** The free tier allows 100 connections. With Vercel serverless functions and a Railway worker, connection exhaustion is possible under load. Should validate with Neon's pooled connection string before building API routes.
- **Admin `actualPriceX18` formula:** The exact calculation the admin must perform to convert a dollar-denominated Ammo Squared invoice price into the `actualPriceX18` parameter is not documented in the research. This needs to be derived from the CaliberMarket contract's `_calculateMintTokens` function.

## Sources

### Primary (HIGH confidence)
- Existing codebase analysis -- contract source, mock UI, Prisma schema, worker skeleton, shared config
- PROJECT.md -- architecture decisions, scope definition, constraints
- viem documentation -- `watchContractEvent`, `getContractEvents`, transport options
- wagmi v2 documentation -- hooks, connectors, SSR configuration
- Foundry documentation -- `forge script`, deployment, verification

### Secondary (MEDIUM confidence)
- viem GitHub issues (#534, #1084, #1063) -- `watchContractEvent` reliability problems
- wagmi GitHub issues (#4423, #4187) -- ERC20 approval and WalletConnect edge cases
- Prisma + Neon documentation -- connection pooling, serverless adapter patterns
- Neon documentation -- connection latency, idle timeout behavior

### Tertiary (LOW confidence)
- Avalanche Fuji public RPC rate limits -- exact limits not officially documented, based on community reports
- RainbowKit/ConnectKit wagmi v3 support -- "inconsistent" based on community discussion, not officially confirmed

---
*Research completed: 2026-02-10*
*Ready for roadmap: yes*
