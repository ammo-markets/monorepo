# Features Research: Ammo Exchange Dashboard

> **Dimension:** Features -- user-facing and admin dashboard for a tokenized RWA DeFi protocol
> **Date:** 2026-02-10
> **Context:** Wiring existing smart contracts to frontend + building admin dashboard. Existing mock UI covers mint (4-step), redeem (5-step with KYC), trade (swap widget), portfolio (holdings/orders/primers), and market pages. All frontend data is currently mock -- no on-chain reads, no DB queries, no event indexing.

---

## 1. Table Stakes (Must Have or Users Leave)

These are baseline expectations from any DeFi protocol with mint/redeem flows. Without them, users will not trust the protocol or will bounce immediately.

### 1.1 Wallet Connection + Chain Awareness

**What:** Connect wallet via WalletConnect/injected providers; detect wrong chain; prompt network switch to Avalanche C-Chain.
**Why:** Without this, nothing works. Every DeFi user expects this in under 3 seconds.
**Complexity:** Low. wagmi + viem already in the stack. Wire `useAccount`, `useChainId`, `useSwitchChain`.
**Dependencies:** None. This is the first thing to wire up.
**Status in codebase:** Mock only. `MintFlow` and `RedeemFlow` simulate wallet connection with `useState`. `PortfolioDashboard` uses a fake `walletConnected` toggle. Wrong-network banner exists as a component but is not wired.

### 1.2 Real Token Balances + USDC Balance

**What:** Read on-chain ERC-20 balances for all caliber tokens (9MM, 556, 22LR, 308) and USDC. Display in portfolio holdings, mint form, redeem form, and swap widget.
**Why:** Users need to know what they own. Mock data is a dead giveaway the product is not real.
**Complexity:** Low. `useReadContracts` (wagmi) with ERC-20 `balanceOf` calls. Batch via multicall.
**Dependencies:** 1.1 (wallet connection). Contract addresses from `@ammo-exchange/shared`.
**Status in codebase:** All balance displays use hardcoded values from `mock-data.ts`.

### 1.3 Mint Flow -- On-Chain Transaction Execution

**What:** Replace mock approve/confirm with real transactions: (a) USDC `approve` to CaliberMarket, (b) `startMint(usdcAmount, maxSlippageBps, deadline)`. Show pending state, tx hash link to Snowtrace, success/error.
**Why:** This is the core revenue-generating action. If mint does not work, there is no protocol.
**Complexity:** Medium. Need `useWriteContract` for approve + startMint, `useWaitForTransactionReceipt` for confirmation, proper error handling (user rejection, insufficient gas, contract revert).
**Dependencies:** 1.1, 1.2. Oracle price read for slippage calculation. CaliberMarket ABI exports.
**Status in codebase:** `MintFlow` step 3 simulates approve/confirm with `setTimeout` and random success/failure.

### 1.4 Redeem Flow -- On-Chain Transaction Execution

**What:** Replace mock burn with real transaction: token `approve` to CaliberMarket, then `startRedeem(tokenAmount, deadline)`. Show pending state, tx hash, success/error.
**Why:** Redemption is the core trust mechanism -- tokens must be actually redeemable.
**Complexity:** Medium. Same pattern as mint but simpler (no oracle price needed at start).
**Dependencies:** 1.1, 1.2. CaliberMarket ABI. KYC status check (from DB via API route).
**Status in codebase:** `RedeemFlow` step 4 simulates burn with `setTimeout`.

### 1.5 Order Status Tracking (User Portfolio)

**What:** Show real order statuses (PENDING, PROCESSING, COMPLETED, FAILED, CANCELLED) by reading from the database (populated by the worker from on-chain events). Order detail page with step-by-step progress.
**Why:** After submitting a mint/redeem, users need to know what is happening. The 24-48 hour processing window requires clear status communication or users panic.
**Complexity:** Medium. API routes to query Prisma `Order` table. Requires worker to be indexing events. UI already has stepper components (`order-detail.tsx`) -- just needs real data.
**Dependencies:** Worker event indexing (see 1.8). API routes. Auth/session (wallet address).
**Status in codebase:** `PortfolioDashboard` and `OrderDetailView` use mock data from `orderDetails` and `portfolioOrders`.

### 1.6 Transaction Hash Links to Explorer

**What:** Every on-chain action (mint start, redeem start, finalize) links to Snowtrace with the actual tx hash.
**Why:** On-chain verifiability is fundamental DeFi trust. Users expect to be able to verify every action.
**Complexity:** Low. Store tx hash from transaction receipt, construct URL.
**Dependencies:** 1.3, 1.4 (real transactions).
**Status in codebase:** Order detail shows `txHashShort` as mock data with `#` href.

### 1.7 Price Display from Oracle

**What:** Show current per-round price for each caliber by reading from the on-chain `IPriceOracle`. Display on market page, mint form, and portfolio value calculations.
**Why:** Users need to know current pricing to make mint/trade decisions.
**Complexity:** Low-Medium. `useReadContract` for oracle `getPrice()`. Need to handle decimal scaling (price is X18 on-chain).
**Dependencies:** Oracle contract deployed and returning prices.
**Status in codebase:** All prices come from `caliberDetails` in `mock-data.ts`.

### 1.8 Worker Event Indexing

**What:** The Bun worker watches for on-chain events (`MintStarted`, `MintFinalized`, `MintRefunded`, `RedeemRequested`, `RedeemFinalized`, `RedeemCanceled`) and writes order records + status updates to the Prisma database.
**Why:** This is the backbone connecting on-chain activity to the user-facing portfolio. Without it, the portfolio page cannot show real data.
**Complexity:** Medium-High. `publicClient.watchContractEvent` for all CaliberMarket instances. Handle block reorgs. Map event data to Prisma Order model. Handle reconnection/crash recovery (track last processed block).
**Dependencies:** Deployed contracts. DB schema (already exists). Contract ABI exports.
**Status in codebase:** Worker `index.ts` has a TODO comment and commented-out event watcher.

### 1.9 Fee Transparency

**What:** Show mint fee (bps) and redeem fee (bps) read from the CaliberMarket contract. Display in calculation breakdowns during mint and redeem flows.
**Why:** DeFi users expect fee transparency. Hidden or unclear fees erode trust fast.
**Complexity:** Low. `useReadContract` for `mintFeeBps()` and `redeemFeeBps()`.
**Dependencies:** Contract reads.
**Status in codebase:** Fees are hardcoded in `mock-data.ts` per caliber.

---

## 2. Table Stakes -- Admin Dashboard

### 2.1 Wallet-Gated Admin Access

**What:** Admin pages (`/admin/*`) gated by connected wallet address. Only wallets registered as `keeper` in `AmmoManager` can access. Check via `manager.isKeeper(address)` on-chain.
**Why:** The keeper must finalize/refund mints and finalize/cancel redeems. Without a UI, the keeper must use cast CLI or Etherscan -- unacceptable for operations.
**Complexity:** Medium. Middleware or client-side guard using `useReadContract` to check `isKeeper`. SIWE (Sign-In With Ethereum) for server-side auth if API routes need protection.
**Dependencies:** 1.1 (wallet connection). AmmoManager contract read.
**Status in codebase:** No admin pages exist. No `/admin` route.

### 2.2 Pending Order Queue

**What:** Table of all orders in PENDING/PROCESSING status across all calibers. Show: order ID, user address, caliber, amount, USDC value, created timestamp, time-in-queue. Sortable and filterable.
**Why:** The keeper needs to see what needs action. This is the primary operational view.
**Complexity:** Medium. API route querying `Order` table with status filter. Real-time or polling refresh.
**Dependencies:** 1.8 (worker indexing). API auth (2.1).
**Status in codebase:** Does not exist.

### 2.3 Finalize/Refund Mint Actions

**What:** For each pending mint order, the admin can: (a) enter the actual purchase price (from Ammo Squared invoice), then click "Finalize Mint" which calls `CaliberMarket.finalizeMint(orderId, actualPriceX18)`, or (b) click "Refund" which calls `CaliberMarket.refundMint(orderId, reasonCode)`.
**Why:** This is the core keeper operational action. The protocol does not function without it.
**Complexity:** Medium-High. Form to input actual price with decimal-to-X18 conversion. `useWriteContract` for `finalizeMint` and `refundMint`. Handle tx confirmation, error states. Audit log entry on success.
**Dependencies:** 2.1, 2.2. CaliberMarket ABI.
**Status in codebase:** Does not exist.

### 2.4 Finalize/Cancel Redeem Actions

**What:** For each pending redeem order, the admin can: (a) click "Finalize Redeem" which calls `CaliberMarket.finalizeRedeem(orderId)` (burns tokens, sends fee to feeRecipient), or (b) click "Cancel" which calls `CaliberMarket.cancelRedeem(orderId, reasonCode)` (returns tokens to user).
**Why:** Same as 2.3 -- core keeper action for the redeem side.
**Complexity:** Medium. Simpler than mint finalization (no price input needed).
**Dependencies:** 2.1, 2.2. CaliberMarket ABI.
**Status in codebase:** Does not exist.

### 2.5 Protocol Stats Overview

**What:** Dashboard summary showing: total minted per caliber, total redeemed, pending orders count, USDC held in contracts, fee revenue collected, treasury balance.
**Why:** The operator needs to know protocol health at a glance.
**Complexity:** Medium. Mix of on-chain reads (token totalSupply, contract USDC balance) and DB aggregations (order counts, revenue sums).
**Dependencies:** 1.8, contract reads.
**Status in codebase:** Home page has mock `protocol-stats.tsx` with hardcoded values.

---

## 3. Differentiators (Competitive Advantage)

These features are not expected by every DeFi user on day one, but they build trust, attract users from competitors, and create defensible value for a tokenized physical commodity platform.

### 3.1 Real-Time Proof of Reserves Dashboard

**What:** Live display showing: on-chain token supply per caliber vs. off-chain warehouse inventory. Visual 1:1 backing indicator. Link to latest third-party attestation. Historical backing ratio chart.
**Why:** This is THE trust differentiator for physical-backed tokens. PAXG's lookup tool (enter wallet address, see your gold serial number) is their most compelling feature. For Ammo Exchange, showing "5,580,000 tokens = 5,580,000 rounds in warehouse" with third-party verification is what makes the protocol credible.
**Complexity:** Medium-High. On-chain reads for `totalSupply` per token. Off-chain inventory feed from warehouse/supplier API or manual DB entry. Attestation document hosting. Historical chart from DB time-series.
**Dependencies:** Warehouse data feed. Contract reads.
**Status in codebase:** `proof-of-reserves.tsx` exists as a static banner with hardcoded values. No dynamic data.

### 3.2 Order Progress Push Notifications

**What:** When the keeper finalizes a mint (tokens appear in wallet), push a notification to the user. When a redeem ships, send notification with tracking number. Options: browser push notifications, email (if collected at KYC), on-site notification bell.
**Why:** The 24-48 hour processing window is the most anxiety-inducing part of the UX. Proactive notifications reduce support tickets and build trust. Most DeFi protocols with async flows (bridges, LSTs) do this.
**Complexity:** Medium-High. Worker writes notification records on event processing. Frontend polls or uses WebSocket/SSE. Email integration optional (SendGrid/Resend).
**Dependencies:** 1.8 (worker). Notification DB table. Push subscription if browser notifications.
**Status in codebase:** Does not exist.

### 3.3 Price Charts with Historical Data

**What:** Interactive price charts per caliber showing historical token price (from DEX trades) and/or oracle price over time. Time range selectors (1D, 1W, 1M, 3M, 1Y, All).
**Why:** Price history is essential for users deciding when to mint or trade. AmmoSeek provides price history for physical ammo -- the tokenized version should too. This is also valuable for the "crypto-native investor" persona who wants to speculate on ammo prices.
**Complexity:** Medium-High. Requires indexing DEX swap events or oracle price updates into a time-series table. Chart component (already have `price-chart.tsx` shell). TradingView-style lightweight chart library.
**Dependencies:** Price data indexing (either oracle snapshots from worker, or DEX subgraph data).
**Status in codebase:** `price-chart.tsx` exists as a component shell. `time-range-selector.tsx` exists. No real data.

### 3.4 KYC Integration (Persona or Similar)

**What:** Embedded third-party KYC flow (Persona, Jumio, or similar) within the redeem flow. Age verification + ID check. Store KYC status in DB. Auto-gate redeem step 3 based on KYC status.
**Why:** Legally required for physical shipment. The mock UI already shows the UX flow -- it just needs a real provider. Seamless KYC (vs. emailing documents) is a differentiator against traditional ammo dealers.
**Complexity:** High. Third-party KYC provider integration. Webhook handling for async verification results. DB storage of KYC status. Privacy/PII handling.
**Dependencies:** KYC provider account and API keys. Redeem flow (1.4).
**Status in codebase:** `RedeemFlow` step 2 (`StepKyc`) shows the UX with mock status transitions. `User` model has `kycStatus` enum.

### 3.5 Activity Feed / Recent Transactions

**What:** Public feed showing recent protocol activity: "User 0x1a2b...minted 500 rounds of 9MM", "Redeem finalized for 1000 rounds of 556". Anonymized wallet addresses. Shows the protocol is alive and active.
**Why:** Social proof. An empty-looking protocol feels dead. Seeing real activity builds confidence. This is standard on bridges (LayerZero, Wormhole) and minting platforms.
**Complexity:** Medium. Query recent orders from DB, anonymize addresses, render as feed. Already have `activity-feed.tsx` component shell.
**Dependencies:** 1.8 (worker indexing).
**Status in codebase:** `activity-feed.tsx` exists with mock data.

### 3.6 Swap Widget with Real DEX Integration

**What:** Replace the mock swap calculations with real Uniswap V3 quotes. Use the Uniswap SDK or a DEX aggregator (1inch, Paraswap) for quote fetching. Execute swaps through the router contract.
**Why:** Trading is the middle of the mint-trade-redeem loop. If users cannot actually trade tokens on-site, they must leave to go to Uniswap directly. Embedded trading keeps users in the ecosystem.
**Complexity:** High. Uniswap V3 SDK integration for quotes. Router contract interaction for execution. Slippage management. Price impact calculation. May require deploying Uniswap pools first.
**Dependencies:** Uniswap pools deployed for each caliber/USDC pair. Token contract addresses.
**Status in codebase:** `swap-widget.tsx` exists with full mock UI including token selector, amount input, details panel, and Uniswap branding. All calculations are fake.

### 3.7 Admin Audit Trail

**What:** Every keeper action (finalize, refund, cancel) logged with timestamp, keeper address, order ID, tx hash, and any manually-entered data (actual price, reason code). Viewable in admin dashboard with search/filter.
**Why:** Operational accountability. When something goes wrong, the operator needs to trace what happened. Also useful for tax/compliance reporting.
**Complexity:** Low-Medium. `AuditLog` model already exists in Prisma schema. Write audit entries in the worker when keeper events are processed. Admin UI to query and display.
**Dependencies:** 1.8, 2.1.
**Status in codebase:** `AuditLog` Prisma model exists. No UI or write logic.

---

## 4. Anti-Features (Things to Deliberately NOT Build)

### 4.1 DO NOT Build a Governance Token or DAO Interface

**Why not:** The whitepaper explicitly defers governance tokens to post-PMF. Building governance UI now is premature complexity with no users to govern. The Primers system is deliberately non-transferable points, not a token. Adding governance overhead before there is meaningful TVL or user base is wasted effort and creates regulatory risk.

### 4.2 DO NOT Build a Custom DEX / Order Book

**Why not:** Uniswap V3 already exists. Building a custom AMM or order book is months of work with no advantage over routing to Uniswap. The protocol's value is in the mint/redeem loop, not in being a DEX. Embed Uniswap, do not compete with it.

### 4.3 DO NOT Build Cross-Chain Bridging

**Why not:** The whitepaper mentions cross-chain in Phase 3 (months 9-12). The current milestone is wiring existing contracts on Avalanche. Bridge integration adds massive complexity (Wormhole, LayerZero, CCIP) with no user demand yet. Ship single-chain first.

### 4.4 DO NOT Build a Mobile App

**Why not:** The web app is responsive and works on mobile browsers. A native mobile app adds app store compliance burden (Apple/Google policies on crypto apps, ammunition content), dual codebases, and slow iteration. Progressive web app is sufficient for now.

### 4.5 DO NOT Build Social Features (Chat, Forums, Comments)

**Why not:** This is a financial protocol, not a community platform. Social features attract moderation burden, spam, and liability. Discord/Telegram serve the community function. The protocol frontend should be focused and transactional.

### 4.6 DO NOT Build Fiat On-Ramp (Yet)

**Why not:** Listed in whitepaper Phase 3. Fiat on-ramp (MoonPay, Transak) requires money transmitter licensing compliance. The current flow (USDC in, tokens out) works for crypto-native users. Add fiat later when targeting mainstream gun owners.

### 4.7 DO NOT Build Complex Analytics / Charting Beyond Basic Price History

**Why not:** TradingView-level charting with indicators, drawing tools, etc. is overkill for a token representing ammunition rounds. Users need simple price history to make decisions, not a Bloomberg terminal. The trading action happens on Uniswap anyway.

### 4.8 DO NOT Build Email/SMS Communication System

**Why not:** For the MVP milestone, in-app notification polling is sufficient. Building email delivery (SendGrid integration, email templates, unsubscribe handling, CAN-SPAM compliance) is a rabbit hole. The wallet address is the identity; browser-based notification is the channel.

---

## 5. Feature Dependency Graph

```
1.1 Wallet Connection
  |-- 1.2 Token Balances
  |     |-- 1.3 Mint Flow (on-chain)
  |     |-- 1.4 Redeem Flow (on-chain)
  |     |-- 1.7 Oracle Price
  |
  |-- 1.8 Worker Event Indexing
  |     |-- 1.5 Order Status Tracking
  |     |     |-- 1.6 Tx Hash Links
  |     |     |-- 3.2 Push Notifications (differentiator)
  |     |
  |     |-- 2.2 Admin Order Queue
  |     |     |-- 2.3 Finalize/Refund Mint
  |     |     |-- 2.4 Finalize/Cancel Redeem
  |     |     |-- 3.7 Audit Trail
  |     |
  |     |-- 2.5 Protocol Stats
  |     |-- 3.5 Activity Feed
  |     |-- 3.3 Price Charts (partial)
  |
  |-- 2.1 Admin Wallet Gate
  |     |-- 2.2 Admin Order Queue
  |     |-- 2.3 Finalize/Refund Mint
  |     |-- 2.4 Finalize/Cancel Redeem
  |     |-- 2.5 Protocol Stats
  |
  |-- 3.1 Proof of Reserves (on-chain reads + off-chain feed)
  |-- 3.4 KYC Integration (third-party)
  |-- 3.6 Swap Widget DEX Integration (Uniswap SDK)
```

---

## 6. Recommended Build Order

**Phase A -- Plumbing (must complete first, unlocks everything):**

1. 1.1 Wallet Connection
2. 1.2 Token Balances + 1.7 Oracle Price + 1.9 Fees (batch these -- all are contract reads)
3. 1.8 Worker Event Indexing

**Phase B -- Core Flows (the product):** 4. 1.3 Mint Flow on-chain 5. 1.4 Redeem Flow on-chain 6. 1.5 Order Status Tracking + 1.6 Tx Hash Links

**Phase C -- Admin (operations):** 7. 2.1 Admin Wallet Gate 8. 2.2 Pending Order Queue 9. 2.3 Finalize/Refund Mint + 2.4 Finalize/Cancel Redeem

**Phase D -- Differentiators (trust + polish):** 10. 3.1 Proof of Reserves (dynamic) 11. 3.5 Activity Feed 12. 3.3 Price Charts 13. 2.5 Protocol Stats + 3.7 Audit Trail 14. 3.4 KYC Integration 15. 3.6 Swap Widget DEX Integration

---

## 7. Complexity Summary

| Feature               | Complexity | New Code                   | Existing UI to Wire                       |
| --------------------- | ---------- | -------------------------- | ----------------------------------------- |
| 1.1 Wallet Connection | Low        | wagmi hooks                | navbar, all flows                         |
| 1.2 Token Balances    | Low        | multicall reads            | portfolio, mint, redeem, swap             |
| 1.3 Mint Flow         | Medium     | tx execution + receipts    | mint-flow.tsx step 3                      |
| 1.4 Redeem Flow       | Medium     | tx execution + receipts    | redeem-flow.tsx step 4                    |
| 1.5 Order Status      | Medium     | API routes + DB queries    | portfolio-dashboard.tsx, order-detail.tsx |
| 1.6 Tx Hash Links     | Low        | URL construction           | order-detail.tsx                          |
| 1.7 Oracle Price      | Low-Med    | contract read + scaling    | market page, mint form                    |
| 1.8 Worker Indexing   | Med-High   | event watching + DB writes | worker/index.ts                           |
| 1.9 Fee Transparency  | Low        | contract reads             | mint-flow, redeem-flow                    |
| 2.1 Admin Gate        | Medium     | wallet check + routing     | new /admin layout                         |
| 2.2 Order Queue       | Medium     | API + table UI             | new admin page                            |
| 2.3 Finalize Mint     | Med-High   | form + tx + audit          | new admin component                       |
| 2.4 Finalize Redeem   | Medium     | tx + audit                 | new admin component                       |
| 2.5 Protocol Stats    | Medium     | mixed reads + aggregates   | new admin component                       |
| 3.1 Proof of Reserves | Med-High   | on-chain + off-chain feed  | proof-of-reserves.tsx                     |
| 3.2 Notifications     | Med-High   | worker + DB + polling      | new system                                |
| 3.3 Price Charts      | Med-High   | indexing + chart library   | price-chart.tsx shell                     |
| 3.4 KYC Integration   | High       | third-party API + webhooks | redeem-flow.tsx step 2                    |
| 3.5 Activity Feed     | Medium     | DB query + UI              | activity-feed.tsx                         |
| 3.6 DEX Integration   | High       | Uniswap SDK + router       | swap-widget.tsx                           |
| 3.7 Audit Trail       | Low-Med    | DB writes + admin UI       | AuditLog model exists                     |

---

## 8. Reference Protocols

| Protocol                 | Relevant Feature                                           | Lesson for Ammo Exchange                                                                                 |
| ------------------------ | ---------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| **PAXG (Paxos Gold)**    | Wallet-address-to-gold-serial lookup; transparency reports | Build a similarly compelling proof-of-reserves experience. Users should be able to verify their backing. |
| **XAUT (Tether Gold)**   | Quarterly attestations with specific tonnage               | Regular, published attestations build institutional trust.                                               |
| **Maker/Sky**            | Keeper-triggered liquidations; operational dashboard       | Keeper operations need monitoring UI; silent failures are catastrophic.                                  |
| **Chainlink Automation** | Keeper bot patterns; uptime monitoring                     | Worker reliability is critical. Build heartbeat checks and alerting.                                     |
| **LayerZero/Wormhole**   | Transaction status tracking across async operations        | Their "scan" pages (tracking cross-chain messages) are the pattern for async order tracking.             |
| **DeFi Saver**           | Multi-protocol management dashboard                        | Clean admin UX for complex operations -- inspiration for the keeper dashboard.                           |

---

## 9. Quality Gate Checklist

- [x] Categories are clear (table stakes vs differentiators vs anti-features)
- [x] Complexity noted for each feature (Low / Medium / High in descriptions and summary table)
- [x] Dependencies between features identified (Section 5 dependency graph + inline dependency notes)
- [x] Build order recommended based on dependency chain
- [x] Existing codebase status noted for each feature (what exists, what is mock)
- [x] Anti-features justified with clear reasoning
