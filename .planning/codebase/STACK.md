# Technology Stack

**Analysis Date:** 2026-02-10

## Languages

**Primary:**

- TypeScript 5.7.3 - All applications and packages (type-safe)
- Solidity 0.8.24 - Smart contracts on EVM (Avalanche C-Chain)

**Secondary:**

- JavaScript - Configuration files, Next.js config

## Runtime

**Environment:**

- Node.js 22.x (inferred from `@types/node` version)
- Bun 1.2+ - Worker runtime (TypeScript execution, bundling)
- Browser (modern - ES2022 compatible)

**Package Manager:**

- pnpm 10.4.1 - Monorepo package management
- Lockfile: pnpm-lock.yaml (not inspected)

## Frameworks

**Core:**

- Next.js 15.1.6 - Frontend (React SSR, API routes, deployment to Vercel)
- React 19.0.0 - UI components
- Bun - Worker runtime (event listener, no framework wrapper)

**Web3/Blockchain:**

- wagmi 2.14.11 - React hooks for Ethereum/EVM chains
- viem 2.23.2 - Lightweight Ethereum/EVM client (used in both web app and worker)
- Foundry (forge, anvil) - Solidity compilation, testing, local chain simulation

**Database:**

- Prisma 7.3.0 - ORM and migration tool
- PostgreSQL (Neon) - Primary database provider

**Testing:**

- Foundry (forge test) - Solidity contract testing

**Build/Dev:**

- Turborepo 2.4.4 - Monorepo build orchestration
- Tailwind CSS 4.0.6 - Styling
- PostCSS 4.0.6 - CSS processing
- tsx 4.19.2 - TypeScript executor for Node.js scripts

**UI Components:**

- shadcn/ui 3.8.4 - Headless component library
- Radix UI 1.4.3 - Unstyled accessible component primitives
- Lucide React 0.563.0 - Icon library
- Recharts 2.15.4 - Chart/visualization library

## Key Dependencies

**Critical:**

- `@prisma/adapter-pg` 7.3.0 - PostgreSQL adapter for Prisma (required for Neon)
- `pg` 8.13.1 - Native PostgreSQL client
- `wagmi` 2.14.11 - React bindings for Web3 wallet interaction (handles MetaMask, WalletConnect, etc.)
- `viem` 2.23.2 - Replacement for Web3.js/ethers.js, used directly in worker for blockchain reads

**Form Handling:**

- `react-hook-form` 7.71.1 - Lightweight form state management
- `@hookform/resolvers` 5.2.2 - Schema validation bridge (works with Zod)
- `zod` 4.3.6 - TypeScript-first schema validation

**State Management:**

- `@tanstack/react-query` 5.66.0 - Server state synchronization and caching

**Utilities:**

- `date-fns` 4.1.0 - Date manipulation
- `clsx` 2.1.1 - Conditional className utility
- `class-variance-authority` 0.7.1 - Component variant management
- `tailwind-merge` 3.4.0 - Merge Tailwind classes without conflicts

**UI/UX:**

- `sonner` 2.0.7 - Toast notifications
- `next-themes` 0.4.6 - Theme switching (light/dark)
- `vaul` 1.1.2 - Drawer/sidebar component
- `cmdk` 1.1.1 - Command palette/search
- `embla-carousel-react` 8.6.0 - Carousel/slider
- `input-otp` 1.4.2 - OTP input field
- `react-resizable-panels` 4 - Resizable UI panels
- `react-day-picker` 9.13.1 - Calendar component

**Development:**

- `prettier` 3.5.3 - Code formatter
- `eslint` 9.19.0 - Linter (Next.js ESLint config)
- `dotenv` 16.4.7 - Environment variable loading
- `typescript` 5.7.3 - TypeScript compiler

## Configuration

**Environment Variables:**
Required at root (`.env`):

- `DATABASE_URL` - PostgreSQL connection string (Neon format: `postgresql://user:password@host:5432/ammo_exchange`)
- `AVALANCHE_RPC_URL` - Avalanche C-Chain mainnet RPC endpoint (default: `https://api.avax.network/ext/bc/C/rpc`)
- `FUJI_RPC_URL` - Avalanche Fuji testnet RPC endpoint (default: `https://api.avax-test.network/ext/bc/C/rpc`)

**Build Configuration:**

- TypeScript: `tsconfig.json` with `strict: true`, `verbatimModuleSyntax: true`, `ES2022` target
- Tailwind CSS: v4 with PostCSS integration
- Prettier: `prettier` 3.5.3 (formatting enforced via root workspace script)
- ESLint: Next.js recommended config

**Foundry Configuration:**

- Location: `packages/contracts/foundry.toml`
- Solidity compiler: 0.8.24
- Optimizer: enabled (200 runs)
- RPC endpoints: Avalanche (mainnet) and Fuji (testnet) sourced from env vars

## Platform Requirements

**Development:**

- Node.js 22.x (inferred)
- Bun 1.2+ (for worker development)
- PostgreSQL-compatible database (Neon or local)
- Foundry (forge) for contract development
- Git

**Production:**

- **Frontend:** Vercel (Next.js 15 optimized, serverless deployment)
- **Worker:** Railway (Bun runtime environment)
- **Database:** Neon PostgreSQL (serverless)
- **Blockchain:** Avalanche C-Chain (public RPC or private endpoint)

## Build Dependency Graph

Turborepo orchestrates builds via `dependsOn`:

```
contracts:build → export-abis.ts → creates `packages/contracts/src/abis/`
  ↓
web, worker (import generated ABIs and types)
  ↓
web uses `transpilePackages: [db, shared, contracts]` in Next.js config
worker uses `transpilePackages` (implicit)
```

All builds depend on `db:generate` (Prisma client generation to `packages/db/generated/prisma/`)

---

_Stack analysis: 2026-02-10_
