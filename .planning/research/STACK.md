# Stack Research: Fuji Testnet Integration

**Research Date:** 2026-02-10
**Scope:** Wiring a DeFi protocol frontend to deployed contracts, building an event indexer, and serving data via API routes in a Next.js monorepo on Avalanche Fuji testnet.
**Context:** Ammo Exchange -- tokenized ammunition DeFi protocol. Existing codebase has mocked UI, skeleton worker, unused DB schema. Goal: wire everything together for Fuji testnet.

---

## 1. Current State (What We Have)

| Layer | Package | Version (package.json) | Resolved (lock) | Status |
|-------|---------|----------------------|------------------|--------|
| Frontend | Next.js | ^15.1.6 | ~15.x | Mocked UI, no contract calls |
| React hooks | wagmi | ^2.14.11 | ~2.19.5 | Config exists, no wallet UI |
| Chain client | viem | ^2.23.2 | ~2.x | Used in worker skeleton |
| Query cache | @tanstack/react-query | ^5.66.0 | ~5.90.x | Provider wired, unused |
| ORM | Prisma | ^7.3.0 | 7.3.x | Schema defined, no migrations run |
| DB adapter | @prisma/adapter-pg | ^7.3.0 | 7.3.x | Using `pg` driver, not Neon serverless |
| Build | Turborepo | ^2.4.4 | ~2.4.x | Fully configured |
| Contracts | Foundry | nightly | nightly | Contracts written, ABIs exported |
| Worker | Bun | 1.2+ | system | Skeleton only |
| Shared | @ammo-exchange/shared | workspace | workspace | Config + constants defined |

**Key observation:** The project already uses wagmi ^2 with the `^` range, and pnpm has resolved to 2.19.5. The wagmi v3 migration guide exists but the ecosystem (RainbowKit, ConnectKit) has inconsistent v3 support. Staying on wagmi 2.x is the right call for this milestone.

---

## 2. Stack Decisions

### 2.1 Contract Deployment -- Foundry `forge script`

**Decision:** Use Foundry `forge script` for Fuji deployment
**Confidence:** HIGH

| Attribute | Value |
|-----------|-------|
| Tool | Foundry (forge) -- latest nightly via `foundryup` |
| Solidity | 0.8.24 (already configured) |
| EVM version | Must set `evm_version = "cancun"` in foundry.toml. Solidity 0.8.30+ defaults to Pectra opcodes not supported on Avalanche. Since we pin 0.8.24, this is safe but worth adding defensively. |
| Fuji RPC | `https://api.avax-test.network/ext/bc/C/rpc` (chain ID 43113) |
| Deploy command | `forge script script/DeployAll.s.sol --chain-id 43113 --rpc-url $FUJI_RPC_URL --broadcast --slow -vvvv` |
| Verification | `--verify --verifier-url "https://api.avascan.info/v2/network/testnet/evm/43113/etherscan"` |

**Rationale:** Foundry is already configured with `fuji` RPC endpoint in `foundry.toml`. No new tooling needed. The `--slow` flag is critical for Avalanche because it waits for each transaction confirmation before sending the next one (Avalanche has faster finality but scripts can race ahead).

**What NOT to use:**
- Hardhat: Would require an entirely separate toolchain. Foundry is already set up and battle-tested in this codebase.
- Ignition (Hardhat deploy): Same reason. Foundry scripts are simpler and the team already knows them.

**New files needed:**
- `packages/contracts/script/DeployAll.s.sol` -- deployment script
- `packages/contracts/script/DeployFuji.sh` -- convenience shell wrapper

---

### 2.2 Wallet Connection -- wagmi 2.x + RainbowKit 2.x (or bare wagmi)

**Decision:** Stay on wagmi 2.x; add a wallet connection UI
**Confidence:** HIGH (wagmi 2.x), MEDIUM (wallet UI library choice)

| Package | Version | Why |
|---------|---------|-----|
| wagmi | ^2.14.11 (keep) | Already installed. v3 (3.4.2) exists but RainbowKit and ConnectKit have inconsistent v3 support. Migrating now adds risk with zero benefit for a testnet milestone. |
| viem | ^2.23.2 (keep) | Peer dependency of wagmi 2.x. Latest is 2.45.1 but `^2.23.2` range will resolve correctly. No reason to pin higher. |
| @tanstack/react-query | ^5.66.0 (keep) | Latest is 5.90.20. Caret range handles it. |

**Wallet UI options (pick one):**

| Option | Latest Version | wagmi 2.x Support | Pros | Cons |
|--------|---------------|-------------------|------|------|
| **RainbowKit** | 2.x | YES (stable) | Polished UI, active maintenance, great docs | Heavier bundle, opinionated styling |
| **ConnectKit** | 3.x | YES (wagmi 2.x) | Lighter, cleaner API | Less frequent updates, smaller community |
| **Bare wagmi** | N/A | N/A | Zero extra deps, full control | Must build modal UI from scratch |

**Recommendation:** For a testnet milestone, use **bare wagmi** (no wallet UI library). The codebase already has a custom `Providers` component and the UI is fully mocked with shadcn/ui. Adding RainbowKit introduces another dependency and styling conflict with the existing Tailwind/Radix design system. A simple "Connect Wallet" button using `useConnect()` + `useDisconnect()` + `useAccount()` from wagmi is sufficient for testnet. Add RainbowKit later if needed for mainnet polish.

**wagmi connectors to install:**

```
pnpm --filter @ammo-exchange/web add @wagmi/connectors
```

For Fuji testnet, configure:
- `injected()` -- MetaMask and browser wallets
- `walletConnect({ projectId })` -- optional, useful for mobile testing

**What NOT to use:**
- wagmi v3 (3.4.2): Hook renames (`useAccount` -> `useConnection`) would touch every component. Ecosystem support is inconsistent. Migrate AFTER mainnet, not during testnet wiring.
- AppKit (Web3Modal): Overkill for a testnet. Adds WalletConnect dependency and their cloud infra.
- ethers.js: The codebase is standardized on viem. Do not introduce ethers.

---

### 2.3 Event Indexing -- viem `watchContractEvent` in Bun Worker

**Decision:** Custom indexer using viem in the existing Bun worker
**Confidence:** HIGH

| Attribute | Value |
|-----------|-------|
| Runtime | Bun 1.3.9 (latest stable) |
| Client | viem `createPublicClient` with `webSocket` or `http` transport |
| Pattern | `publicClient.watchContractEvent()` for real-time + `getContractEvents()` for historical backfill |
| Persistence | Write events to Prisma/Neon via `@ammo-exchange/db` |

**Architecture:**

```
Avalanche Fuji RPC (WebSocket or HTTP polling)
        |
  viem watchContractEvent()
        |
  Bun Worker (apps/worker)
        |
  Prisma -> Neon PostgreSQL
```

**Why NOT Ponder:**
- Ponder is a full indexing framework with its own server, GraphQL API, and database. This project already has Next.js API routes + Prisma + Neon. Ponder would duplicate the data layer and add operational complexity.
- For 4 contracts with ~10 events total, a custom viem watcher is simpler, faster to build, and uses the existing DB schema.
- Ponder makes sense for protocols with 50+ contracts or when you need a public GraphQL API. This is a closed system with an admin dashboard.

**Why NOT The Graph / Subgraph:**
- Fuji testnet subgraph hosting is unreliable. Self-hosting a Graph node is operational overhead that does not serve a testnet milestone.
- The data requirements (orders, inventory, audit logs) map directly to the existing Prisma schema. No need for a separate indexing layer.

**Implementation pattern:**

```typescript
// apps/worker/src/index.ts
const publicClient = createPublicClient({
  chain: avalancheFuji,
  transport: webSocket(process.env.FUJI_WS_URL),
  // fallback: http(process.env.FUJI_RPC_URL)
});

// Watch each contract's events
const unwatchMint = publicClient.watchContractEvent({
  address: CONTRACT_ADDRESSES.fuji.caliberMarket,
  abi: CaliberMarketAbi,
  eventName: 'MintStarted',
  onLogs: async (logs) => {
    for (const log of logs) {
      await prisma.order.create({ ... });
    }
  },
});
```

**Resilience considerations:**
- `watchContractEvent` uses polling (eth_getFilterChanges) by default over HTTP. WebSocket is preferred for lower latency but less reliable on public endpoints.
- Must store last processed block number in DB for crash recovery (backfill from that block on restart using `getContractEvents`).
- Avalanche Fuji public RPC rate limits are generous but should still implement exponential backoff.

**New env vars needed:**
- `FUJI_WS_URL` (optional) -- WebSocket endpoint for real-time events

---

### 2.4 Admin Dashboard -- Next.js 15 App Router

**Decision:** Keep Next.js 15.x, use App Router with Server Components + Route Handlers
**Confidence:** HIGH

| Attribute | Value |
|-----------|-------|
| Framework | Next.js ^15.1.6 (keep current) |
| React | ^19.0.0 (keep current) |
| Rendering | Server Components for data display, Client Components for wallet interaction |
| Data fetching | Server Components call Prisma directly; Client Components use TanStack Query + API routes |

**Why NOT upgrade to Next.js 16:**
- Next.js 16.1 is available (released Dec 2025) and brings Turbopack stable for both dev and build. However, upgrading Next.js major versions during a wiring milestone introduces risk: potential breaking changes in middleware, route handlers, and React 19 integration.
- The `^15.1.6` range resolves to 15.5.12 (latest 15.x patch) which is fully stable and has all the features needed.
- Upgrade to 16 in a separate milestone after testnet is working.

**Dashboard architecture:**
- `/admin/orders` -- Server Component, fetches from Prisma directly
- `/admin/inventory` -- Server Component, fetches from Prisma directly
- `/admin/contracts` -- Client Component, reads on-chain state via wagmi hooks
- API routes serve the frontend for mutations and real-time data

---

### 2.5 API Routes -- Next.js Route Handlers + Prisma

**Decision:** Next.js App Router Route Handlers (`app/api/.../route.ts`)
**Confidence:** HIGH

| Attribute | Value |
|-----------|-------|
| Location | `apps/web/app/api/` |
| Validation | Zod ^4.3.6 (already installed) |
| Auth | Wallet signature verification (viem `verifyMessage`) |
| DB | Prisma client from `@ammo-exchange/db` |

**Route structure:**

```
app/api/
  orders/
    route.ts          -- GET (list), POST (create)
    [id]/route.ts     -- GET (detail), PATCH (update status)
  inventory/
    route.ts          -- GET (list)
    [caliber]/route.ts -- GET (detail)
  users/
    route.ts          -- POST (register/upsert on wallet connect)
    [address]/route.ts -- GET (profile + KYC status)
  health/
    route.ts          -- GET (system health check)
```

**Prisma singleton pattern (already implemented):**
The existing `packages/db/src/client.ts` uses the global singleton pattern with `globalThis` caching, which prevents connection exhaustion in Next.js serverless functions. This is correct for the current `@prisma/adapter-pg` setup.

**Database adapter decision -- keep `@prisma/adapter-pg`:**
- The project currently uses `@prisma/adapter-pg` (node `pg` driver), not `@prisma/adapter-neon` (Neon serverless driver).
- For Vercel serverless, `@prisma/adapter-neon` with `@neondatabase/serverless` provides WebSocket connections and lower cold-start latency. However, switching adapters is a small change that can be done later.
- For testnet, the current `pg` adapter works fine with Neon's pooled connection string. Keep it.
- **Future optimization:** Switch to `@prisma/adapter-neon` + `@neondatabase/serverless` before mainnet to get WebSocket connections and message pipelining.

**What NOT to use:**
- tRPC: Adds complexity without benefit for this project size. Plain route handlers + Zod validation are sufficient.
- GraphQL: The data model is simple CRUD. REST is the right choice.
- Prisma Accelerate: Paid service for connection pooling. Neon's built-in pooler (free) handles this.

---

### 2.6 Shared Package -- Chain Config + Contract Addresses

**Decision:** Extend `@ammo-exchange/shared` with deployed Fuji addresses
**Confidence:** HIGH

The `packages/shared/src/config/index.ts` already defines `AVALANCHE_FUJI` chain config and placeholder `CONTRACT_ADDRESSES.fuji`. After deployment, update these zero addresses with actual deployed addresses. The worker and web app both import from this package, so a single update propagates everywhere.

**Pattern for post-deployment address updates:**
1. Deploy contracts via `forge script`
2. Parse deployment artifacts from `packages/contracts/broadcast/`
3. Update `CONTRACT_ADDRESSES.fuji` in shared package
4. Run `pnpm check` to verify types propagate

**Missing from shared package:**
- `CONTRACT_ADDRESSES.fuji` is missing `caliberMarket`, `ammoFactory`, and `ammoManager` addresses. Only individual token addresses are listed. Must add:
  - `caliberMarket`
  - `ammoFactory`
  - `ammoManager`

---

## 3. Version Matrix (Prescriptive)

### Keep (No Changes)

| Package | Current | Latest Available | Action | Rationale |
|---------|---------|-----------------|--------|-----------|
| wagmi | ^2.14.11 | 3.4.2 | **KEEP 2.x** | Ecosystem (RainbowKit, ConnectKit) has inconsistent v3 support. Hook renames would touch every component. Migrate after mainnet. |
| viem | ^2.23.2 | 2.45.1 | **KEEP ^2.23.2** | Caret range resolves to latest 2.x. No breaking changes. |
| next | ^15.1.6 | 16.1 | **KEEP 15.x** | Major version upgrade during wiring milestone is unnecessary risk. 15.5.12 is stable. |
| react | ^19.0.0 | 19.x | **KEEP** | Already on React 19. No action needed. |
| @tanstack/react-query | ^5.66.0 | 5.90.20 | **KEEP** | Caret range handles it. |
| prisma | ^7.3.0 | 7.3.x | **KEEP** | Already on latest stable line. |
| @prisma/adapter-pg | ^7.3.0 | 7.3.x | **KEEP for now** | Works with Neon pooled connections. Switch to adapter-neon before mainnet. |
| typescript | ^5.7.3 | 5.7.x | **KEEP** | wagmi v3 requires 5.7.3 minimum, which we already meet. |
| turbo | ^2.4.4 | 2.8.3 | **KEEP ^2.4.4** | No breaking changes. Caret range is fine. Update if specific features needed. |
| zod | ^4.3.6 | 4.x | **KEEP** | Already on Zod 4. |

### Add (New Dependencies)

| Package | Version | Where | Why |
|---------|---------|-------|-----|
| `@wagmi/connectors` | ^6.0.1 | apps/web | Required for wagmi 2.x connector setup (injected, walletConnect). Was previously bundled, now separate. |

**That is it.** No other new dependencies are needed for this milestone. The existing stack covers every requirement.

### Do NOT Add

| Package | Why Not |
|---------|---------|
| RainbowKit | Bare wagmi is sufficient for testnet. Adds styling conflicts with existing shadcn/ui. |
| ConnectKit | Same reasoning as RainbowKit. |
| Ponder | Overkill for 4 contracts. Custom viem watcher is simpler. |
| The Graph | Fuji testnet hosting unreliable. Existing Prisma schema is the index. |
| ethers.js | Codebase is standardized on viem. Do not introduce competing libraries. |
| tRPC | Project size does not justify the abstraction layer. |
| Next.js 16 | Major version bump during wiring milestone is risk without reward. |
| wagmi v3 | Ecosystem not ready. Hook renames touch every component. |
| @prisma/adapter-neon | Optimization for mainnet, not required for testnet. |

---

## 4. Architecture Patterns

### 4.1 Frontend Contract Interaction Pattern

```
User action (button click)
  -> wagmi hook (useWriteContract / useReadContract)
    -> viem encodes ABI call
      -> Wallet signs transaction (MetaMask popup)
        -> Broadcast to Fuji RPC
          -> Transaction confirmed
            -> wagmi hook returns receipt
              -> TanStack Query invalidates relevant queries
                -> UI updates
```

**Key wagmi hooks for this project:**

| Hook | Use Case |
|------|----------|
| `useAccount()` | Get connected wallet address, chain ID |
| `useConnect()` | Trigger wallet connection |
| `useDisconnect()` | Disconnect wallet |
| `useReadContract()` | Read on-chain state (balances, prices, inventory) |
| `useWriteContract()` | Send transactions (mint, redeem, list, buy) |
| `useWaitForTransactionReceipt()` | Wait for tx confirmation after write |
| `useSwitchChain()` | Switch to Fuji if user is on wrong network |
| `useBalance()` | Get AVAX balance |

### 4.2 Worker Event Processing Pattern

```
Startup:
  1. Read last_processed_block from DB
  2. Backfill: getContractEvents(fromBlock: last_processed_block)
  3. Process backfill events
  4. Start: watchContractEvent (polling or WebSocket)

Runtime:
  1. Receive event log batch
  2. For each log:
     a. Parse event args (viem decodes automatically)
     b. Idempotency check (txHash + logIndex unique constraint)
     c. Write to Prisma (order creation, inventory update, audit log)
     d. Update last_processed_block
  3. On error: log, retry with backoff, do not crash

Shutdown:
  1. Call unwatch() for all watchers
  2. Flush pending DB writes
  3. Exit cleanly
```

### 4.3 API Route Pattern

```typescript
// app/api/orders/route.ts
import { prisma } from "@ammo-exchange/db";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const querySchema = z.object({
  status: z.enum(["PENDING", "PROCESSING", "COMPLETED", "FAILED"]).optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
  offset: z.coerce.number().min(0).default(0),
});

export async function GET(request: NextRequest) {
  const params = querySchema.parse(
    Object.fromEntries(request.nextUrl.searchParams)
  );
  const orders = await prisma.order.findMany({
    where: params.status ? { status: params.status } : undefined,
    take: params.limit,
    skip: params.offset,
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(orders);
}
```

---

## 5. Environment Variables (Complete for Fuji)

```bash
# Database (Neon PostgreSQL)
DATABASE_URL="postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech:5432/ammo_exchange?sslmode=require"

# Avalanche RPCs
AVALANCHE_RPC_URL="https://api.avax.network/ext/bc/C/rpc"
FUJI_RPC_URL="https://api.avax-test.network/ext/bc/C/rpc"
FUJI_WS_URL="wss://api.avax-test.network/ext/bc/C/ws"  # Optional: for WebSocket indexing

# Deployment (Foundry)
DEPLOYER_PRIVATE_KEY="0x..."  # Fuji testnet deployer wallet (DO NOT commit)

# WalletConnect (optional, for mobile wallet testing)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID="..."  # From cloud.walletconnect.com
```

---

## 6. Build & Deploy Pipeline

```
1. pnpm contracts:build          # Compile Solidity + export ABIs
2. forge script DeployAll.s.sol   # Deploy to Fuji
3. Update CONTRACT_ADDRESSES.fuji # In @ammo-exchange/shared
4. pnpm db:migrate                # Run Prisma migrations on Neon
5. pnpm build                     # Build all (Turbo handles dependency graph)
6. Deploy web to Vercel           # git push triggers Vercel
7. Deploy worker to Railway       # git push triggers Railway (Bun runtime)
```

---

## 7. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Fuji public RPC rate limits | MEDIUM | Worker misses events | Store last_processed_block, backfill on restart. Consider Alchemy/QuickNode free tier for testnet. |
| wagmi ^2.14.11 resolves to broken patch | LOW | Frontend breaks | Pin exact version in pnpm overrides if needed. |
| Prisma cold starts on Vercel | MEDIUM | Slow first API call | Global singleton pattern (already implemented). Switch to adapter-neon for mainnet. |
| Neon compute auto-suspend (5 min idle) | MEDIUM | 500ms-2s latency spike after idle | Acceptable for testnet. For mainnet, keep compute always-on or use Prisma Accelerate. |
| Contract deployment fails on Fuji | LOW | Blocks all integration | Test with `anvil --fork-url $FUJI_RPC_URL` first. Use `--slow` flag for deployment. |

---

## 8. Confidence Summary

| Decision | Confidence | Notes |
|----------|-----------|-------|
| Foundry for deployment | HIGH | Already configured, Avalanche docs recommend it |
| Stay on wagmi 2.x | HIGH | Ecosystem not ready for v3, zero benefit for testnet |
| Stay on Next.js 15.x | HIGH | Stable, no features in 16 that we need |
| Custom viem indexer (not Ponder) | HIGH | 4 contracts, simple events, existing DB schema |
| Bare wagmi (no RainbowKit) | MEDIUM | Could change if stakeholders want polished wallet UI |
| Keep @prisma/adapter-pg | MEDIUM | Works for testnet; switch to adapter-neon for mainnet |
| Route Handlers (not tRPC) | HIGH | Right tool for project size |

---

*Research completed: 2026-02-10. Feed this into roadmap creation.*
