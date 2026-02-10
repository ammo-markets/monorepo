# Requirements: Ammo Exchange -- Fuji Testnet Integration

**Defined:** 2026-02-10
**Core Value:** Anyone worldwide can get price exposure to U.S. ammunition by minting ammo tokens with USDC, while only verified U.S. residents in allowed states can redeem for physical delivery.

## v1 Requirements

Requirements for Fuji testnet milestone. Each maps to roadmap phases.

### Deployment

- [ ] **DEPLOY-01**: Deploy AmmoManager and AmmoFactory to Fuji testnet via Foundry script
- [ ] **DEPLOY-02**: Deploy CaliberMarket + AmmoToken for all 4 calibers (9MM, 556, 22LR, 308) via AmmoFactory
- [ ] **DEPLOY-03**: Deploy mock USDC contract with 6 decimals on Fuji for testnet minting
- [ ] **DEPLOY-04**: Update shared config with real Fuji contract addresses (manager, factory, markets, tokens, USDC)

### Wallet Connection

- [ ] **WALLET-01**: User can connect wallet via MetaMask or injected provider using wagmi hooks
- [ ] **WALLET-02**: User can disconnect wallet from any page
- [ ] **WALLET-03**: App prompts network switch to Fuji when connected to wrong chain
- [ ] **WALLET-04**: User sees USDC balance and ammo token balances per caliber when connected

### Mint Flow

- [ ] **MINT-01**: User can approve USDC spending allowance for the target CaliberMarket contract
- [ ] **MINT-02**: User can call startMint() with selected caliber and USDC amount from the mint UI
- [ ] **MINT-03**: User sees real-time transaction status (pending, confirming, confirmed, failed)
- [ ] **MINT-04**: User sees Snowtrace explorer link to their mint transaction
- [ ] **MINT-05**: Mint flow handles contract reverts, wallet rejections, and deadline expiry with clear error messages

### Redeem Flow

- [ ] **REDEEM-01**: User can call startRedeem() with selected caliber and token amount from the redeem UI
- [ ] **REDEEM-02**: User can submit shipping address stored in database via API route
- [ ] **REDEEM-03**: User KYC status tracked in database (auto-approved for testnet)
- [ ] **REDEEM-04**: User sees real-time transaction status and Snowtrace explorer link
- [ ] **REDEEM-05**: Redeem flow handles contract reverts, wallet rejections, and deadline expiry with clear error messages

### Event Indexer

- [ ] **INDEX-01**: Worker polls for MintStarted, MintFinalized, RedeemRequested, RedeemFinalized events using getContractEvents
- [ ] **INDEX-02**: Worker persists orders to database with on-chain order ID linking off-chain records to contract state
- [ ] **INDEX-03**: Worker maintains persistent block cursor in database for crash recovery
- [ ] **INDEX-04**: Worker backfills missed events on startup from last checkpoint to current block

### API Routes

- [ ] **API-01**: GET /api/orders returns user's orders filtered by wallet address
- [ ] **API-02**: GET /api/orders/[id] returns order detail with on-chain status and transaction hash
- [ ] **API-03**: GET /api/balances returns on-chain token balances for a given wallet address
- [ ] **API-04**: POST /api/redeem/shipping stores shipping address linked to a redeem order
- [ ] **API-05**: GET /api/market returns worker-computed effective price per round for each caliber

### Portfolio

- [ ] **PORT-01**: User sees real on-chain token balances per caliber (AmmoToken.balanceOf)
- [ ] **PORT-02**: User sees order history from database with current status
- [ ] **PORT-03**: User can view order detail page with on-chain transaction links to Snowtrace

### Admin Dashboard

- [ ] **ADMIN-01**: /admin/* routes gated by keeper wallet address via Next.js middleware
- [ ] **ADMIN-02**: Admin sees queue of pending mint orders with user address, amount, caliber, timestamp
- [ ] **ADMIN-03**: Admin sees queue of pending redeem orders with user address, token amount, caliber, shipping info
- [ ] **ADMIN-04**: Admin can trigger finalizeMint on-chain with actualPriceX18 parameter from dashboard
- [ ] **ADMIN-05**: Admin can trigger finalizeRedeem on-chain from dashboard
- [ ] **ADMIN-06**: Admin sees protocol stats dashboard (total minted per caliber, total redeemed, treasury USDC balance)

### Database

- [ ] **DB-01**: Prisma schema migrated to Neon PostgreSQL with all required tables active
- [ ] **DB-02**: Order model includes onChainOrderId field linking database records to contract state
- [ ] **DB-03**: BlockCursor table tracks worker's last processed block per contract address
- [ ] **DB-04**: All frontend mock data replaced with real database queries via API routes and server components

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Oracle & Pricing

- **ORACLE-01**: Deploy mock price oracle contract with admin-settable prices per caliber
- **ORACLE-02**: Integrate Chainlink or Pyth price feeds for real-time ammo pricing

### KYC & Compliance

- **KYC-01**: Integrate real KYC provider (Persona, Jumio) for identity verification
- **KYC-02**: Age verification enforcement (21+ handgun, 18+ rifle per federal law)
- **KYC-03**: Restricted state enforcement at contract level

### Trust & Transparency

- **TRUST-01**: Proof of reserves dashboard showing warehouse inventory vs token supply
- **TRUST-02**: On-chain activity feed showing recent mint/redeem/trade events
- **TRUST-03**: Push notifications for order status changes

### Trading

- **TRADE-01**: Real Uniswap pool integration in swap widget (replace demo UI)
- **TRADE-02**: LP position tracking in portfolio

### Admin Extended

- **ADMIN-EXT-01**: Batch finalization (process multiple orders at once)
- **ADMIN-EXT-02**: Refund/cancel order capability from admin
- **ADMIN-EXT-03**: Fee configuration from admin UI

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Mainnet deployment | Fuji first -- validate full flow before mainnet costs/risks |
| Real Ammo Squared API integration | Admin manually handles procurement for MVP |
| Mobile app | Web-first, mobile later |
| Governance/DAO UI | No token governance needed for centralized keeper model |
| Custom DEX | Uniswap handles trading -- no need to build our own AMM |
| Cross-chain bridging | Single chain (Avalanche) sufficient for MVP |
| Social features | Not a social platform |
| Fiat on-ramp | Users acquire USDC externally |
| Email/SMS notifications | Push notifications deferred to v2 |
| Complex analytics dashboard | Basic stats in admin sufficient for MVP |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| DEPLOY-01 | Phase 1 | Pending |
| DEPLOY-02 | Phase 1 | Pending |
| DEPLOY-03 | Phase 1 | Pending |
| DEPLOY-04 | Phase 1 | Pending |
| WALLET-01 | Phase 3 | Pending |
| WALLET-02 | Phase 3 | Pending |
| WALLET-03 | Phase 3 | Pending |
| WALLET-04 | Phase 3 | Pending |
| MINT-01 | Phase 4 | Pending |
| MINT-02 | Phase 4 | Pending |
| MINT-03 | Phase 4 | Pending |
| MINT-04 | Phase 4 | Pending |
| MINT-05 | Phase 4 | Pending |
| REDEEM-01 | Phase 4 | Pending |
| REDEEM-02 | Phase 4 | Pending |
| REDEEM-03 | Phase 4 | Pending |
| REDEEM-04 | Phase 4 | Pending |
| REDEEM-05 | Phase 4 | Pending |
| INDEX-01 | Phase 2 | Pending |
| INDEX-02 | Phase 2 | Pending |
| INDEX-03 | Phase 2 | Pending |
| INDEX-04 | Phase 2 | Pending |
| API-01 | Phase 3 | Pending |
| API-02 | Phase 3 | Pending |
| API-03 | Phase 3 | Pending |
| API-04 | Phase 3 | Pending |
| API-05 | Phase 3 | Pending |
| PORT-01 | Phase 5 | Pending |
| PORT-02 | Phase 5 | Pending |
| PORT-03 | Phase 5 | Pending |
| ADMIN-01 | Phase 6 | Pending |
| ADMIN-02 | Phase 6 | Pending |
| ADMIN-03 | Phase 6 | Pending |
| ADMIN-04 | Phase 6 | Pending |
| ADMIN-05 | Phase 6 | Pending |
| ADMIN-06 | Phase 6 | Pending |
| DB-01 | Phase 1 | Pending |
| DB-02 | Phase 1 | Pending |
| DB-03 | Phase 1 | Pending |
| DB-04 | Phase 5 | Pending |

**Coverage:**
- v1 requirements: 40 total
- Mapped to phases: 40
- Unmapped: 0

---
*Requirements defined: 2026-02-10*
*Last updated: 2026-02-10 after roadmap creation*
