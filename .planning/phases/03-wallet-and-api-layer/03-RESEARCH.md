# Phase 3: Wallet and API Layer - Research

**Researched:** 2026-02-11
**Domain:** wagmi v2 wallet hooks, Next.js 15 Route Handlers, viem on-chain reads, Prisma server-side queries
**Confidence:** HIGH

## Summary

Phase 3 connects the existing static UI to real wallet state and backend data. It splits into two distinct domains: (1) client-side wallet integration using wagmi v2 hooks to replace the fake `useState(false)` wallet state in the navbar and portfolio components, and (2) server-side Next.js 15 Route Handlers that query Prisma for indexed order data and viem for on-chain balances/prices.

The existing codebase is well-prepared for this phase. wagmi 2.19.5 and viem 2.23.2 are already installed. The `WagmiProvider` and `QueryClientProvider` are already wrapped around the app in `providers.tsx`. The wagmi config in `lib/wagmi.ts` already defines both Avalanche chains with SSR enabled. The shared package exports all contract addresses and ABIs. The Prisma schema has the Order, User, and ShippingAddress models ready. No new dependencies are needed.

The wallet flow uses four wagmi hooks: `useAccount` for connection state (address, chainId, isConnected), `useConnect` with the injected connector for MetaMask, `useDisconnect` for disconnection, and `useSwitchChain` for network switching. For on-chain balances, wagmi v2 removed the `token` parameter from `useBalance`, so ERC20 balances (USDC + 4 AmmoTokens) must use `useReadContracts` with multicall -- a single hook call that batches 5 `balanceOf` reads into one RPC request via Multicall3 (deployed on Fuji at `0xcA11bde05977b3631167028862bE2a173976CA11`). The API routes use Next.js 15 Route Handlers (`app/api/*/route.ts`) with zod for input validation, Prisma for database queries, and viem `createPublicClient` for server-side on-chain reads (balances, oracle prices).

**Primary recommendation:** Use wagmi hooks for all client-side wallet state (no custom state management), and Next.js Route Handlers with server-side viem for all API routes that need database or on-chain data.

## Standard Stack

### Core

| Library               | Version | Purpose                                                  | Why Standard                                                 |
| --------------------- | ------- | -------------------------------------------------------- | ------------------------------------------------------------ |
| wagmi                 | 2.19.5  | React hooks for wallet connect/disconnect/chain/reads    | Already installed, wraps viem with React Query caching       |
| viem                  | 2.23.2  | On-chain reads in API routes (server-side public client) | Already installed, provides `erc20Abi`, typed contract reads |
| @tanstack/react-query | 5.66.0  | Caching layer for wagmi hooks and API fetches            | Already installed as wagmi peer dependency                   |
| Prisma Client         | 7.3.0   | Database queries in Route Handlers                       | Already configured with Neon adapter                         |
| zod                   | 4.3.6   | Request validation in API routes                         | Already installed in web app                                 |
| Next.js               | 15.1.6  | Route Handlers (app/api/), server-side execution         | Already installed                                            |

### Supporting

| Library                  | Version      | Purpose                                              | When to Use                                               |
| ------------------------ | ------------ | ---------------------------------------------------- | --------------------------------------------------------- |
| viem `erc20Abi`          | (bundled)    | Standard ERC20 ABI for balanceOf reads               | USDC balance queries on client and server                 |
| @ammo-exchange/contracts | workspace:\* | AmmoTokenAbi, CaliberMarketAbi                       | Token balance reads (client), oracle price reads (server) |
| @ammo-exchange/shared    | workspace:\* | CONTRACT_ADDRESSES, CALIBER_SPECS, PRISMA_TO_CALIBER | Address lookups, caliber metadata                         |
| @ammo-exchange/db        | workspace:\* | prisma singleton, Prisma types                       | All database queries in Route Handlers                    |

### Alternatives Considered

| Instead of               | Could Use                     | Tradeoff                                                                                                                                |
| ------------------------ | ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| wagmi hooks for balances | Server-side viem in API route | wagmi provides automatic caching, refetching, loading states via React Query; server-side requires manual fetch cycle                   |
| Next.js Route Handlers   | Server Actions                | Route Handlers are better for REST-like endpoints consumed by fetch(); Server Actions are for form submissions and mutations tied to UI |
| zod for validation       | Manual validation             | zod provides type-safe parsing with `.safeParse()`, auto-generates TypeScript types with `z.infer<>`                                    |

**Installation:**
No new packages needed. All dependencies are already installed.

## Architecture Patterns

### Recommended Project Structure

```
apps/web/
  lib/
    wagmi.ts                  # EXISTING - wagmi config (no changes needed)
    viem.ts                   # NEW - server-side public client for API routes
    mock-data.ts              # EXISTING - will be consumed by mock-backed UIs until Phase 5
  app/
    providers.tsx             # EXISTING - WagmiProvider + QueryClientProvider
    api/
      orders/
        route.ts              # NEW - GET /api/orders?wallet=0x...
        [id]/
          route.ts            # NEW - GET /api/orders/[id]
      balances/
        route.ts              # NEW - GET /api/balances?wallet=0x...
      market/
        route.ts              # NEW - GET /api/market
      redeem/
        shipping/
          route.ts            # NEW - POST /api/redeem/shipping
  hooks/
    use-wallet.ts             # NEW - custom hook composing wagmi hooks
    use-token-balances.ts     # NEW - useReadContracts multicall for all token balances
  features/
    layout/
      navbar.tsx              # MODIFIED - replace useState(false) with wagmi hooks
      wallet-button.tsx       # NEW - connect/disconnect/chain-switch UI component
    portfolio/
      portfolio-dashboard.tsx # MODIFIED - replace mock wallet state with wagmi hooks
```

### Pattern 1: Wallet Connection with wagmi Hooks

**What:** Replace the existing `useState(false)` wallet state with wagmi's `useAccount`, `useConnect`, `useDisconnect`, and `useSwitchChain` hooks. All wallet state lives in wagmi's React Query cache -- no custom state management needed.

**When to use:** Any component that needs to know if a wallet is connected, what address it has, or what chain it is on.

**Example:**

```typescript
// Source: wagmi docs (https://wagmi.sh/react/guides/connect-wallet)
"use client";

import { useAccount, useConnect, useDisconnect, useSwitchChain } from "wagmi";
import { injected } from "wagmi/connectors";
import { avalancheFuji } from "wagmi/chains";

export function WalletButton() {
  const { address, isConnected, chainId } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();

  // Wrong network detection
  const isWrongNetwork = isConnected && chainId !== avalancheFuji.id;

  if (!isConnected) {
    return (
      <button onClick={() => connect({ connector: injected() })}>
        Connect Wallet
      </button>
    );
  }

  if (isWrongNetwork) {
    return (
      <button onClick={() => switchChain({ chainId: avalancheFuji.id })}>
        Switch to Fuji
      </button>
    );
  }

  return (
    <button onClick={() => disconnect()}>
      {address?.slice(0, 6)}...{address?.slice(-4)}
    </button>
  );
}
```

### Pattern 2: Multicall Token Balances with useReadContracts

**What:** Read USDC balance + 4 AmmoToken balances in a single batched RPC call using wagmi's `useReadContracts` hook, which automatically uses Multicall3.

**When to use:** Any component that displays token balances for the connected user.

**Example:**

```typescript
// Source: wagmi docs (https://wagmi.sh/react/api/hooks/useReadContracts)
"use client";

import { useAccount, useReadContracts } from "wagmi";
import { erc20Abi } from "viem";
import { AmmoTokenAbi } from "@ammo-exchange/contracts";
import { CONTRACT_ADDRESSES } from "@ammo-exchange/shared";
import type { Caliber } from "@ammo-exchange/shared";

const CALIBERS: Caliber[] = ["9MM", "556", "22LR", "308"];
const fuji = CONTRACT_ADDRESSES.fuji;

export function useTokenBalances() {
  const { address, isConnected } = useAccount();

  const { data, isLoading, refetch } = useReadContracts({
    contracts: [
      // USDC balance
      {
        address: fuji.usdc,
        abi: erc20Abi,
        functionName: "balanceOf",
        args: [address!],
      },
      // 4 AmmoToken balances
      ...CALIBERS.map((caliber) => ({
        address: fuji.calibers[caliber].token,
        abi: AmmoTokenAbi,
        functionName: "balanceOf" as const,
        args: [address!],
      })),
    ],
    query: {
      enabled: isConnected && !!address,
    },
  });

  return {
    usdc: data?.[0]?.result as bigint | undefined,
    tokens: Object.fromEntries(
      CALIBERS.map((caliber, i) => [
        caliber,
        data?.[i + 1]?.result as bigint | undefined,
      ]),
    ) as Record<Caliber, bigint | undefined>,
    isLoading,
    refetch,
  };
}
```

### Pattern 3: Next.js 15 Route Handler with Prisma

**What:** Server-side API routes using Next.js Route Handlers that query the Prisma database. Route Handlers are uncached by default in Next.js 15.

**When to use:** Any endpoint that reads from the database (orders, shipping).

**Example:**

```typescript
// Source: Next.js docs (https://nextjs.org/docs/app/getting-started/route-handlers)
// apps/web/app/api/orders/route.ts

import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@ammo-exchange/db";

const querySchema = z.object({
  wallet: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
});

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const parsed = querySchema.safeParse({
    wallet: searchParams.get("wallet"),
  });

  if (!parsed.success) {
    return Response.json({ error: "Invalid wallet address" }, { status: 400 });
  }

  const orders = await prisma.order.findMany({
    where: { walletAddress: parsed.data.wallet.toLowerCase() },
    orderBy: { createdAt: "desc" },
    include: { shippingAddress: true },
  });

  return Response.json({ orders });
}
```

### Pattern 4: Server-Side viem for On-Chain Reads in API Routes

**What:** Use viem's `createPublicClient` on the server side to read on-chain data (oracle prices, balances) in Route Handlers. This avoids exposing RPC endpoints to the client and allows server-side caching.

**When to use:** API routes that need to read on-chain state (balances, prices).

**Example:**

```typescript
// Source: viem docs (https://viem.sh/docs/contract/readContract.html)
// apps/web/lib/viem.ts

import { createPublicClient, http } from "viem";
import { avalancheFuji } from "viem/chains";

export const publicClient = createPublicClient({
  chain: avalancheFuji,
  transport: http(process.env.FUJI_RPC_URL),
});
```

```typescript
// apps/web/app/api/balances/route.ts

import { NextRequest } from "next/server";
import { erc20Abi } from "viem";
import { publicClient } from "@/lib/viem";
import { AmmoTokenAbi } from "@ammo-exchange/contracts";
import { CONTRACT_ADDRESSES } from "@ammo-exchange/shared";

export async function GET(request: NextRequest) {
  const wallet = request.nextUrl.searchParams.get("wallet");
  if (!wallet?.match(/^0x[a-fA-F0-9]{40}$/)) {
    return Response.json({ error: "Invalid wallet" }, { status: 400 });
  }

  const fuji = CONTRACT_ADDRESSES.fuji;
  const address = wallet as `0x${string}`;

  // Multicall: read USDC + 4 AmmoToken balances in one RPC call
  const results = await publicClient.multicall({
    contracts: [
      {
        address: fuji.usdc,
        abi: erc20Abi,
        functionName: "balanceOf",
        args: [address],
      },
      ...Object.values(fuji.calibers).map((c) => ({
        address: c.token as `0x${string}`,
        abi: AmmoTokenAbi,
        functionName: "balanceOf" as const,
        args: [address] as const,
      })),
    ],
  });

  return Response.json({
    usdc: results[0].result?.toString() ?? "0",
    tokens: {
      "9MM": results[1].result?.toString() ?? "0",
      "556": results[2].result?.toString() ?? "0",
      "22LR": results[3].result?.toString() ?? "0",
      "308": results[4].result?.toString() ?? "0",
    },
  });
}
```

### Pattern 5: Market Data from Oracle + Database

**What:** The GET /api/market route combines on-chain oracle prices with worker-computed data from the database. The oracle `getPrice()` returns the current price per round (X18 format), and the database has computed aggregates from indexed events.

**When to use:** Market overview page that needs current prices and volume data.

**Example:**

```typescript
// apps/web/app/api/market/route.ts

import { publicClient } from "@/lib/viem";
import { CaliberMarketAbi } from "@ammo-exchange/contracts";
import { CONTRACT_ADDRESSES, CALIBER_SPECS } from "@ammo-exchange/shared";
import type { Caliber } from "@ammo-exchange/shared";

const CALIBERS: Caliber[] = ["9MM", "556", "22LR", "308"];
const fuji = CONTRACT_ADDRESSES.fuji;

// IPriceOracle ABI (minimal - just getPrice)
const priceOracleAbi = [
  {
    type: "function",
    name: "getPrice",
    inputs: [],
    outputs: [{ name: "priceX18", type: "uint256" }],
    stateMutability: "view",
  },
] as const;

export async function GET() {
  // 1. Read oracle address for each market
  const oracleAddresses = await publicClient.multicall({
    contracts: CALIBERS.map((c) => ({
      address: fuji.calibers[c].market,
      abi: CaliberMarketAbi,
      functionName: "oracle" as const,
    })),
  });

  // 2. Read price from each oracle
  const prices = await publicClient.multicall({
    contracts: oracleAddresses.map((res) => ({
      address: res.result as `0x${string}`,
      abi: priceOracleAbi,
      functionName: "getPrice" as const,
    })),
  });

  // 3. Format response
  const calibers = CALIBERS.map((caliber, i) => {
    const priceX18 = prices[i].result as bigint;
    // Convert X18 to human-readable: divide by 1e18
    const priceUsd = Number(priceX18) / 1e18;

    return {
      caliber,
      name: CALIBER_SPECS[caliber].name,
      pricePerRound: priceUsd,
      priceX18: priceX18.toString(),
    };
  });

  return Response.json({ calibers });
}
```

### Anti-Patterns to Avoid

- **Custom useState for wallet state:** The existing navbar uses `const [walletConnected] = useState(false)`. Replace this entirely with `useAccount().isConnected`. Never duplicate wagmi state in local React state.
- **Reading ERC20 balances with useBalance:** In wagmi v2, `useBalance` only works for native currencies (AVAX). For USDC and AmmoToken balances, use `useReadContracts` with the token ABI.
- **Importing Prisma in client components:** Prisma is server-only. All database access must happen in Route Handlers, Server Components, or Server Actions -- never in `"use client"` components.
- **Hardcoding chain IDs:** Always import `avalancheFuji` from `wagmi/chains` or `viem/chains` and reference `.id`. Never hardcode `43113`.
- **Returning BigInt in JSON responses:** API routes that return on-chain values must convert `bigint` to `string` via `.toString()` before JSON serialization. `JSON.stringify(42n)` throws `TypeError: Do not know how to serialize a BigInt`.
- **Skipping wallet address lowercasing:** Prior decision (02-01) requires all wallet addresses stored lowercase. API routes must `.toLowerCase()` wallet parameters before querying.

## Don't Hand-Roll

| Problem                 | Don't Build                                  | Use Instead                                         | Why                                                                                 |
| ----------------------- | -------------------------------------------- | --------------------------------------------------- | ----------------------------------------------------------------------------------- |
| Wallet connection state | Custom React context + state                 | wagmi `useAccount` / `useConnect` / `useDisconnect` | wagmi manages connection lifecycle, persistence, reconnection, multi-wallet support |
| Network switching       | Manual `wallet_switchEthereumChain` RPC call | wagmi `useSwitchChain`                              | Handles provider differences, error states, pending states automatically            |
| ERC20 multicall reads   | 5 separate `useReadContract` hooks           | Single `useReadContracts` with contracts array      | Batches into one Multicall3 RPC call, one loading state, one error state            |
| Server-side multicall   | 5 separate `readContract` calls              | viem `publicClient.multicall()`                     | Single RPC call for all 5 balance reads                                             |
| Request validation      | Manual if/else checks                        | zod `.safeParse()`                                  | Type-safe, composable, returns structured errors                                    |
| API response formatting | Manual try/catch + Response construction     | Consistent pattern with early returns               | Prevents forgetting status codes or error format                                    |

**Key insight:** wagmi v2 provides every hook needed for wallet interaction. The only custom code needed is composing wagmi hooks into application-specific hooks (`useTokenBalances`) and wiring them to UI components.

## Common Pitfalls

### Pitfall 1: useBalance Does Not Support ERC20 Tokens in wagmi v2

**What goes wrong:** Developer uses `useBalance({ address, token: usdcAddress })` expecting it to return USDC balance. This was supported in wagmi v1 but the `token` parameter was removed in v2.
**Why it happens:** wagmi v2 migration guide mentions this change but it is easy to miss. Many tutorials and Stack Overflow answers reference the v1 API.
**How to avoid:** Use `useReadContracts` with `erc20Abi` (imported from `viem`) for all ERC20 token balance reads. Use `useBalance` only for native AVAX balance.
**Warning signs:** TypeScript error "Object literal may only specify known properties, and 'token' does not exist", or unexpected `undefined` balance data.

### Pitfall 2: wagmi SSR Hydration Mismatch

**What goes wrong:** The wallet shows "connected" briefly then flashes to "disconnected" on page load, or vice versa. React hydration warnings appear in the console.
**Why it happens:** wagmi's config has `ssr: true` (already set in the project), which means the initial server render shows a disconnected state. When the client hydrates and wagmi reconnects, the UI updates. If the component renders different content based on `isConnected` without handling the `isReconnecting` state, hydration mismatches occur.
**How to avoid:** Check `isReconnecting` from `useAccount()`. During reconnection, show a neutral/skeleton state that matches the server render. The wagmi config already has `ssr: true` which defers hydration of connection state.
**Warning signs:** "Text content did not match" or "Hydration failed" React errors, UI flicker on page load.

### Pitfall 3: BigInt Serialization in API Responses

**What goes wrong:** API route returns an object containing `bigint` values from Prisma or viem. `Response.json()` calls `JSON.stringify()` which throws `TypeError: Do not know how to serialize a BigInt`.
**Why it happens:** Prisma's BigInt fields and viem's uint256 return values are JavaScript `bigint`. JSON does not support bigint natively.
**How to avoid:** Convert all bigint values to strings before returning: `amount.toString()`. Create a utility function or use `JSON.stringify(data, (_, v) => typeof v === "bigint" ? v.toString() : v)` as a global serializer.
**Warning signs:** 500 Internal Server Error on API routes, "Do not know how to serialize a BigInt" in server logs.

### Pitfall 4: Missing Wallet Address Normalization

**What goes wrong:** API route receives wallet address `0xAbCd...` from query params but database stores `0xabcd...` (lowercase). Query returns no results.
**Why it happens:** EVM addresses are case-insensitive but string comparison is case-sensitive. The prior decision (02-01) mandates lowercase storage, but client-side addresses from wagmi use mixed-case (EIP-55 checksum format).
**How to avoid:** Always `.toLowerCase()` wallet addresses in API route query parameters before passing to Prisma. In the client, lowercase before sending to API.
**Warning signs:** Empty results from `/api/orders?wallet=0xAbCd...` when records exist for `0xabcd...`.

### Pitfall 5: Route Handler and Page Conflict

**What goes wrong:** Creating `app/api/orders/route.ts` alongside `app/api/orders/page.tsx` causes a Next.js build error.
**Why it happens:** Next.js does not allow a `route.ts` and `page.tsx` at the same route segment level.
**How to avoid:** API routes live under `app/api/` which has no pages. Keep the `api/` directory purely for Route Handlers.
**Warning signs:** Build error: "A conflicting public file and page file was found."

### Pitfall 6: Connector Import Path for injected()

**What goes wrong:** Developer imports `injected` from the wrong path. In wagmi v2, connectors can be imported from `wagmi/connectors` or configured in `createConfig`.
**Why it happens:** The wagmi config in `lib/wagmi.ts` does not explicitly configure connectors -- it relies on wagmi's default behavior which auto-discovers injected providers via EIP-6963. When calling `connect({ connector: injected() })`, the `injected()` function must be imported from `wagmi/connectors`.
**How to avoid:** Import connectors from `wagmi/connectors`: `import { injected } from "wagmi/connectors"`. Alternatively, use `useConnectors()` to get the list of discovered connectors and let the user pick.
**Warning signs:** TypeScript error on `injected()` call, or "No connector found" runtime error.

### Pitfall 7: QueryClient Created Outside Component (Correct Pattern Already Used)

**What goes wrong:** QueryClient instance created inside a component causes a new client on every render, losing all cache.
**Why it happens:** React re-renders recreate local variables. QueryClient should be module-level or memoized.
**How to avoid:** The existing `providers.tsx` already creates `queryClient` at module level (`const queryClient = new QueryClient()`) -- this is the correct pattern. Do not change it.
**Warning signs:** All queries refetch on every render, no caching behavior.

## Code Examples

Verified patterns from official sources:

### Wallet Connection Hook Composition

```typescript
// apps/web/hooks/use-wallet.ts
// Source: wagmi docs (https://wagmi.sh/react/guides/connect-wallet)
"use client";

import { useAccount, useConnect, useDisconnect, useSwitchChain } from "wagmi";
import { injected } from "wagmi/connectors";
import { avalancheFuji } from "wagmi/chains";

export function useWallet() {
  const account = useAccount();
  const { connect, isPending: isConnecting } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain, isPending: isSwitching } = useSwitchChain();

  const isWrongNetwork =
    account.isConnected && account.chainId !== avalancheFuji.id;

  return {
    // State
    address: account.address,
    isConnected: account.isConnected,
    isReconnecting: account.isReconnecting,
    isWrongNetwork,
    chainId: account.chainId,

    // Actions
    connect: () => connect({ connector: injected() }),
    disconnect: () => disconnect(),
    switchToFuji: () => switchChain({ chainId: avalancheFuji.id }),

    // Loading
    isConnecting,
    isSwitching,
  };
}
```

### Route Handler with Dynamic Segment

```typescript
// apps/web/app/api/orders/[id]/route.ts
// Source: Next.js docs (https://nextjs.org/docs/app/getting-started/route-handlers)

import type { NextRequest } from "next/server";
import { prisma } from "@ammo-exchange/db";
import { PRISMA_TO_CALIBER } from "@ammo-exchange/shared";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: { shippingAddress: true },
  });

  if (!order) {
    return Response.json({ error: "Order not found" }, { status: 404 });
  }

  // Convert BigInt fields to strings for JSON serialization
  return Response.json({
    order: {
      ...order,
      amount: order.amount.toString(),
      caliber: PRISMA_TO_CALIBER[order.caliber],
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
    },
  });
}
```

### POST Route Handler with Zod Validation

```typescript
// apps/web/app/api/redeem/shipping/route.ts
// Source: zod docs + Next.js Route Handlers

import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@ammo-exchange/db";
import { RESTRICTED_STATES } from "@ammo-exchange/shared";

const shippingSchema = z.object({
  orderId: z.string().min(1),
  name: z.string().min(1).max(100),
  line1: z.string().min(1).max(200),
  line2: z.string().max(200).optional(),
  city: z.string().min(1).max(100),
  state: z
    .string()
    .length(2)
    .refine(
      (s) =>
        !RESTRICTED_STATES.includes(s as (typeof RESTRICTED_STATES)[number]),
      { message: "Shipping to this state is restricted" },
    ),
  zip: z.string().regex(/^\d{5}(-\d{4})?$/),
});

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body) {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = shippingSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { orderId, ...address } = parsed.data;

  // Verify order exists and is a redeem order
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order || order.type !== "REDEEM") {
    return Response.json({ error: "Redeem order not found" }, { status: 404 });
  }

  const shipping = await prisma.shippingAddress.upsert({
    where: { orderId },
    create: { orderId, ...address },
    update: address,
  });

  return Response.json({ shipping }, { status: 201 });
}
```

### Address Truncation Utility

```typescript
// apps/web/lib/utils.ts (add to existing file)

export function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function snowtraceUrl(txHash: string): string {
  return `https://testnet.snowtrace.io/tx/${txHash}`;
}

export function snowtraceAddressUrl(address: string): string {
  return `https://testnet.snowtrace.io/address/${address}`;
}
```

### BigInt-Safe JSON Serialization Helper

```typescript
// apps/web/lib/serialize.ts

/**
 * Convert all BigInt values in an object to strings for JSON serialization.
 * Handles nested objects and arrays.
 */
export function serializeBigInts<T>(obj: T): T {
  return JSON.parse(
    JSON.stringify(obj, (_, value) =>
      typeof value === "bigint" ? value.toString() : value,
    ),
  );
}
```

## State of the Art

| Old Approach                           | Current Approach                                 | When Changed         | Impact                                                                     |
| -------------------------------------- | ------------------------------------------------ | -------------------- | -------------------------------------------------------------------------- |
| `useBalance({ token })` for ERC20      | `useReadContracts` with `erc20Abi`               | wagmi v2 (2024)      | Must use multicall pattern for token balances                              |
| `useNetwork` for chain detection       | `useAccount().chainId`                           | wagmi v2 (2024)      | `useNetwork` removed; chain info is part of account state                  |
| `useSwitchNetwork`                     | `useSwitchChain`                                 | wagmi v2 (2024)      | Renamed for clarity; API is similar                                        |
| `useAccount`                           | `useConnection`                                  | wagmi v3 (2025)      | NOT relevant -- this project uses wagmi 2.19.5, so `useAccount` is correct |
| Pages Router API routes (`pages/api/`) | App Router Route Handlers (`app/api/*/route.ts`) | Next.js 13+ (stable) | Exports named functions (GET, POST) instead of default handler             |
| GET Route Handlers cached by default   | Uncached by default                              | Next.js 15 (2024)    | No action needed -- dynamic routes with Prisma are inherently uncached     |

**Deprecated/outdated:**

- wagmi `useBalance` with `token` parameter: Removed in v2. Use `useReadContracts` instead.
- wagmi `useNetwork`: Removed in v2. Use `useAccount().chainId` and `useAccount().chain`.
- wagmi `useSwitchNetwork`: Renamed to `useSwitchChain` in v2.
- wagmi `useAccount` (in v3): Renamed to `useConnection`. NOT relevant for this project (v2.19.5).

## Open Questions

1. **Client-side vs. server-side balance reads for API-03**
   - What we know: WALLET-04 needs client-side balance display (wagmi `useReadContracts`). API-03 needs a GET endpoint returning balances.
   - What's unclear: Whether the frontend should call the API route or use wagmi hooks directly for balance display.
   - Recommendation: Use wagmi hooks on the client for real-time balance display (auto-refetch on block changes). The API-03 route exists for external consumers or server-rendered pages. Both patterns are implemented above.

2. **Market data source for API-05**
   - What we know: API-05 needs "worker-computed effective price per round for each caliber." The worker indexes events but does not currently compute prices. Oracle prices are available on-chain.
   - What's unclear: Whether "worker-computed" means a database table with computed prices, or if reading on-chain oracle prices in the API route is sufficient.
   - Recommendation: For the MVP, read on-chain oracle prices directly in the `/api/market` route (2 multicall rounds: get oracle addresses, then get prices). If the worker eventually computes volume-weighted or time-weighted prices, add a MarketData table later and blend both sources.

3. **Wallet button component: Modal vs. inline**
   - What we know: The existing navbar has an inline button. wagmi supports both inline connect (single connector) and modal-based connect (multiple connectors). Libraries like ConnectKit and RainbowKit provide pre-built modals.
   - What's unclear: Whether the user wants a simple inline "Connect Wallet" button (single injected connector) or a multi-wallet modal.
   - Recommendation: Start with an inline button using `injected()` connector (covers MetaMask and other injected wallets per WALLET-01). The wagmi config auto-discovers injected providers via EIP-6963. If multi-wallet support is needed later, add ConnectKit or RainbowKit.

4. **Next.js 15 params typing in Route Handlers**
   - What we know: In Next.js 15, dynamic route params are a `Promise` that must be awaited: `const { id } = await params`. This changed from Next.js 14 where params was synchronous.
   - What's unclear: Whether the current Next.js version (15.1.6) has settled on this API.
   - Recommendation: Use the async params pattern: `{ params }: { params: Promise<{ id: string }> }`. This is the documented pattern for Next.js 15+.

## Sources

### Primary (HIGH confidence)

- wagmi v2 `useConnect` docs: https://wagmi.sh/react/api/hooks/useConnect -- parameters, return type, connector mutation
- wagmi v2 `useDisconnect` docs: https://wagmi.sh/react/api/hooks/useDisconnect -- disconnect mutation API
- wagmi v2 `useSwitchChain` docs: https://wagmi.sh/react/api/hooks/useSwitchChain -- chain switching with chainId parameter
- wagmi v2 `useAccount` docs: https://wagmi.sh/react/api/hooks/useAccount -- address, chainId, isConnected, status properties
- wagmi v2 `useReadContracts` docs: https://wagmi.sh/react/api/hooks/useReadContracts -- multicall batching, contracts array, allowFailure
- wagmi v2 Connect Wallet guide: https://wagmi.sh/react/guides/connect-wallet -- complete connection flow example
- wagmi v2 Read from Contract guide: https://wagmi.sh/react/guides/read-from-contract -- useReadContract, useReadContracts patterns
- wagmi v1 to v2 migration: https://wagmi.sh/react/guides/migrate-from-v1-to-v2 -- `useBalance` token removal, `useNetwork` removal
- Next.js 15 Route Handlers: https://nextjs.org/docs/app/getting-started/route-handlers -- convention, HTTP methods, caching, params
- viem `erc20Abi` export: built-in from `viem` package, verified via wagmi migration guide example
- Existing codebase: `apps/web/lib/wagmi.ts` -- config with `ssr: true`, both Avalanche chains
- Existing codebase: `apps/web/app/providers.tsx` -- WagmiProvider + QueryClientProvider setup
- Existing codebase: `apps/web/features/layout/navbar.tsx` -- current wallet UI with `useState(false)`
- Existing codebase: `packages/contracts/src/abis/AmmoToken.ts` -- `balanceOf(address)` function
- Existing codebase: `packages/contracts/src/IPriceOracle.sol` -- `getPrice()` returns `uint256 priceX18`
- Installed versions: wagmi 2.19.5, viem 2.23.2 (verified via pnpm)

### Secondary (MEDIUM confidence)

- Multicall3 on Avalanche Fuji: deployed at `0xcA11bde05977b3631167028862bE2a173976CA11` -- standard address across all EVM chains, referenced in viem chain definitions
- wagmi v2 to v3 migration: https://wagmi.sh/react/guides/migrate-from-v2-to-v3 -- `useAccount` renamed to `useConnection` (NOT applicable to this project, wagmi 2.19.5)
- wagmi injected connector: https://wagmi.sh/react/api/connectors/injected -- EIP-6963 auto-discovery via `multiInjectedProviderDiscovery`
- Next.js Prisma best practices: https://www.prisma.io/docs/orm/more/help-and-troubleshooting/nextjs-help -- singleton pattern, server-only usage

### Tertiary (LOW confidence)

- None -- all findings verified with official documentation.

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH -- all libraries already installed, versions verified from package.json
- Architecture (wallet): HIGH -- wagmi v2 hook APIs verified from official docs, existing providers.tsx already set up correctly
- Architecture (API routes): HIGH -- Next.js 15 Route Handler convention verified, Prisma integration pattern standard
- Pitfalls: HIGH -- useBalance token removal confirmed in official migration guide, BigInt serialization is well-documented
- Code examples: HIGH -- constructed from verified hook APIs and existing codebase patterns

**Research date:** 2026-02-11
**Valid until:** 2026-03-11 (30 days -- wagmi v2 is stable, Next.js 15 Route Handler API is stable)
