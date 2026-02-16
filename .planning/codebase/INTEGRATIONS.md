# External Integrations

**Analysis Date:** 2026-02-10

## APIs & External Services

**Blockchain RPC:**

- Avalanche C-Chain (Mainnet)
  - SDK/Client: `viem` 2.23.2 (createPublicClient with http transport)
  - Configuration: `AVALANCHE_RPC_URL` env var
  - Usage: Apps/worker reads blockchain state, contract events
  - Location: `apps/worker/src/index.ts` (public client initialization)

- Avalanche Fuji (Testnet)
  - SDK/Client: `viem` 2.23.2
  - Configuration: `FUJI_RPC_URL` env var
  - Usage: Development/testing blockchain interaction

**Wallet Integration:**

- SDK/Client: `wagmi` 2.14.11 (React hooks) + `viem` 2.23.2 (underlying client)
- Supported chains: Avalanche mainnet (43114), Avalanche Fuji (43113)
- Configuration: `apps/web/lib/wagmi.ts` defines chain config and HTTP transports
- Usage: Frontend user wallet connection (MetaMask, WalletConnect, etc.)

## Data Storage

**Databases:**

- PostgreSQL (Neon serverless)
  - Connection: `DATABASE_URL` env var
  - Client: `pg` 8.13.1 (native driver)
  - Adapter: `@prisma/adapter-pg` 7.3.0
  - ORM: Prisma 7.3.0
  - Schema location: `packages/db/prisma/schema.prisma`
  - Migration path: `packages/db/prisma/migrations/`

**File Storage:**

- Not detected - No cloud storage integration (S3, Cloudinary, etc.)

**Caching:**

- Query caching: `@tanstack/react-query` 5.66.0 (client-side, in-memory)
- No external cache (Redis, Memcached) detected

## Authentication & Identity

**Auth Provider:**

- Wallet-based authentication (no centralized auth service detected)
- Implementation: User identified by `walletAddress` (unique) in Prisma schema
- KYC tracking: `kycStatus` enum field (NONE, PENDING, APPROVED, REJECTED)
- Location: `packages/db/prisma/schema.prisma` - User model

## Monitoring & Observability

**Error Tracking:**

- Not detected - No integration with Sentry, Rollbar, or similar

**Logs:**

- Console logging only (`console.log`, `console.error`)
- Worker logs to stdout: `apps/worker/src/index.ts` uses `console.log` for initialization and event tracking

**Metrics/Analytics:**

- Not detected

## CI/CD & Deployment

**Hosting:**

- **Frontend:** Vercel (inferred from Next.js 15 choice and `vercel.json` pattern)
- **Worker:** Railway (Bun runtime support via custom deployment)
- **Database:** Neon PostgreSQL (serverless, included in stack)

**CI Pipeline:**

- Not detected - No GitHub Actions, GitLab CI, or CircleCI config files found

## Environment Configuration

**Required env vars (from `.env.example`):**

```
DATABASE_URL=postgresql://user:password@host:5432/ammo_exchange
AVALANCHE_RPC_URL=https://api.avax.network/ext/bc/C/rpc
FUJI_RPC_URL=https://api.avax-test.network/ext/bc/C/rpc
```

**Secrets location:**

- `.env` file at root (gitignored)
- Loaded by:
  - Prisma config: `packages/db/prisma.config.ts` (uses `dotenv` to load from monorepo root)
  - Next.js: Automatic via `next dev/build`
  - Worker: Manual `dotenv` loading (not seen in `apps/worker/src/index.ts`, relies on deployment env)

## Smart Contract Integration

**Contract ABIs:**

- Location: `packages/contracts/src/abis/index.ts`
- Generation: Build script `packages/contracts/scripts/export-abis.ts` (runs post-Foundry compilation)
- Pattern: `as const` for type inference in viem

**Contracts Deployed:**

- `AmmoFactory` - Factory for creating per-caliber markets
- `CaliberMarket` - Per-caliber mint/redeem market (one per ammunition caliber)
- `AmmoToken` - ERC20-like token for each caliber (created by CaliberMarket)
- `AmmoManager` - Configuration and access control
- `IPriceOracle` - Price oracle interface (implementation TBD)

**Contract Addresses:**

- Location: `packages/shared/src/config/index.ts` - `CONTRACT_ADDRESSES` constant
- Status: Placeholder addresses (0x00...) - to be updated post-deployment
- Networks:
  - Mainnet: Avalanche C-Chain (43114)
  - Testnet: Avalanche Fuji (43113)

**Chain Configuration:**

- Location: `packages/shared/src/config/index.ts`
- Chains defined: AVALANCHE_MAINNET, AVALANCHE_FUJI
- RPC endpoints: Sourced from `AVALANCHE_RPC_URL` and `FUJI_RPC_URL` env vars in Foundry config

## Webhooks & Callbacks

**Incoming:**

- Not detected - No webhook endpoints in Next.js API routes for external services

**Outgoing:**

- Contract event watching (placeholder): `apps/worker/src/index.ts` has commented-out `watchContractEvent` for `MintStarted` events
- Purpose: Listen for mint/redeem events and sync to database via Prisma
- Status: Not yet implemented (TODO comment in code)

## Cross-Chain or Multi-Provider Patterns

**Not detected** - Single chain (Avalanche C-Chain) only

## Type Safety & Code Generation

**Prisma Client:**

- Generated to: `packages/db/generated/prisma/`
- Generated on: `pnpm db:generate` (runs `prisma generate`)
- Consumed by: Web app, worker via `import { prisma } from "@ammo-exchange/db"`

**Contract Types:**

- ABIs generated from compiled contracts: `packages/contracts/src/abis/index.ts`
- Type inference: `viem` extracts types from `as const` ABIs for compile-time safety

---

_Integration audit: 2026-02-10_
