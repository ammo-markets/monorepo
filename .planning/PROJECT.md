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

### Active

<!-- Current scope: Fuji testnet integration milestone. -->

- [ ] Deploy contracts to Avalanche Fuji testnet and update shared config with real addresses
- [ ] Wire real wallet connection (wagmi useConnect/useAccount replacing mock boolean)
- [ ] Wire mint flow: USDC approval → startMint() contract call from UI
- [ ] Wire redeem flow: startRedeem() contract call from UI
- [ ] Worker event indexer: listen for MintStarted, RedeemRequested → persist orders to DB
- [ ] Admin dashboard: /admin/* routes gated by keeper wallet address
- [ ] Admin order queue: view pending mint/redeem orders
- [ ] Admin finalization: trigger finalizeMint/finalizeRedeem on-chain from admin UI
- [ ] Next.js API routes: order queries, user balances, market data
- [ ] Portfolio: read on-chain token balances via AmmoToken.balanceOf + DB order history
- [ ] Market prices: worker computes effective price per round from indexed events, stored in DB
- [ ] KYC/Shipping: store shipping address + KYC status in DB (auto-approved for testnet)
- [ ] DB integration: replace all mock data with Prisma queries via API routes + server components

### Out of Scope

- Real KYC provider integration (Persona, Jumio) — auto-approve for testnet
- Mainnet deployment — Fuji first
- Real Ammo Squared API integration — admin manually handles procurement
- Price oracle contract implementation — keeper supplies price at finalization
- Mobile app — web only
- Real-time chat or notifications — not needed for MVP
- Uniswap pool creation/LP UI — users handle this via Uniswap directly
- Batch keeper operations — single order finalization sufficient for MVP

## Context

**Protocol Design:**
- 4 supported calibers: 9MM (115gr FMJ), 556 (55gr FMJ), 22LR (40gr), 308 (147gr FMJ)
- 1 token = 1 round of ammunition, 18 decimals
- Fees: 1.5% mint, 1.5% redeem (150 BPS, max 500 BPS hard cap)
- Minimum orders: 9MM/556/308 = 50 rounds, 22LR = 100 rounds
- Restricted states (no redemption): CA, NY, IL, DC, NJ
- Supplier: Ammo Squared — admin purchases ammo off-chain after mint orders

**Architecture Decisions:**
- 2-step settlement: user initiates → admin (keeper) finalizes. Human-in-the-loop for off-chain procurement.
- Worker role: event indexer only. Writes chain events to DB. Does NOT auto-finalize.
- Admin finalization: admin reviews order in dashboard, purchases from Ammo Squared, clicks Finalize. Contract call made from admin's keeper wallet via browser (wagmi).
- API layer: Next.js API routes (not separate worker API). TanStack Query on client hits route handlers.
- Admin UI: wallet-gated /admin/* routes in same Next.js app. Keeper wallet = admin access. Contract access control IS the auth (finalizeMint reverts for non-keepers anyway).

**Existing Code:**
- Contracts compiled and tested with Foundry (forge test passes)
- UI is a complete interactive prototype — all flows work with mock data and setTimeout delays
- DB schema exists but is unused — no data written or read yet
- Worker connects to chain but has no event listeners
- wagmi is configured (lib/wagmi.ts) but not wired to UI components

## Constraints

- **Chain**: Avalanche Fuji testnet (chainId 43113) — need test AVAX for gas, test USDC for minting
- **Deployment**: Vercel (frontend), Railway (worker), Neon (database)
- **Stack**: Must use existing tech — Next.js 15, wagmi/viem, Prisma, Foundry. No new frameworks.
- **Access Control**: AmmoManager contract governs keeper/owner/guardian roles on-chain. Admin UI gates on same wallet addresses.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Fuji testnet first | Validate full flow before mainnet costs/risks | — Pending |
| Next.js API routes over separate API server | Single deployment, shared DB access, simpler stack | — Pending |
| Admin in same app (/admin/*) | Shares wagmi setup, Prisma, UI components. 1-2 admin wallets don't justify separate app | — Pending |
| Worker as indexer, not keeper | Admin must review and trigger finalization. Human-in-the-loop for off-chain procurement | — Pending |
| Admin auth = wallet address check | Contract already reverts for non-keepers. Middleware is UX, not security | — Pending |
| TanStack Query for frontend data | Already in stack. API routes return JSON, client caches and refreshes | — Pending |

---
*Last updated: 2026-02-10 after initialization*
