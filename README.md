# Ammo Exchange

DeFi protocol for tokenized ammunition trading on Avalanche.

## Monorepo Structure

```
packages/contracts   → Foundry smart contracts + ABI exports
packages/shared      → Shared types, chain config, constants
packages/db          → Prisma ORM + Neon PostgreSQL
apps/web             → Next.js 15 frontend
apps/worker          → Node.js event listener service
```

## Getting Started

```bash
pnpm install          # Install all dependencies
pnpm dev              # Dev all apps
pnpm build            # Build everything
pnpm check            # Typecheck all packages
```

## Contracts

```bash
pnpm contracts:build  # Compile Solidity + export ABIs
pnpm contracts:test   # Run Foundry tests
```

## Database

```bash
pnpm db:generate      # Generate Prisma client
pnpm db:migrate       # Run migrations
pnpm db:studio        # Open Prisma Studio
```

## Tech Stack

- **Contracts**: Solidity 0.8.24, Foundry
- **Chain**: Avalanche C-Chain
- **Frontend**: Next.js 15, React 19, Tailwind CSS v4, wagmi/viem
- **Worker**: Node.js, viem
- **Database**: PostgreSQL (Neon), Prisma
- **Tooling**: pnpm workspaces, Turborepo, TypeScript (strict)
