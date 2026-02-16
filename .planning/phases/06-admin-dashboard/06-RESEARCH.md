# Phase 6: Admin Dashboard - Research

**Researched:** 2026-02-11
**Domain:** Web3 admin dashboard with on-chain role gating, order management, and protocol analytics
**Confidence:** HIGH

## Summary

Phase 6 builds a keeper-only admin dashboard that lets protocol operators manage pending mint/redeem orders and monitor protocol health. The dashboard requires three distinct capabilities: (1) access control gating `/admin/*` routes to keeper wallets only, (2) order queue management with on-chain finalization actions, and (3) protocol stats read from the chain.

The primary technical challenge is route gating. Next.js middleware runs on the Edge Runtime and has no access to client-side wallet state (wagmi hooks). The solution is a **two-layer auth pattern**: middleware checks a cookie/header for the wallet address, and the client-side layout component performs the actual on-chain `isKeeper(address)` check via wagmi, rendering an "Access Denied" page for non-keepers. This avoids the impossible task of reading on-chain state from Edge middleware while still providing a clean UX.

The finalization hooks follow the exact same `useWriteContract` + `useWaitForTransactionReceipt` pattern already established in `use-mint-transaction.ts` and `use-redeem-transaction.ts`. The stats dashboard uses the same `readContract` + `Promise.all` pattern from `/api/market/route.ts`. No new libraries are needed.

**Primary recommendation:** Use client-side `isKeeper` check in a shared admin layout component (not middleware) for the actual role gate, with an optional lightweight middleware that checks for a connected wallet cookie as a fast pre-filter.

## Standard Stack

### Core

| Library               | Version  | Purpose                                                                 | Why Standard      |
| --------------------- | -------- | ----------------------------------------------------------------------- | ----------------- |
| Next.js App Router    | 15.x     | Route groups, layouts, middleware                                       | Already in use    |
| wagmi                 | 2.x      | `useReadContract` for isKeeper, `useWriteContract` for finalize actions | Already in use    |
| viem                  | 2.x      | `readContract` for server-side on-chain reads (stats API)               | Already in use    |
| @tanstack/react-query | 5.x      | Data fetching for admin API routes                                      | Already in use    |
| Prisma                | existing | Query pending orders from DB                                            | Already in use    |
| shadcn/ui             | existing | Table, Badge, Button, Card, Tabs, Dialog, Select, Input components      | Already installed |
| zod                   | 4.x      | Request validation for admin API routes                                 | Already in use    |

### Supporting

| Library      | Version | Purpose                                                       | When to Use       |
| ------------ | ------- | ------------------------------------------------------------- | ----------------- |
| lucide-react | 0.563.x | Icons for admin UI (Shield, AlertTriangle, CheckCircle, etc.) | Already installed |
| sonner       | 2.x     | Toast notifications for tx success/error                      | Already installed |
| date-fns     | 4.x     | Relative time formatting (e.g., "2 hours ago")                | Already installed |

### Alternatives Considered

| Instead of                               | Could Use                              | Tradeoff                                                                                                                                                                                                    |
| ---------------------------------------- | -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Client-side isKeeper check               | SIWE (Sign-In with Ethereum) full auth | SIWE is heavier -- requires message signing, session management, and a backend session store. Overkill for a testnet admin panel with a known set of keeper addresses. Could be added later for production. |
| Cookie-based wallet in middleware        | Env-var allowlist in middleware        | Simpler but brittle -- requires redeployment to change keepers. On-chain check is the source of truth.                                                                                                      |
| Server-side on-chain check in API routes | Client-side only check                 | Adds latency to admin API calls. Better to gate at the UI layer and trust the on-chain contract for the actual tx access control.                                                                           |

**Installation:**

```bash
# No new packages needed -- everything is already installed
```

## Architecture Patterns

### Recommended Project Structure

```
apps/web/
├── app/
│   ├── admin/
│   │   ├── layout.tsx           # Admin layout with isKeeper gate + sidebar nav
│   │   ├── page.tsx             # Dashboard overview (stats)
│   │   ├── mint-orders/
│   │   │   └── page.tsx         # Pending mint orders queue
│   │   └── redeem-orders/
│   │       └── page.tsx         # Pending redeem orders queue
│   ├── api/
│   │   └── admin/
│   │       ├── orders/
│   │       │   └── route.ts     # GET pending orders (mint + redeem)
│   │       └── stats/
│   │           └── route.ts     # GET protocol stats from chain
│   └── middleware.ts            # Optional: fast pre-filter on wallet cookie
├── features/
│   └── admin/
│       ├── index.ts
│       ├── admin-layout-gate.tsx  # Client component: isKeeper check + access denied
│       ├── mint-orders-table.tsx  # Pending mint orders with finalize action
│       ├── redeem-orders-table.tsx # Pending redeem orders with finalize action
│       ├── protocol-stats.tsx     # Stats cards (total minted, redeemed, treasury)
│       └── finalize-dialog.tsx    # Confirmation dialog for finalize actions
├── hooks/
│   ├── use-keeper-check.ts       # wagmi useReadContract for AmmoManager.isKeeper
│   ├── use-finalize-mint.ts      # useWriteContract for CaliberMarket.finalizeMint
│   └── use-finalize-redeem.ts    # useWriteContract for CaliberMarket.finalizeRedeem
```

### Pattern 1: Two-Layer Admin Route Gating

**What:** Combine an optional middleware pre-filter with a client-side on-chain role check in the admin layout.

**When to use:** When the authorization source of truth is an on-chain contract (AmmoManager.isKeeper) but middleware runs on Edge Runtime without access to wallet state or RPC.

**How it works:**

1. **Middleware (optional fast-fail):** Checks for a `wallet` cookie (set by the wallet connection flow). If no cookie, redirect to a connect-wallet page or the homepage. This is a performance optimization, not a security gate.

2. **Admin Layout Component (actual gate):** A client component wraps all `/admin/*` pages. It uses `useAccount()` to get the connected address, then calls `useReadContract` on `AmmoManager.isKeeper(address)`. Three states:
   - Not connected: show "Connect your wallet" prompt
   - Connected but not keeper: show "Access Denied" message
   - Connected and keeper: render children (the admin page)

3. **On-chain enforcement (ultimate security):** The `finalizeMint` and `finalizeRedeem` contract functions have `onlyKeeper` modifiers. Even if the UI were bypassed, the transaction would revert.

```typescript
// hooks/use-keeper-check.ts
"use client";

import { useAccount, useReadContract } from "wagmi";
import { AmmoManagerAbi } from "@ammo-exchange/contracts/abis";
import { CONTRACT_ADDRESSES } from "@ammo-exchange/shared";

export function useKeeperCheck(): {
  isKeeper: boolean;
  isLoading: boolean;
  isConnected: boolean;
  address: `0x${string}` | undefined;
} {
  const { address, isConnected } = useAccount();

  const { data: isKeeper, isLoading } = useReadContract({
    address: CONTRACT_ADDRESSES.fuji.manager,
    abi: AmmoManagerAbi,
    functionName: "isKeeper",
    args: [address!],
    query: {
      enabled: isConnected && !!address,
    },
  });

  return {
    isKeeper: !!isKeeper,
    isLoading,
    isConnected,
    address,
  };
}
```

```typescript
// features/admin/admin-layout-gate.tsx
"use client";

import type { ReactNode } from "react";
import { useKeeperCheck } from "@/hooks/use-keeper-check";

export function AdminLayoutGate({ children }: { children: ReactNode }) {
  const { isKeeper, isLoading, isConnected } = useKeeperCheck();

  if (isLoading) return <AdminSkeleton />;
  if (!isConnected) return <ConnectWalletPrompt />;
  if (!isKeeper) return <AccessDenied />;

  return <>{children}</>;
}
```

### Pattern 2: Finalize Transaction Hooks

**What:** Hooks for keeper-only contract calls (`finalizeMint`, `finalizeRedeem`) following the established two-hook pattern.

**When to use:** When the admin clicks "Finalize" on a pending order row.

**Key difference from user hooks:** These are single-step (no approve needed) because the keeper is calling the contract directly, not transferring tokens.

```typescript
// hooks/use-finalize-mint.ts
"use client";

import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { CaliberMarketAbi } from "@ammo-exchange/contracts/abis";
import { CONTRACT_ADDRESSES } from "@ammo-exchange/shared";
import type { Caliber } from "@ammo-exchange/shared";

export function useFinalizeMint(caliber: Caliber): {
  finalizeMint: (orderId: bigint, actualPriceX18: bigint) => void;
  hash: `0x${string}` | undefined;
  error: Error | null;
  isPending: boolean;
  isConfirming: boolean;
  isConfirmed: boolean;
  reset: () => void;
} {
  const marketAddress = CONTRACT_ADDRESSES.fuji.calibers[caliber].market;

  const {
    data: hash,
    error,
    isPending,
    writeContract,
    reset,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash });

  function finalizeMint(orderId: bigint, actualPriceX18: bigint) {
    writeContract({
      address: marketAddress,
      abi: CaliberMarketAbi,
      functionName: "finalizeMint",
      args: [orderId, actualPriceX18],
    });
  }

  return {
    finalizeMint,
    hash,
    error,
    isPending,
    isConfirming,
    isConfirmed,
    reset,
  };
}
```

### Pattern 3: Admin API Routes with DB Queries

**What:** Server-side API routes that query pending orders from Prisma, returning data enriched with on-chain info.

**When to use:** Admin order queues need server data (from DB) combined with on-chain data (from viem readContract).

```typescript
// app/api/admin/orders/route.ts
import { prisma } from "@ammo-exchange/db";
import { PRISMA_TO_CALIBER } from "@ammo-exchange/shared";
import { serializeBigInts } from "@/lib/serialize";

export async function GET(request: NextRequest) {
  const type = request.nextUrl.searchParams.get("type"); // "MINT" | "REDEEM"

  const orders = await prisma.order.findMany({
    where: {
      status: "PENDING",
      ...(type ? { type: type as "MINT" | "REDEEM" } : {}),
    },
    orderBy: { createdAt: "desc" },
    include: {
      shippingAddress: true,
      user: { select: { kycStatus: true } },
    },
  });

  // Map Prisma caliber enum to shared Caliber type
  const mapped = orders.map((order) => ({
    ...order,
    caliber: PRISMA_TO_CALIBER[order.caliber],
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
  }));

  return Response.json({ orders: serializeBigInts(mapped) });
}
```

### Pattern 4: Protocol Stats via On-Chain Reads

**What:** Server-side API route that reads protocol stats directly from the chain using the existing `publicClient`.

**When to use:** ADMIN-06 stats dashboard showing total minted, total redeemed, treasury USDC balance.

```typescript
// app/api/admin/stats/route.ts
import { publicClient } from "@/lib/viem";
import { AmmoTokenAbi, CaliberMarketAbi } from "@ammo-exchange/contracts/abis";
import { CONTRACT_ADDRESSES } from "@ammo-exchange/shared";
import { erc20Abi, formatUnits } from "viem";

// Total supply per caliber = total minted (net of burns)
// Treasury USDC = balanceOf(treasury address) on USDC contract
// Total redeemed = query from DB (sum of COMPLETED REDEEM orders)
```

### Anti-Patterns to Avoid

- **Server-side on-chain isKeeper check in middleware:** Edge Runtime has no access to RPC providers in a reliable way. Even if you used `fetch` to call an RPC, it adds latency to every `/admin/*` request and is fragile. The on-chain contract already enforces keeper-only access at the transaction level.

- **Storing keeper addresses in environment variables:** This creates a divergence between the on-chain source of truth (AmmoManager.keepers mapping) and the application config. When keepers are added/removed on-chain, the env var becomes stale.

- **Using a single useWriteContract for both finalizeMint and finalizeRedeem:** The established codebase pattern uses separate hook instances to prevent state collision. Follow this pattern.

- **Polling for order updates in admin UI:** After a finalize transaction confirms, update the local state optimistically or refetch from the API. Don't poll on an interval.

- **Skipping the confirmation dialog for finalize actions:** These are irreversible on-chain actions. Always require a confirmation step with the order details and actualPriceX18 visible.

## Don't Hand-Roll

| Problem                                    | Don't Build                  | Use Instead                                                     | Why                                                                 |
| ------------------------------------------ | ---------------------------- | --------------------------------------------------------------- | ------------------------------------------------------------------- |
| Data tables with sorting/filtering         | Custom table with sort logic | shadcn/ui `<Table>` + React state for sort/filter               | Already installed, accessible, consistent with app style            |
| Toast notifications for tx results         | Custom notification system   | `sonner` (already installed)                                    | Proven, accessible, already in deps                                 |
| Form validation for actualPriceX18 input   | Manual validation logic      | `zod` schema + `react-hook-form`                                | Already in deps, established pattern                                |
| Loading skeletons                          | Custom shimmer components    | Existing `shimmer` CSS class + skeleton patterns from portfolio | Consistent loading UX across the app                                |
| Error message parsing for contract reverts | Custom error mapper          | Existing `parseContractError()` from `lib/errors.ts`            | Already handles all CaliberMarket custom errors including NotKeeper |

**Key insight:** This phase requires no new libraries. Every building block (wagmi hooks, viem reads, Prisma queries, shadcn components, error handling) already exists in the codebase. The work is composing existing patterns into new admin-specific pages.

## Common Pitfalls

### Pitfall 1: Middleware Cannot Read On-Chain State

**What goes wrong:** Attempting to call `readContract` or any viem function inside `middleware.ts`. Edge Runtime lacks Node.js APIs and reliable RPC access.
**Why it happens:** Natural instinct is to put auth checks in middleware since Next.js docs recommend it for route protection.
**How to avoid:** Use middleware only for lightweight checks (cookie presence, header values). Put the actual isKeeper on-chain check in the admin layout client component.
**Warning signs:** Errors about `crypto`, `Buffer`, or `fetch` in middleware; middleware timing out.

### Pitfall 2: BigInt Serialization in Admin API Responses

**What goes wrong:** `JSON.stringify` throws on BigInt values from Prisma's `amount` field or on-chain reads.
**Why it happens:** JavaScript's JSON serializer doesn't handle BigInt natively.
**How to avoid:** Use the existing `serializeBigInts()` from `lib/serialize.ts` on all API responses containing order data or on-chain values.
**Warning signs:** `TypeError: Do not know how to serialize a BigInt` in API route responses.

### Pitfall 3: Prisma Caliber Enum Mismatch

**What goes wrong:** Comparing `order.caliber` (Prisma enum like `NINE_MM`) with shared `Caliber` type (`9MM`) directly.
**Why it happens:** Prisma enums can't start with digits, so the enum values differ from the shared type.
**How to avoid:** Always use `PRISMA_TO_CALIBER[order.caliber]` when sending data to the frontend, and `CALIBER_TO_PRISMA[caliber]` when querying the DB.
**Warning signs:** Empty query results, caliber displayed as "NINE_MM" instead of "9MM" in the UI.

### Pitfall 4: actualPriceX18 Input Precision

**What goes wrong:** Admin enters a price like "0.35" (35 cents per round) but the contract expects an 18-decimal fixed-point value (350000000000000000).
**Why it happens:** The contract uses X18 notation (price \* 1e18) but humans think in dollars.
**How to avoid:** Provide a human-readable price input (e.g., "$0.35 per round") and use `parseUnits(priceStr, 18)` to convert to the X18 format before sending the transaction.
**Warning signs:** MinMintNotMet or Slippage reverts because the price was passed as raw decimal instead of X18.

### Pitfall 5: Stale Order State After Finalization

**What goes wrong:** After a finalize transaction confirms on-chain, the order still shows as "PENDING" in the admin table.
**Why it happens:** The DB update happens asynchronously via the event indexer worker, not synchronously with the admin's transaction.
**How to avoid:** After tx confirmation, either: (a) optimistically update the local UI state, or (b) refetch the admin orders API after a brief delay (1-2 seconds) to allow the worker to process the event. Show a "confirming..." state in the interim.
**Warning signs:** Admin sees order still pending after successful finalization, refreshes page, order disappears.

### Pitfall 6: Explicit Return Types on Transaction Hooks (TS2742)

**What goes wrong:** TypeScript error TS2742 when hook return type is inferred and contains wagmi internal types.
**Why it happens:** wagmi's internal types aren't re-exportable from the consuming package.
**How to avoid:** Always provide explicit return type annotations on transaction hooks, as done in `use-mint-transaction.ts` and `use-redeem-transaction.ts`.
**Warning signs:** Build fails with "The inferred type of X cannot be named without a reference to..."

## Code Examples

Verified patterns from the existing codebase:

### Reading On-Chain isKeeper Status (Client-Side)

```typescript
// Source: Existing pattern from hooks/use-token-balances.ts + AmmoManager ABI
import { useReadContract } from "wagmi";
import { AmmoManagerAbi } from "@ammo-exchange/contracts/abis";
import { CONTRACT_ADDRESSES } from "@ammo-exchange/shared";

const { data: isKeeper, isLoading } = useReadContract({
  address: CONTRACT_ADDRESSES.fuji.manager,
  abi: AmmoManagerAbi,
  functionName: "isKeeper",
  args: [address!],
  query: { enabled: isConnected && !!address },
});
```

### Writing finalizeMint Transaction

```typescript
// Source: Pattern from hooks/use-mint-transaction.ts adapted for keeper actions
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { CaliberMarketAbi } from "@ammo-exchange/contracts/abis";

const {
  data: hash,
  writeContract,
  isPending,
  error,
  reset,
} = useWriteContract();
const { isLoading: isConfirming, isSuccess: isConfirmed } =
  useWaitForTransactionReceipt({ hash });

// Call with: orderId (uint256) and actualPriceX18 (uint256)
writeContract({
  address: marketAddress,
  abi: CaliberMarketAbi,
  functionName: "finalizeMint",
  args: [orderId, actualPriceX18],
});
```

### Querying Pending Orders from Prisma

```typescript
// Source: Pattern from app/api/orders/route.ts
const pendingMints = await prisma.order.findMany({
  where: { status: "PENDING", type: "MINT" },
  orderBy: { createdAt: "desc" },
  include: {
    shippingAddress: true,
    user: { select: { kycStatus: true } },
  },
});
```

### Reading Treasury USDC Balance (Server-Side)

```typescript
// Source: Pattern from app/api/market/route.ts
import { publicClient } from "@/lib/viem";
import { erc20Abi, formatUnits } from "viem";
import { CONTRACT_ADDRESSES } from "@ammo-exchange/shared";

// Read treasury address from AmmoManager
const treasury = await publicClient.readContract({
  address: CONTRACT_ADDRESSES.fuji.manager,
  abi: AmmoManagerAbi,
  functionName: "treasury",
});

// Read USDC balance of treasury
const usdcBalance = await publicClient.readContract({
  address: CONTRACT_ADDRESSES.fuji.usdc,
  abi: erc20Abi,
  functionName: "balanceOf",
  args: [treasury],
});

const usdcFormatted = formatUnits(usdcBalance, 6);
```

### Reading Total Supply Per Caliber

```typescript
// Source: Existing pattern in app/api/market/route.ts
const CALIBERS = ["9MM", "556", "22LR", "308"] as const;

const supplies = await Promise.all(
  CALIBERS.map((caliber) =>
    publicClient
      .readContract({
        address: CONTRACT_ADDRESSES.fuji.calibers[caliber].token,
        abi: AmmoTokenAbi,
        functionName: "totalSupply",
      })
      .catch(() => BigInt(0)),
  ),
);
```

### Admin Middleware (Optional Pre-Filter)

```typescript
// Source: Next.js 15 middleware docs
// File: apps/web/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Only apply to /admin routes
  // Check for wallet cookie as a lightweight pre-filter
  // The real isKeeper check happens client-side in the admin layout
  const wallet = request.cookies.get("wallet-address")?.value;

  if (!wallet) {
    // Redirect to homepage or show a connect-wallet page
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/admin/:path*",
};
```

## State of the Art

| Old Approach                | Current Approach                 | When Changed       | Impact                                                       |
| --------------------------- | -------------------------------- | ------------------ | ------------------------------------------------------------ |
| getServerSideProps for auth | Middleware + Layout components   | Next.js 13+ (2023) | Auth checks moved to middleware and layout, pages stay clean |
| wagmi v1 `useContractRead`  | wagmi v2 `useReadContract`       | wagmi v2 (2024)    | API renamed, TanStack Query integration improved             |
| Manual tx status tracking   | `useWaitForTransactionReceipt`   | wagmi v2 (2024)    | Built-in receipt waiting replaces custom polling             |
| Pages Router middleware     | App Router middleware (same API) | Next.js 13+ (2023) | Middleware API stable, works identically in App Router       |

**Deprecated/outdated:**

- `useContractRead` (wagmi v1): replaced by `useReadContract` in v2
- `useContractWrite` (wagmi v1): replaced by `useWriteContract` in v2
- `getServerSideProps` auth pattern: replaced by middleware + layout auth

## Open Questions

1. **Cookie for wallet address pre-filter**
   - What we know: The existing codebase doesn't set any wallet-address cookie. The `useWallet` hook uses wagmi's `useAccount` for client-side state.
   - What's unclear: Whether to add cookie-setting logic to the wallet connection flow, or skip middleware entirely and rely only on the client-side layout gate.
   - Recommendation: Skip the middleware cookie approach for now. The client-side `AdminLayoutGate` component is sufficient and simpler. The on-chain contract enforces keeper-only access at the transaction level regardless. Middleware can be added later if needed.

2. **Admin API route authorization**
   - What we know: The admin API routes (`/api/admin/orders`, `/api/admin/stats`) return sensitive data (all pending orders, all users' shipping addresses).
   - What's unclear: Whether these API routes need their own authorization check, or if the UI-level gate is enough.
   - Recommendation: For testnet, the UI-level gate is sufficient since the data isn't truly sensitive. For production, add a SIWE-based session check to admin API routes. Flag this as a production TODO.

3. **Order refetch timing after finalization**
   - What we know: The worker processes events asynchronously. After the admin's finalize tx confirms, the DB update may lag by 4-8 seconds (worker poll interval is 4s).
   - What's unclear: Whether to optimistically update UI or wait for DB sync.
   - Recommendation: Optimistically remove the finalized order from the pending queue in the UI immediately after tx confirmation. Show a success toast. The next API refetch will sync with the DB state.

4. **Total redeemed stat source**
   - What we know: "Total redeemed" is not directly readable from a single contract call. It could be derived from: (a) DB count of COMPLETED REDEEM orders, or (b) difference between totalSupply and total ever minted.
   - What's unclear: Which source is canonical.
   - Recommendation: Use DB aggregation (`prisma.order.aggregate` with `type: "REDEEM"`, `status: "COMPLETED"`) for the total redeemed count. This is simpler and already available.

## Sources

### Primary (HIGH confidence)

- Codebase analysis: `packages/contracts/src/CaliberMarket.sol` - finalizeMint/finalizeRedeem signatures, onlyKeeper modifier
- Codebase analysis: `packages/contracts/src/AmmoManager.sol` - isKeeper(address) view function
- Codebase analysis: `apps/web/hooks/use-mint-transaction.ts` - established useWriteContract pattern with explicit return types
- Codebase analysis: `apps/web/app/api/market/route.ts` - established readContract + Promise.all pattern for on-chain reads
- Codebase analysis: `apps/web/app/api/orders/route.ts` - established Prisma query + PRISMA_TO_CALIBER mapping pattern
- Codebase analysis: `packages/db/prisma/schema.prisma` - Order model with status, type, caliber, shippingAddress relation, User model with kycStatus
- Codebase analysis: `apps/web/lib/errors.ts` - existing parseContractError with NotKeeper handling

### Secondary (MEDIUM confidence)

- [Next.js Middleware docs](https://nextjs.org/docs/15/pages/api-reference/file-conventions/middleware) - middleware.ts matcher config, cookie access API
- [wagmi docs](https://wagmi.sh/react/guides/viem) - useReadContract, useWriteContract patterns

### Tertiary (LOW confidence)

- Web search re: Next.js 16 proxy replacing middleware - noted for awareness but not relevant until upgrade

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH - All libraries already installed and in use. No new dependencies.
- Architecture: HIGH - All patterns (hook structure, API routes, DB queries, on-chain reads) are directly copied from existing codebase patterns.
- Pitfalls: HIGH - Identified from direct codebase analysis (BigInt serialization, Prisma enum mapping, TS2742) plus Web3-specific issues (X18 price format, stale state after tx).
- Route gating approach: MEDIUM - The two-layer pattern (optional middleware + client layout gate) is a practical compromise. The "skip middleware, client-only gate" alternative is simpler and recommended.

**Research date:** 2026-02-11
**Valid until:** 2026-03-13 (30 days - stable domain, no fast-moving changes expected)
