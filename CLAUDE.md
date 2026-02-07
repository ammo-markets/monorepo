# Ammo Exchange

DeFi protocol for tokenized ammunition trading on Avalanche. See `whitepaper.md` for full protocol design.

## Monorepo Structure

```
apps/web          → Next.js 15 frontend (Vercel)
apps/worker       → Bun TypeScript event listener (Railway)
packages/shared   → @ammo-exchange/shared — types, chain config, constants
packages/db       → @ammo-exchange/db — Prisma + Neon PostgreSQL
packages/contracts → @ammo-exchange/contracts — Foundry + ABI exports
```

## Build Dependency Graph

```
contracts:build → export-abis → apps/web, apps/worker
db:generate → apps/web, apps/worker
shared (no build step) → apps/web, apps/worker
```

Turbo handles this via `^build` and `^db:generate` in `dependsOn`.

## Common Commands

```bash
pnpm install              # Install all dependencies
pnpm dev                  # Dev all apps (Turbo TUI)
pnpm build                # Build everything
pnpm check                # Typecheck all packages

pnpm contracts:build      # Compile Solidity + export ABIs
pnpm contracts:test       # Run Foundry tests

pnpm db:generate          # Generate Prisma client
pnpm db:migrate           # Run database migrations
pnpm db:studio            # Open Prisma Studio

pnpm format               # Format all files with Prettier
pnpm format:check         # Check formatting
```

## Per-Package Commands

After making changes to a specific package, run check and format for that package:

```bash
pnpm --filter @ammo-exchange/web check
pnpm --filter @ammo-exchange/worker check
pnpm --filter @ammo-exchange/shared check
```

## Environment Variables

Required in `.env` at the root (or per-package):

```
DATABASE_URL=postgresql://...      # Neon PostgreSQL connection string
AVALANCHE_RPC_URL=https://...      # Avalanche C-Chain RPC
FUJI_RPC_URL=https://...           # Avalanche Fuji testnet RPC
```

## Tech Stack

- **Package manager**: pnpm (workspaces) + Turborepo
- **Language**: TypeScript (strict mode) + Solidity 0.8.24
- **Frontend**: Next.js 15, React 19, Tailwind CSS v4, wagmi/viem
- **Worker**: Bun runtime, viem for chain interaction
- **Database**: PostgreSQL (Neon) via Prisma ORM
- **Smart contracts**: Foundry (forge, cast, anvil)
- **Chain**: Avalanche C-Chain (EVM)

## Coding Conventions

- Use `verbatimModuleSyntax` — always use `import type` for type-only imports
- All packages use ESM (`"type": "module"`)
- Shared package ships raw TypeScript (no build step) — consumers transpile it
- Prisma client is generated to `packages/db/generated/prisma/`
- Contract ABIs are generated to `packages/contracts/src/abis/` by `export-abis.ts`
- Use `as const` for ABI arrays (enables viem type inference)

## Solidity

- Contracts live in `packages/contracts/src/` (Foundry default layout)
- Tests in `packages/contracts/test/`
- Deploy scripts in `packages/contracts/script/`
- Solidity (`.sol`) and TypeScript (`.ts`) coexist in `src/` — Foundry only compiles `.sol`, TypeScript only compiles `.ts`
