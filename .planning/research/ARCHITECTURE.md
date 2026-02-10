# Architecture: DeFi Integration Layer for 2-Step Settlement

**Research Date:** 2026-02-10
**Dimension:** Architecture — Integration layer between smart contracts, worker, database, API, and frontend
**Context:** Subsequent milestone — wiring existing smart contracts + mock UI into a functioning Fuji testnet integration

---

## 1. System Components and Boundaries

The integration layer consists of six distinct components, each with a clear responsibility boundary. No component should reach outside its boundary except through defined interfaces.

### Component Map

```
+------------------------------------------------------------------+
|                        USER BROWSER                               |
|  +------------------------------------------------------------+  |
|  |  Next.js Frontend (apps/web)                                |  |
|  |  - Wallet connection (wagmi/viem)                           |  |
|  |  - Transaction submission (startMint, startRedeem)          |  |
|  |  - Data display (TanStack Query -> API routes)              |  |
|  |  - Admin dashboard (/admin/*)                               |  |
|  +-----------------------------+------------------------------+  |
+--------------------------------|----------------------------------+
                                 |
              +------------------+------------------+
              |                                     |
              v                                     v
+---------------------------+        +---------------------------+
| Avalanche Chain (Fuji)    |        | Next.js API Routes        |
| - CaliberMarket contracts |        | (apps/web/app/api/)       |
| - AmmoToken (ERC20)       |        | - Order queries           |
| - AmmoManager (roles)     |        | - User data               |
| - AmmoFactory             |        | - Market data             |
| - IPriceOracle            |        | - Admin operations        |
+-------------+-------------+        +-------------+-------------+
              |                                     |
              | emits events                        | reads/writes
              v                                     v
+---------------------------+        +---------------------------+
| Event Indexer Worker      |        | PostgreSQL (Neon)         |
| (apps/worker)             |------->| via Prisma ORM            |
| - watchContractEvent()    | writes | - User, Order, Inventory  |
| - Parses logs             |        | - ShippingAddress         |
| - Writes to DB            |        | - AuditLog                |
+---------------------------+        +---------------------------+
```

### Component Boundaries

**1. Smart Contracts (packages/contracts/src/)**
- Boundary: On-chain state and settlement logic ONLY
- Owns: Order state machine (MintStatus, RedeemStatus), token minting/burning, fee distribution, access control
- Does NOT: Store off-chain data, make API calls, know about the database
- Interface out: Events (MintStarted, MintFinalized, RedeemRequested, RedeemFinalized, MintRefunded, RedeemCanceled)
- Interface in: Transaction calls (startMint, startRedeem, finalizeMint, finalizeRedeem, refundMint, cancelRedeem)

**2. Event Indexer Worker (apps/worker/)**
- Boundary: Chain-to-database bridge ONLY
- Owns: Event watching, log parsing, database writes for chain events
- Does NOT: Serve API requests, render UI, call finalization functions, make admin decisions
- Interface in: Contract events via viem `watchContractEvent`
- Interface out: Prisma writes to PostgreSQL

**3. Database (packages/db/)**
- Boundary: Persistent off-chain state
- Owns: User records, order history (enriched beyond on-chain data), shipping addresses, inventory tracking, audit trail
- Does NOT: Contain business logic, make chain calls
- Interface: Prisma client consumed by worker and API routes

**4. Next.js API Routes (apps/web/app/api/)**
- Boundary: Data access layer for frontend + admin action relay
- Owns: Query logic, response shaping, admin wallet-gate middleware
- Does NOT: Watch chain events, own business rules about settlement
- Interface in: HTTP requests from frontend (TanStack Query)
- Interface out: Prisma reads, JSON responses

**5. Frontend UI (apps/web/features/)**
- Boundary: User interaction and transaction submission
- Owns: Wallet state, form validation, transaction construction, display logic
- Does NOT: Access database directly, watch chain events, finalize orders
- Interface out: Contract writes via wagmi `useWriteContract`, API calls via TanStack Query
- Interface in: API route JSON responses, on-chain read results via wagmi `useReadContract`

**6. Admin Dashboard (apps/web/app/admin/)**
- Boundary: Keeper operations UI within the same Next.js app
- Owns: Order queue display, finalization trigger, refund/cancel actions
- Does NOT: Auto-finalize, bypass on-chain access control
- Interface out: Contract writes (finalizeMint, finalizeRedeem, refundMint, cancelRedeem) via keeper wallet through wagmi

---

## 2. Data Flows

### 2.1 Mint Flow (Complete Path)

```
Step 1: User initiates mint
  Browser -> wagmi useWriteContract -> CaliberMarket.startMint(usdcAmount, maxSlippageBps, deadline)
  Prerequisite: User must first approve CaliberMarket to spend USDC (IERC20.approve)

Step 2: Chain emits event
  CaliberMarket -> emit MintStarted(orderId, user, usdcAmount, requestPrice, minTokensOut, deadline)
  On-chain state: mintOrders[orderId].status = MintStatus.Started
  USDC transferred: user -> CaliberMarket (held in escrow)

Step 3: Worker indexes event
  Worker (viem watchContractEvent) -> catches MintStarted log
  Worker -> prisma.order.create({
    type: MINT, status: PENDING, caliber, amount, txHash, chainId: 43113
  })
  Worker -> prisma.user.upsert({ walletAddress }) (create user if first interaction)

Step 4: Admin reviews in dashboard
  Admin browser -> GET /api/admin/orders?status=PENDING&type=MINT
  API route -> prisma.order.findMany({ where: { status: PENDING, type: MINT } })
  Admin sees: orderId, user wallet, USDC amount, request price, timestamp

Step 5: Admin finalizes (after off-chain procurement)
  Admin browser -> wagmi useWriteContract -> CaliberMarket.finalizeMint(orderId, actualPriceX18)
  CaliberMarket: validates status, checks slippage/deadline, mints tokens to user
  CaliberMarket -> emit MintFinalized(orderId, user, tokenAmount, priceUsed)
  USDC distribution: fee -> feeRecipient, net -> treasury

Step 6: Worker indexes finalization
  Worker -> catches MintFinalized log
  Worker -> prisma.order.update({ where: { txHash }, data: { status: COMPLETED } })
  Worker -> prisma.auditLog.create({ action: "MINT_FINALIZED", ... })

Alternative Step 5: Admin refunds
  Admin browser -> CaliberMarket.refundMint(orderId, reasonCode)
  CaliberMarket -> returns USDC to user, emit MintRefunded
  Worker -> prisma.order.update({ status: CANCELLED })
```

### 2.2 Redeem Flow (Complete Path)

```
Step 1: User initiates redeem
  Browser -> wagmi useWriteContract -> CaliberMarket.startRedeem(tokenAmount, deadline)
  Prerequisite: User must approve CaliberMarket to transferFrom their AmmoToken

Step 2: Chain emits event
  CaliberMarket -> emit RedeemRequested(orderId, user, tokenAmount, deadline)
  On-chain state: redeemOrders[orderId].status = RedeemStatus.Requested
  Tokens transferred: user -> CaliberMarket (held in escrow)

Step 3: Worker indexes + frontend collects shipping
  Worker -> catches RedeemRequested -> creates Order record (status: PENDING, type: REDEEM)
  Frontend (separately): User submits shipping address
  API route POST /api/orders/[id]/shipping -> prisma.shippingAddress.create(...)
  API route PATCH /api/orders/[id] -> status: PROCESSING

Step 4: Admin reviews + arranges physical shipment
  Admin dashboard -> sees redeem order with shipping address
  Admin arranges shipment via Ammo Squared (off-chain, manual)

Step 5: Admin finalizes
  Admin browser -> CaliberMarket.finalizeRedeem(orderId)
  CaliberMarket: burns net tokens, sends fee tokens to feeRecipient
  CaliberMarket -> emit RedeemFinalized(orderId, user, burnedTokens, feeTokens)

Step 6: Worker indexes finalization
  Worker -> catches RedeemFinalized -> prisma.order.update({ status: COMPLETED })

Alternative Step 5: Admin cancels
  Admin browser -> CaliberMarket.cancelRedeem(orderId, reasonCode)
  CaliberMarket -> returns tokens to user, emit RedeemCanceled
  Worker -> prisma.order.update({ status: CANCELLED })
```

### 2.3 Read Flow (Market Data, Portfolio)

```
Frontend data loading:
  Component mounts -> TanStack Query useQuery({ queryKey, queryFn })
  queryFn -> fetch("/api/markets") or fetch("/api/portfolio/[address]")
  API route -> prisma queries + optional viem publicClient.readContract()
  Response -> JSON -> TanStack Query cache -> component re-renders

On-chain reads (direct, no API):
  Component -> wagmi useReadContract -> CaliberMarket.mintOrders(orderId)
  Component -> wagmi useReadContract -> AmmoToken.balanceOf(address)
  Component -> wagmi useBalance -> native AVAX balance
```

---

## 3. Component Details

### 3.1 Foundry Deployment Scripts

**Location:** `packages/contracts/script/`

**Deployment order matters — contracts have constructor dependencies:**

```
1. AmmoManager(feeRecipient)           -- no dependencies
2. AmmoFactory(manager, usdc, usdcDecimals) -- depends on AmmoManager + USDC address
3. For each caliber:
   AmmoFactory.createCaliber(caliberId, name, symbol, oracle, mintFeeBps, redeemFeeBps, minMintRounds)
   -- deploys CaliberMarket + AmmoToken pair
4. AmmoManager.setKeeper(keeperWallet, true) -- authorize keeper
5. AmmoManager.setTreasury(treasuryAddress)  -- set treasury
6. AmmoManager.setGuardian(guardianAddress)  -- set guardian (optional)
```

**What the deploy script must produce:**
- All contract addresses (AmmoManager, AmmoFactory, each CaliberMarket, each AmmoToken)
- These addresses must be written back to `packages/shared/src/config/index.ts` (CONTRACT_ADDRESSES.fuji)
- The deploy script should also verify contracts on Snowtrace (testnet explorer)

**Fuji-specific considerations:**
- Need a mock USDC (ERC20 with public mint) or use an existing Fuji test USDC
- Need a mock PriceOracle that returns a configurable price (for testing)
- Deployer wallet needs test AVAX (from Avalanche Fuji faucet)

### 3.2 Worker Event Watching (apps/worker/src/)

**Pattern: viem `watchContractEvent` with recovery**

The worker must watch events from ALL deployed CaliberMarket instances (one per caliber). The pattern:

```
For each CaliberMarket address:
  publicClient.watchContractEvent({
    address: marketAddress,
    abi: CaliberMarketAbi,
    eventName: "MintStarted",
    onLogs(logs) { ... }
  })
  // Repeat for: MintFinalized, MintRefunded, RedeemRequested, RedeemFinalized, RedeemCanceled
```

**Events to watch and their DB effects:**

| Event | DB Action | Order Status |
|-------|-----------|-------------|
| MintStarted | Create Order (MINT, PENDING) + upsert User | PENDING |
| MintFinalized | Update Order status | COMPLETED |
| MintRefunded | Update Order status | CANCELLED |
| RedeemRequested | Create Order (REDEEM, PENDING) + upsert User | PENDING |
| RedeemFinalized | Update Order status | COMPLETED |
| RedeemCanceled | Update Order status | CANCELLED |

**Recovery pattern:** On startup, the worker should query missed events between the last processed block (stored in DB or env) and the current block using `publicClient.getContractEvents()` before starting the live watcher. This handles worker restarts and missed events.

**Block tracking:** Store the last processed block number in a new DB table or env-based checkpoint to enable gap recovery.

### 3.3 Next.js API Route Organization

**Location:** `apps/web/app/api/`

**Proposed route structure:**

```
apps/web/app/api/
  markets/
    route.ts              GET /api/markets -> list all calibers with prices/stats
    [caliber]/
      route.ts            GET /api/markets/[caliber] -> single caliber detail
      orders/
        route.ts          GET /api/markets/[caliber]/orders -> recent orders for caliber
  orders/
    route.ts              GET /api/orders?wallet=0x... -> user's orders
    [id]/
      route.ts            GET /api/orders/[id] -> single order detail
      shipping/
        route.ts          POST /api/orders/[id]/shipping -> submit shipping address
  portfolio/
    [address]/
      route.ts            GET /api/portfolio/[address] -> holdings + order history
  admin/
    orders/
      route.ts            GET /api/admin/orders?status=PENDING -> pending order queue
    stats/
      route.ts            GET /api/admin/stats -> protocol metrics
```

**Key principle:** API routes are thin data-access wrappers. They query Prisma and return JSON. They do NOT call smart contracts. Contract writes happen client-side through wagmi.

### 3.4 Admin Middleware (Wallet-Gating)

**Pattern: Next.js middleware + client-side wallet check**

Two layers of protection:

**Layer 1 — Client-side route guard (UX only, not security):**
```
apps/web/app/admin/layout.tsx  (server component wrapping a client boundary)
  -> AdminGuard client component checks useAccount() wallet
  -> If wallet not in ADMIN_WALLETS list, redirect to /
  -> ADMIN_WALLETS sourced from shared config or env var
```

**Layer 2 — API route middleware for /api/admin/* endpoints:**
```
apps/web/middleware.ts
  -> For /api/admin/* routes: verify wallet signature or session
  -> Simplest approach for MVP: require X-Wallet-Address header + SIWE signature verification
  -> Or: just rely on the fact that admin API routes only READ data (finalization is on-chain)
```

**Layer 3 — On-chain access control (actual security):**
```
CaliberMarket.finalizeMint() -> onlyKeeper modifier -> AmmoManager.isKeeper(msg.sender)
  -> Reverts with NotKeeper() if caller is not an authorized keeper
  -> This is the real security boundary. Middleware is UX convenience.
```

**Practical approach for MVP:** Admin pages are protected client-side by wallet address check. Admin API routes (which only read data) can optionally check wallet address from a header. The true security is that finalizeMint/finalizeRedeem will revert on-chain if the caller is not a keeper. The middleware prevents non-admins from seeing the admin UI, not from performing unauthorized actions.

### 3.5 Shared Config Updates for Deployment

**After Fuji deployment, update `packages/shared/src/config/index.ts`:**

```
CONTRACT_ADDRESSES.fuji needs:
  ammoManager: "0x..."
  ammoFactory: "0x..."
  caliberMarkets: {
    "9MM":  { market: "0x...", token: "0x..." },
    "556":  { market: "0x...", token: "0x..." },
    "22LR": { market: "0x...", token: "0x..." },
    "308":  { market: "0x...", token: "0x..." },
  }
  usdc: "0x..." (test USDC on Fuji)
  priceOracle: "0x..." (mock oracle)
```

The current flat structure (ammoToken9MM, ammoToken556, etc.) should be refactored to include both market and token addresses per caliber, plus the global contracts (AmmoManager, AmmoFactory).

---

## 4. Schema Evolution Required

The current Prisma schema needs additions for the integration:

**New fields on Order:**
- `onChainOrderId` (Int) — the orderId from CaliberMarket (nextOrderId counter)
- `marketAddress` (String) — which CaliberMarket contract this order belongs to
- `finalizedTxHash` (String?) — tx hash of the finalization/refund/cancel transaction
- `reasonCode` (Int?) — for refunds/cancellations

**New model — BlockCheckpoint:**
- `id` (String)
- `chainId` (Int)
- `lastBlock` (BigInt)
- `updatedAt` (DateTime)
- Purpose: Worker recovery after restarts

**Inventory model enhancement:**
- Currently tracks rounds per caliber. After integration, the worker should update this from on-chain token totalSupply reads.

---

## 5. Build Order (Dependency-Driven)

The integration must be built in this order because each layer depends on the one before it.

### Phase 1: Foundation (no dependencies)

```
1A. Deploy scripts for Fuji
    - Write Foundry deploy script (packages/contracts/script/Deploy.s.sol)
    - Deploy MockUSDC + MockPriceOracle
    - Deploy AmmoManager -> AmmoFactory -> createCaliber for each caliber
    - Set keeper, treasury, guardian roles
    - Output: contract addresses

1B. Update shared config
    - Refactor CONTRACT_ADDRESSES structure to include all addresses
    - Add market + token address per caliber
    - Add AmmoManager, AmmoFactory, PriceOracle addresses
    - Output: updated packages/shared/src/config/index.ts

1C. Schema migration
    - Add onChainOrderId, marketAddress, finalizedTxHash to Order
    - Add BlockCheckpoint model
    - Run: pnpm db:migrate
    - Output: updated schema + migration
```

**Why first:** Everything else reads from shared config addresses and writes to the database schema. These must exist before any integration code.

### Phase 2: Event Indexer (depends on Phase 1)

```
2A. Worker event watchers
    - Implement watchContractEvent for all 6 CaliberMarket events
    - Implement event-to-Prisma mapping (log parsing -> DB writes)
    - Implement startup recovery (getContractEvents for missed blocks)
    - Implement block checkpoint tracking
    - Output: worker that indexes all chain events to DB

2B. Test with local anvil fork
    - Use anvil to fork Fuji
    - Submit test transactions
    - Verify DB records created correctly
```

**Why second:** The worker populates the database. API routes and admin dashboard need data in the database to display anything useful.

### Phase 3: API Routes (depends on Phase 2)

```
3A. Public API routes
    - GET /api/markets — aggregated from DB (indexed events)
    - GET /api/markets/[caliber] — single caliber stats
    - GET /api/orders?wallet=0x... — user order history
    - GET /api/orders/[id] — single order detail
    - GET /api/portfolio/[address] — holdings (on-chain read) + order history (DB)

3B. Admin API routes
    - GET /api/admin/orders — pending orders queue (filterable by status/type)
    - GET /api/admin/stats — protocol metrics (total minted, total redeemed, fees collected)

3C. Shipping endpoint
    - POST /api/orders/[id]/shipping — submit shipping address for redeem orders
```

**Why third:** API routes are the data access layer the frontend consumes. They need the database populated (Phase 2) and addresses configured (Phase 1).

### Phase 4: Frontend Wiring (depends on Phase 1 + Phase 3)

```
4A. Wallet connection
    - Replace mock isConnected boolean with wagmi useAccount/useConnect
    - Add WalletConnectButton component using wagmi connectors
    - Handle chain switching to Fuji (useSwitchChain)

4B. Mint flow wiring
    - Replace setTimeout mock with real contract calls:
      Step 1: USDC approval (useWriteContract -> IERC20.approve)
      Step 2: startMint call (useWriteContract -> CaliberMarket.startMint)
    - Use useWaitForTransactionReceipt to confirm tx
    - Refresh order data via TanStack Query invalidation

4C. Redeem flow wiring
    - Token approval + startRedeem call
    - Shipping address form submits to POST /api/orders/[id]/shipping

4D. Portfolio wiring
    - Replace mock data with:
      On-chain: useReadContract -> AmmoToken.balanceOf for each caliber
      Off-chain: useQuery -> GET /api/orders?wallet=0x...

4E. Market data wiring
    - Replace mock data with useQuery -> GET /api/markets
    - Price chart data from indexed events in DB
```

**Why fourth:** Frontend needs working contracts (Phase 1), data in the database (Phase 2), and API routes to query (Phase 3).

### Phase 5: Admin Dashboard (depends on Phase 3 + Phase 4)

```
5A. Admin layout + guard
    - apps/web/app/admin/layout.tsx with wallet-gate client component
    - Redirect non-keeper wallets

5B. Order queue page
    - apps/web/app/admin/page.tsx
    - Fetch pending orders from GET /api/admin/orders
    - Display order details (user, amount, caliber, timestamp, on-chain orderId)

5C. Finalization actions
    - "Finalize Mint" button -> useWriteContract -> CaliberMarket.finalizeMint(orderId, actualPriceX18)
    - "Refund Mint" button -> CaliberMarket.refundMint(orderId, reasonCode)
    - "Finalize Redeem" button -> CaliberMarket.finalizeRedeem(orderId)
    - "Cancel Redeem" button -> CaliberMarket.cancelRedeem(orderId, reasonCode)
    - Each action: confirm dialog, tx submission, wait for receipt, refresh list

5D. Admin stats
    - Protocol overview: total tokens minted, total USDC deposited, fee revenue
    - Sourced from GET /api/admin/stats
```

**Why last:** Admin dashboard needs everything working: contracts deployed, events indexed, API routes serving data, and wagmi wired for contract writes.

---

## 6. Key Technical Decisions

### Worker does NOT auto-finalize

The worker is an indexer, not a keeper. It watches events and writes to the database. The admin human reviews orders, procures ammunition off-chain, and then triggers finalization from the admin dashboard. This is the explicit design from PROJECT.md: "Worker role: event indexer only. Does NOT auto-finalize."

### Admin finalization happens client-side

The admin clicks "Finalize" in the browser. The browser uses wagmi to call `CaliberMarket.finalizeMint()` from the admin's keeper wallet. The keeper's private key never touches the server. This is the simplest and most secure pattern for a small number of admin users.

### API routes are read-heavy

Almost all API routes are GET requests that read from Prisma. The only write endpoint is POST for shipping addresses. All state-changing operations (mint, redeem, finalize) happen on-chain via direct contract calls from the browser.

### Database is the source of truth for off-chain data

On-chain data (order status, balances) is authoritative for settlement. The database stores enriched data that the chain does not have: user profiles, shipping addresses, KYC status, audit logs, and aggregated market stats. The worker keeps DB order status in sync with on-chain status by indexing events.

### Prisma schema Order.onChainOrderId links off-chain to on-chain

The critical link between the database and the blockchain is the `onChainOrderId` field. When the worker indexes a MintStarted event, it extracts the `orderId` from the event args and stores it. When the admin queries pending orders, the API returns both the DB record and the on-chain orderId so the admin can call `finalizeMint(onChainOrderId, price)`.

---

## 7. Risk Areas

**Event ordering:** If the worker misses events or processes them out of order (e.g., MintFinalized before MintStarted due to a restart), the DB could have inconsistent state. Mitigation: process events in block order, use block checkpoints, handle "update non-existent order" gracefully by creating it.

**Stale reads:** TanStack Query caches data. After a user submits a mint, the portfolio page might not show the new pending order immediately. Mitigation: invalidate relevant query keys after successful transaction submission.

**Oracle price at finalization:** The admin must supply `actualPriceX18` when calling `finalizeMint`. This is the actual cost of procurement from Ammo Squared. If the price moved significantly from the user's `requestPrice`, the slippage check or minTokensOut check could cause the finalization to revert. The admin must be aware of this and may need to refund instead.

**Multi-market event watching:** With 4 calibers, there are 4 CaliberMarket contracts each emitting 6 event types = 24 event watchers. The worker should be structured to handle this cleanly, perhaps with a factory pattern that creates watchers per market address.

---

*Architecture research: 2026-02-10*
*Informs: Phase structure in project roadmap*
