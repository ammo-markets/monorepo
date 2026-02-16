# Phase 5: Portfolio and Data Integration - Research

**Researched:** 2026-02-11
**Domain:** Frontend data integration (on-chain reads + database queries replacing mock data)
**Confidence:** HIGH

## Summary

Phase 5 replaces all mock data across the app with real on-chain reads and database queries. The codebase is well-prepared: Phase 3 established wagmi hooks (`useTokenBalances`, `useWallet`), viem `publicClient` for server-side reads, API routes (`/api/orders`, `/api/orders/[id]`, `/api/balances`, `/api/market`), and Prisma models. Phase 4 wired the mint and redeem flows with real transactions. What remains is: (1) rewiring the portfolio dashboard to use `useTokenBalances` for holdings and `/api/orders` for order history, (2) rewiring the order detail page to fetch from `/api/orders/[id]` and map DB status to stepper UI, (3) removing all 15 files' imports of `@/lib/mock-data` by replacing with real data sources.

The mock data file (`lib/mock-data.ts`) is 750 lines containing hardcoded caliber prices, portfolio holdings, portfolio orders, order details with stepper state, chart data, activity feed, protocol stats, and market ticker data. Each category needs a distinct real data source: on-chain `balanceOf` for holdings, Prisma `Order` queries for order history, on-chain oracle reads for market prices, and on-chain `totalSupply` for protocol stats.

**Primary recommendation:** Work in two sub-phases: (1) portfolio page + order detail using existing hooks/API routes, (2) systematic mock data audit replacing every remaining mock import with real chain/DB reads or realistic server components.

## Standard Stack

### Core (Already Installed)

| Library                        | Version  | Purpose                                                          | Why Standard                        |
| ------------------------------ | -------- | ---------------------------------------------------------------- | ----------------------------------- |
| wagmi                          | ^2.14.11 | Client-side contract reads via `useReadContracts`                | Already used in `useTokenBalances`  |
| viem                           | ^2.23.2  | Server-side contract reads via `publicClient`, BigInt formatting | Already used in API routes          |
| @tanstack/react-query          | ^5.66.0  | Client-side data fetching/caching for API routes                 | Already configured in providers.tsx |
| Prisma (via @ammo-exchange/db) | 7.x      | Database queries for orders, users, inventory                    | Already used in API routes          |
| zod                            | ^4.3.6   | Request validation in API routes                                 | Already used in existing API routes |

### Supporting (Already Installed)

| Library  | Version | Purpose                                             | When to Use                                                                             |
| -------- | ------- | --------------------------------------------------- | --------------------------------------------------------------------------------------- |
| next     | ^15.1.6 | Server components for initial data load, API routes | Use server components for SEO-visible data, client components for wallet-dependent data |
| date-fns | ^4.1.0  | Date formatting for order timestamps                | Replace hardcoded "2 hours ago" strings                                                 |
| recharts | 2.15.4  | Price charts                                        | Already used in `price-chart.tsx`, needs real data feed                                 |

### No New Libraries Required

No additional packages needed. The existing stack covers all Phase 5 requirements. The `useTokenBalances` hook already reads all 4 AmmoToken `balanceOf` values. The `/api/orders` and `/api/orders/[id]` routes already query Prisma. The `/api/market` route already reads oracle prices. The `/api/balances` route already reads on-chain balances server-side.

## Architecture Patterns

### Recommended Data Flow Architecture

```
Portfolio Dashboard (client component)
  |
  +-- useWallet() -> address, isConnected
  +-- useTokenBalances() -> on-chain balances per caliber (wagmi multicall)
  +-- fetch("/api/orders?wallet=0x...") -> order history from Prisma DB
  +-- fetch("/api/market") -> current prices from oracle (for portfolio value calc)

Order Detail Page (server component shell + client detail)
  |
  +-- fetch("/api/orders/[id]") -> single order from Prisma DB
  +-- On-chain tx hash -> Snowtrace link construction

Market Pages (can use server components)
  |
  +-- fetch("/api/market") -> prices from oracle
  +-- fetch("/api/balances?wallet=0x...") -> server-side balance reads
  +-- On-chain totalSupply reads -> protocol stats
```

### Pattern 1: Client-Side Portfolio with Wallet-Dependent Data

**What:** Portfolio page must be a client component because it depends on the connected wallet address from wagmi. Use `useTokenBalances()` for on-chain balances and `fetch()` + `useEffect` or React Query for API route data.
**When to use:** Any page showing user-specific data that depends on wallet connection.
**Example:**

```typescript
// Portfolio holdings from on-chain balances
const { tokens, isLoading: balancesLoading } = useTokenBalances();
const { address } = useWallet();

// Orders from database via API route
const [orders, setOrders] = useState([]);
useEffect(() => {
  if (!address) return;
  fetch(`/api/orders?wallet=${address}`)
    .then((r) => r.json())
    .then((data) => setOrders(data.orders));
}, [address]);
```

### Pattern 2: Server Component for Non-Wallet Data

**What:** Market pages, protocol stats, and public data can use Next.js server components that call API routes internally or query Prisma directly, avoiding client-side fetch waterfalls.
**When to use:** Data that doesn't depend on which wallet is connected.
**Example:**

```typescript
// Server component — no "use client" needed
export default async function MarketPage() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/market`, {
    next: { revalidate: 30 }, // ISR: refresh every 30s
  });
  const { calibers } = await res.json();
  return <MarketTable calibers={calibers} />;
}
```

### Pattern 3: DB Status to UI Status Mapping

**What:** The Prisma `OrderStatus` enum (`PENDING | PROCESSING | COMPLETED | FAILED | CANCELLED`) needs mapping to the UI's stepper steps and display badges. The existing mock data uses `"Processing" | "Shipped" | "Completed" | "Failed"` status strings with a multi-step progress stepper.
**When to use:** Order detail page, order list status badges.
**Key mapping:**

```typescript
// DB OrderStatus -> UI display
const STATUS_DISPLAY: Record<OrderStatus, string> = {
  PENDING: "Processing",
  PROCESSING: "Processing",
  COMPLETED: "Completed",
  FAILED: "Failed",
  CANCELLED: "Failed",
};

// Mint order stepper steps derived from DB status + on-chain data
function getMintSteps(order: OrderFromDB): OrderStep[] {
  return [
    {
      label: "Order Placed",
      status: "completed",
      meta: formatDate(order.createdAt),
    },
    {
      label: "USDC Deposited",
      status: order.txHash ? "completed" : "current",
      meta: order.txHash
        ? `Tx: ${truncateAddress(order.txHash)}`
        : "Waiting...",
      link: order.txHash
        ? { url: snowtraceUrl(order.txHash), label: "View" }
        : undefined,
    },
    {
      label: "Tokens Minted",
      status:
        order.status === "COMPLETED"
          ? "completed"
          : order.status === "FAILED"
            ? "failed"
            : "future",
    },
  ];
}
```

### Pattern 4: BigInt Display Convention (Established in Phase 4)

**What:** AmmoToken balances are 18-decimal BigInts. Display as `Math.floor(Number(formatUnits(raw, 18)))` to show whole rounds.
**When to use:** Everywhere token balances are displayed.
**Prior decision:** `04-02: Token balances displayed as floor(formatUnits(raw, 18)) to show whole rounds only`

### Anti-Patterns to Avoid

- **Mixing mock and real data in the same component:** Either a component is fully wired or not. No partial mock fallbacks that silently ship fake data.
- **Client-side Prisma imports:** Never import `prisma` in client components. Always go through API routes for DB access.
- **Forgetting BigInt serialization:** Prisma `BigInt` fields (like `order.amount`) must be serialized to strings before JSON.stringify. The `serializeBigInts()` utility exists for this.
- **Hardcoded wallet addresses:** The mock data has `walletAddress: "0x1a2b...3c4d"`. All wallet references must come from `useAccount()`.

## Don't Hand-Roll

| Problem                    | Don't Build                | Use Instead                                                   | Why                                                                 |
| -------------------------- | -------------------------- | ------------------------------------------------------------- | ------------------------------------------------------------------- |
| On-chain balance reads     | Custom viem multicall      | `useTokenBalances()` hook                                     | Already handles all 4 calibers + USDC, handles disconnected state   |
| BigInt JSON serialization  | Manual toString() calls    | `serializeBigInts()` from `@/lib/serialize`                   | Already handles nested objects recursively                          |
| Wallet connection state    | useState + manual check    | `useWallet()` hook                                            | Already wraps wagmi useAccount with network check                   |
| Contract address lookup    | Hardcoded addresses        | `CONTRACT_ADDRESSES.fuji.calibers[caliber]` from shared       | Single source of truth for all networks                             |
| Date formatting            | Manual string construction | `date-fns` (already installed)                                | Handles relative time ("2 hours ago"), absolute dates, localization |
| Snowtrace URL construction | String concatenation       | `snowtraceUrl()` / `snowtraceAddressUrl()` from `@/lib/utils` | Already handles testnet vs mainnet prefix                           |
| Prisma Caliber mapping     | Switch statements          | `PRISMA_TO_CALIBER` / `CALIBER_TO_PRISMA` from shared         | Bidirectional mapping already exists                                |

**Key insight:** Almost every utility needed already exists in the codebase from Phases 3-4. The work is integration (connecting existing pieces), not creation.

## Common Pitfalls

### Pitfall 1: Portfolio Page Still Using Mock Wallet State

**What goes wrong:** The current `PortfolioDashboard` uses `useState(false)` for wallet connection and simulates connect with `setTimeout`. This must be replaced with the real `useWallet()` hook.
**Why it happens:** The portfolio UI was built in Phase 2 as pure UI with no wallet integration.
**How to avoid:** Replace the entire wallet state management block at the top of `PortfolioDashboard` with `useWallet()`, following the exact pattern used in `mint-flow.tsx` and `redeem-flow.tsx`.
**Warning signs:** `useState(false)` for `walletConnected`, `setTimeout` simulating wallet connect.

### Pitfall 2: Mock Data Types vs Real Data Types Mismatch

**What goes wrong:** The mock data defines types like `PortfolioHolding` (with `balance: number`, `value: number`, `avgCost: number`, `pnl: number`) but real data has BigInt balances and no P&L tracking on-chain.
**Why it happens:** Mock types were designed for UI completeness, not for what's actually available from chain/DB.
**How to avoid:** Map real data to a simplified display type. Some fields (avgCost, pnl, pnlPercent) cannot be computed from on-chain data alone without historical transaction tracking. Either: (a) drop these columns for MVP, or (b) compute from order history in DB (sum of USDC spent / sum of tokens received = avg cost).
**Warning signs:** TypeScript errors when trying to use Prisma/viem return types where mock types were expected.

### Pitfall 3: Order Detail Stepper Steps Cannot Be Fully Derived

**What goes wrong:** The mock `OrderDetail` has rich stepper data (5-6 steps with timestamps, error messages, tracking numbers). The DB only stores `OrderStatus` (PENDING/PROCESSING/COMPLETED/FAILED/CANCELLED), `txHash`, and `createdAt/updatedAt`.
**Why it happens:** Detailed step-by-step progress tracking (warehouse verified, shipped, tracking number) requires additional DB fields or a separate order_events table that doesn't exist yet.
**How to avoid:** Simplify the stepper to match available data:

- **Mint:** Order Placed -> USDC Deposited (txHash exists) -> Tokens Minted (status COMPLETED)
- **Redeem:** Redemption Initiated -> Tokens Burned (txHash exists) -> Completed (status COMPLETED)
- Failed/Cancelled status maps to a failed step at the appropriate position.
- Shipping tracking, warehouse verification, etc. are deferred to a future phase.
  **Warning signs:** Trying to render 5+ stepper steps when only 2-3 data points exist.

### Pitfall 4: Hydration Mismatch on Wallet-Dependent Portfolio

**What goes wrong:** If the portfolio page renders server-side with no wallet but client-side detects a connected wallet, React will throw a hydration mismatch.
**Why it happens:** wagmi's `useAccount` returns different values on server (no wallet) vs client (reconnecting wallet).
**How to avoid:** Use the `isReconnecting` guard established in Phase 3 (`03-01: isReconnecting guard in WalletButton to prevent SSR hydration mismatch`). Show skeleton/loading state while `isReconnecting` is true.
**Warning signs:** Console errors about hydration mismatch, flash of disconnected state on page load.

### Pitfall 5: Mock Data Import Left Behind in Barrel Exports

**What goes wrong:** A file stops directly importing from `mock-data.ts` but a type re-export or barrel export still references it, keeping the mock data in the bundle.
**Why it happens:** Types like `CaliberId`, `CaliberDetailData`, `PortfolioOrder` are defined in `mock-data.ts` and imported across 15 files.
**How to avoid:** Move all reusable types to `@ammo-exchange/shared` or a dedicated `@/lib/types.ts` before removing mock-data imports. Then delete `mock-data.ts` entirely and verify the build succeeds.
**Warning signs:** Build succeeds but `mock-data.ts` still appears in the bundle analysis.

### Pitfall 6: Missing Error/Empty States After Mock Removal

**What goes wrong:** Components that previously showed hardcoded data now show nothing or crash when API calls fail.
**Why it happens:** Mock data never fails. Real API calls can return errors, empty arrays, or undefined.
**How to avoid:** Every data fetch needs three states: loading (skeleton), error (error message), and empty (empty state component). The portfolio dashboard already has `EmptyHoldings`, `EmptyOrders`, and skeleton components -- make sure they're properly wired to real loading/error states.
**Warning signs:** White screens, undefined property access errors in production.

## Code Examples

### Fetching Orders for Portfolio (Client Component)

```typescript
// Source: Existing pattern from apps/web/app/api/orders/route.ts
// Client-side fetch in portfolio dashboard
const [orders, setOrders] = useState<OrderFromAPI[]>([]);
const [ordersLoading, setOrdersLoading] = useState(true);

useEffect(() => {
  if (!address) return;
  setOrdersLoading(true);
  fetch(`/api/orders?wallet=${address}`)
    .then((r) => r.json())
    .then((data) => setOrders(data.orders ?? []))
    .catch(() => setOrders([]))
    .finally(() => setOrdersLoading(false));
}, [address]);
```

### Computing Portfolio Value from On-Chain Balances + Prices

```typescript
// Source: Derived from existing useTokenBalances + /api/market patterns
import { formatUnits } from "viem";

// tokens: Record<Caliber, bigint | undefined> from useTokenBalances()
// prices: Record<Caliber, number> from /api/market

function computePortfolioValue(
  tokens: Record<Caliber, bigint | undefined>,
  prices: Record<Caliber, number>,
): number {
  return CALIBERS.reduce((total, caliber) => {
    const rawBalance = tokens[caliber];
    if (!rawBalance) return total;
    const rounds = Math.floor(Number(formatUnits(rawBalance, 18)));
    return total + rounds * prices[caliber];
  }, 0);
}
```

### Order Detail API Response to Stepper Steps

```typescript
// Source: Derived from existing order-detail.tsx mock pattern + Prisma Order model

interface OrderFromAPI {
  id: string;
  type: "MINT" | "REDEEM";
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED" | "CANCELLED";
  caliber: Caliber;
  amount: string; // BigInt serialized as string
  txHash: string | null;
  onChainOrderId: string | null;
  createdAt: string; // ISO date
  updatedAt: string;
  shippingAddress: {
    name: string;
    line1: string;
    city: string;
    state: string;
    zip: string;
  } | null;
}

function buildMintSteps(order: OrderFromAPI): OrderStep[] {
  const isTxConfirmed = !!order.txHash;
  const isCompleted = order.status === "COMPLETED";
  const isFailed = order.status === "FAILED" || order.status === "CANCELLED";

  return [
    {
      label: "Order Placed",
      status: "completed",
      meta: formatRelative(order.createdAt),
    },
    {
      label: "USDC Deposited",
      status: isTxConfirmed ? "completed" : isFailed ? "failed" : "current",
      meta: order.txHash
        ? `Tx: ${truncateAddress(order.txHash)}`
        : "Awaiting confirmation...",
      link: order.txHash
        ? { url: snowtraceUrl(order.txHash), label: "View on Snowtrace" }
        : undefined,
    },
    {
      label: "Tokens Minted",
      status: isCompleted ? "completed" : isFailed ? "failed" : "future",
      meta: isCompleted ? formatRelative(order.updatedAt) : undefined,
    },
  ];
}
```

### Replacing Market Ticker Mock Data

```typescript
// Source: Existing /api/market route returns { calibers: [{caliber, name, pricePerRound, priceX18}] }
// Client component fetches prices, replaces hardcoded calibers array

const [marketData, setMarketData] = useState<MarketCaliber[]>([]);

useEffect(() => {
  fetch("/api/market")
    .then((r) => r.json())
    .then((data) => setMarketData(data.calibers))
    .catch(() => {});
}, []);
```

### Protocol Stats from On-Chain Data

```typescript
// Source: Derived from AmmoToken ABI (totalSupply) and AmmoFactory ABI

// Read totalSupply for each AmmoToken
const totalSupplies = await Promise.all(
  CALIBERS.map((caliber) =>
    publicClient.readContract({
      address: fuji.calibers[caliber].token,
      abi: AmmoTokenAbi,
      functionName: "totalSupply",
    }),
  ),
);

const totalRoundsTokenized = totalSupplies.reduce(
  (sum, supply) => sum + Math.floor(Number(formatUnits(supply, 18))),
  0,
);
```

## State of the Art

| Old Approach                         | Current Approach                 | When Changed                          | Impact                                               |
| ------------------------------------ | -------------------------------- | ------------------------------------- | ---------------------------------------------------- |
| Mock data file with hardcoded values | Real on-chain reads + DB queries | Phase 3 (API routes), Phase 4 (hooks) | Foundation already built, Phase 5 connects the dots  |
| `useState(false)` for wallet         | `useWallet()` with wagmi         | Phase 3                               | Portfolio page is the last holdout                   |
| Hardcoded order stepper steps        | Derive from DB status + txHash   | Phase 5 (this phase)                  | Simplified stepper (3 steps vs 5-6 mock steps)       |
| Number-typed balances                | BigInt balances with formatUnits | Phase 3-4                             | `floor(formatUnits(raw, 18))` convention established |

## Mock Data Audit: Files and Replacement Strategy

Each file importing from `@/lib/mock-data` with its specific mock dependencies:

| File                                         | Imports Used                                                    | Replacement Source                                                                                       |
| -------------------------------------------- | --------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `features/portfolio/portfolio-dashboard.tsx` | `portfolioHoldings`, `portfolioOrders`, `portfolioStats`, types | `useTokenBalances()` + `/api/orders` + `/api/market`                                                     |
| `features/portfolio/order-detail.tsx`        | `orderDetails`, types                                           | `/api/orders/[id]` + derive stepper from DB status                                                       |
| `features/mint/mint-flow.tsx`                | `caliberDetails`, `CaliberDetailData`                           | Already partially wired (Phase 4). `caliberDetails` used for price display -- replace with `/api/market` |
| `features/redeem/redeem-flow.tsx`            | `caliberDetails`, `CaliberId`, `CaliberDetailData`              | Same as mint-flow                                                                                        |
| `features/market/market-ticker.tsx`          | `calibers`                                                      | `/api/market` prices                                                                                     |
| `features/market/market-cards.tsx`           | `calibers`                                                      | `/api/market` prices                                                                                     |
| `features/market/market-table.tsx`           | `marketCalibers`, `MarketCaliberData`                           | `/api/market` + on-chain `totalSupply` reads                                                             |
| `features/market/caliber-header.tsx`         | `CaliberDetailData`, `CaliberId` types                          | Move types to shared, data from `/api/market`                                                            |
| `features/market/action-panel.tsx`           | `CaliberDetailData`, `CaliberId` types                          | Move types to shared, data from `/api/market`                                                            |
| `features/market/token-stats.tsx`            | `CaliberDetailData` type                                        | Move type to shared, data from props                                                                     |
| `features/market/price-chart.tsx`            | `CaliberId`, `chartDataByCaliber`                               | Needs chart data API or on-chain event logs (deferred to future)                                         |
| `features/market/activity-feed.tsx`          | `recentActivity`                                                | Needs recent events API from DB (Order model query)                                                      |
| `features/home/protocol-stats.tsx`           | `protocolStats`                                                 | On-chain `totalSupply` reads + DB count queries                                                          |
| `features/trade/swap-widget.tsx`             | `caliberDetails`, `CaliberId`                                   | `/api/market`                                                                                            |
| `app/market/[caliber]/page.tsx`              | `caliberDetails`, `CaliberId`                                   | `/api/market` (can be server component)                                                                  |

### Types to Extract from mock-data.ts

These types are reused across many files and must be preserved:

| Type                                     | Used By  | Move To                                                                    |
| ---------------------------------------- | -------- | -------------------------------------------------------------------------- |
| `CaliberId`                              | 8+ files | Already exists as `Caliber` in `@ammo-exchange/shared` -- use that instead |
| `CaliberDetailData`                      | 5 files  | Create `@/lib/types.ts` or extend shared types                             |
| `PortfolioHolding`                       | 1 file   | Define inline or in `@/lib/types.ts`                                       |
| `PortfolioOrder`                         | 1 file   | Derive from Prisma Order type                                              |
| `OrderDetail`, `OrderStep`, `StepStatus` | 1 file   | Define in order-detail component or `@/lib/types.ts`                       |
| `MarketCaliberData`                      | 1 file   | Define inline or in `@/lib/types.ts`                                       |

## Open Questions

1. **Price Chart Data Source**
   - What we know: `price-chart.tsx` uses `chartDataByCaliber` from mock data (30 data points over 30 days). No on-chain historical price API exists.
   - What's unclear: Where to source real historical price data. Options: (a) store oracle price snapshots in DB via worker cron job, (b) use a third-party price API, (c) keep charts as mock/placeholder until data pipeline exists.
   - Recommendation: For Phase 5, either defer chart data integration or create a minimal `price_snapshots` table that the worker populates. If deferred, replace the chart with a "coming soon" or single current-price display. The success criteria say "no mock data remains" which means charts need at least a real data source.

2. **Activity Feed Data Source**
   - What we know: `activity-feed.tsx` shows recent mint/redeem activity with addresses and amounts. The DB already stores Orders with wallet addresses, amounts, and timestamps.
   - What's unclear: Whether to query the DB (all users' recent orders) or read on-chain events for the activity feed.
   - Recommendation: Query the DB via a new `/api/activity` route that returns the 10 most recent COMPLETED orders across all users. This is simpler and faster than reading on-chain events.

3. **P&L and Average Cost Computation**
   - What we know: The mock `PortfolioHolding` type includes `avgCost`, `pnl`, `pnlPercent`. Computing these requires knowing the historical cost basis per token, which means aggregating all past mint orders for each caliber.
   - What's unclear: Whether this is in scope for Phase 5 MVP.
   - Recommendation: Drop P&L columns from the holdings table for now. Show only: caliber, balance (rounds), current price, current value. The Order history table already shows all past orders. P&L can be a future enhancement.

4. **24h Change Percentage**
   - What we know: The mock data shows `change24h` percentages for each caliber and the portfolio. Computing this requires yesterday's price, which requires historical price storage.
   - What's unclear: Whether to show change data without a price history mechanism.
   - Recommendation: Omit 24h change for MVP. Show current price only. Or show "N/A" with a tooltip explaining historical data is coming. The success criteria don't specifically require price change data -- only real balances, order history, and transaction links.

5. **Portfolio Total Value Header**
   - What we know: The current header shows `$175.96` total value with 24h change. Computing total value requires multiplying each token balance by its current oracle price.
   - What's unclear: Whether to include USDC balance in total portfolio value.
   - Recommendation: Total value = sum of (token_balance \* oracle_price) for each caliber. Optionally show USDC balance separately. Fetch prices from `/api/market` alongside balances from `useTokenBalances()`.

## Sources

### Primary (HIGH confidence)

- Codebase inspection: `apps/web/lib/mock-data.ts` (750 lines, all mock data)
- Codebase inspection: `apps/web/hooks/use-token-balances.ts` (existing balance hook)
- Codebase inspection: `apps/web/app/api/orders/route.ts` (existing orders API)
- Codebase inspection: `apps/web/app/api/orders/[id]/route.ts` (existing order detail API)
- Codebase inspection: `apps/web/app/api/market/route.ts` (existing market prices API)
- Codebase inspection: `apps/web/app/api/balances/route.ts` (existing balances API)
- Codebase inspection: `packages/db/prisma/schema.prisma` (Order, User, Inventory models)
- Codebase inspection: `packages/shared/src/constants/index.ts` (PRISMA_TO_CALIBER mapping)
- Codebase inspection: `packages/contracts/src/abis/AmmoToken.ts` (balanceOf, totalSupply)

### Secondary (MEDIUM confidence)

- Prior phase decisions documented in phase context (03-01 through 04-02)
- Established patterns from `mint-flow.tsx` and `redeem-flow.tsx` (Phase 4 wiring)

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH - all libraries already installed and in use
- Architecture: HIGH - all API routes and hooks exist, pattern is "connect existing pieces"
- Pitfalls: HIGH - directly observed mock data types vs real data shape mismatches in codebase
- Mock audit: HIGH - grep of all 15 files importing mock-data confirmed and categorized
- Open questions: MEDIUM - chart data and P&L are genuinely unclear scope decisions

**Research date:** 2026-02-11
**Valid until:** 2026-03-11 (stable, no library changes expected)
