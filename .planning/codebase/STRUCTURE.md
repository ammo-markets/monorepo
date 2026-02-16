# Codebase Structure

**Analysis Date:** 2026-02-10

## Directory Layout

```
ammo-exchange/
├── apps/                        # Deployed applications
│   ├── web/                     # Next.js 15 frontend (Vercel)
│   └── worker/                  # Bun event listener (Railway)
├── packages/                    # Shared packages (workspace dependencies)
│   ├── contracts/               # Foundry contracts + ABI exports
│   ├── db/                      # Prisma ORM + PostgreSQL schema
│   └── shared/                  # Types, config, constants (no build step)
├── .planning/                   # GSD planning documents
│   └── codebase/
├── turbo.json                   # Turborepo task orchestration
├── pnpm-workspace.yaml          # pnpm monorepo root
├── tsconfig.json                # Root TypeScript configuration
├── package.json                 # Root workspace scripts
├── CLAUDE.md                    # Project-specific instructions
├── README.md                    # Project overview
├── whitepaper.md                # Protocol design documentation
└── PRD.md                       # Product requirements
```

## Directory Purposes

**apps/web/:**

- Purpose: Next.js 15 frontend application for protocol UI
- Contains: App router pages, feature components, hooks, styling, environment config
- Key files: `app/`, `features/`, `lib/`

**apps/web/app/:**

- Purpose: Next.js app router (file-based routing)
- Contains: Page routes (page.tsx, layout.tsx), metadata definitions
- Routes: `/` (home), `/mint`, `/trade`, `/redeem`, `/market`, `/portfolio`

**apps/web/features/:**

- Purpose: Domain-organized feature components (mint, redeem, trade, market, portfolio, layout, home)
- Contains: Feature-specific components grouped by domain, barrel export files (index.ts)
- Pattern: `features/{feature}/{component}.tsx` with centralized exports

**apps/web/lib/:**

- Purpose: Utilities and configuration for frontend
- Contains: wagmi config, mock data, utility functions
- Key: `wagmi.ts` sets up chain configuration and transport

**apps/web/components/ui/:**

- Purpose: Reusable shadcn/ui UI component library
- Contains: 47 UI primitives (Button, Dialog, Form, Input, etc.)
- Pattern: Headless components with Tailwind + Radix UI

**apps/web/hooks/:**

- Purpose: Custom React hooks
- Contains: `use-mobile.ts` for responsive design detection

**apps/worker/:**

- Purpose: Bun-based event listener for contract events
- Contains: TypeScript entry point (src/index.ts)
- Pattern: Long-running process watching CaliberMarket events on Avalanche

**packages/contracts/:**

- Purpose: Foundry-managed Solidity contracts
- Contains: Contract source, interfaces, tests, scripts, deploy artifacts
- Key: `src/` has contracts and interfaces; `test/` has Foundry tests

**packages/contracts/src/:**

- Purpose: Solidity implementation of protocol
- Contains: AmmoToken.sol, CaliberMarket.sol, AmmoFactory.sol, AmmoManager.sol, IPriceOracle.sol
- Pattern: Interfaces in `interfaces/`, implementations as top-level

**packages/contracts/script/:**

- Purpose: Foundry deployment and interaction scripts
- Contains: TypeScript scripts for deploying contracts

**packages/contracts/scripts/:**

- Purpose: Additional TypeScript helper scripts (ABI export)
- Contains: `export-abis.ts` generates TypeScript ABI imports from compiled contracts

**packages/db/:**

- Purpose: Prisma ORM and database schema
- Contains: Prisma schema definition, generated client, connection configuration

**packages/db/prisma/:**

- Purpose: Prisma schema and migration files
- Contains: `schema.prisma` with User, Order, ShippingAddress, Inventory, AuditLog models

**packages/db/generated/prisma/:**

- Purpose: Generated Prisma client
- Contains: Auto-generated TypeScript client (committed, regenerated on schema changes)
- Pattern: Output by `pnpm db:generate`, imported as `@prisma/client`

**packages/shared/:**

- Purpose: Shared types and configuration across all packages
- Contains: TypeScript definitions, constant enums, chain config
- Pattern: No build step; consumers transpile raw TypeScript

**packages/shared/src/types/:**

- Purpose: Type definitions for protocol
- Contains: Caliber, OrderType, OrderStatus, KycStatus unions and interfaces

**packages/shared/src/config/:**

- Purpose: Chain and contract configuration
- Contains: Avalanche mainnet/Fuji config, CONTRACT_ADDRESSES placeholders

**packages/shared/src/constants/:**

- Purpose: Protocol constants and lookup tables
- Contains: FEES, CALIBER_SPECS, RESTRICTED_STATES, state abbreviations

## Key File Locations

**Entry Points:**

- `apps/web/app/page.tsx`: Home page entry, imports layout + feature components
- `apps/web/app/layout.tsx`: Root layout with fonts, metadata, providers
- `apps/web/app/providers.tsx`: Client-side provider setup (WagmiProvider, QueryClientProvider)
- `apps/worker/src/index.ts`: Worker main entry, creates publicClient and watches events

**Configuration:**

- `apps/web/lib/wagmi.ts`: Wagmi config with Avalanche chains and HTTP transport
- `packages/shared/src/config/index.ts`: AVALANCHE_MAINNET, AVALANCHE_FUJI, CONTRACT_ADDRESSES
- `packages/shared/src/constants/index.ts`: FEES, CALIBER_SPECS, fee basis points, min mint amounts
- `packages/db/prisma/schema.prisma`: PostgreSQL schema with User, Order, ShippingAddress, Inventory
- `turbo.json`: Task dependencies (contracts:build → export-abis → apps, db:generate dependencies)

**Core Logic:**

- `packages/contracts/src/CaliberMarket.sol`: 2-step mint/redeem settlement, per-caliber market
- `packages/contracts/src/AmmoToken.sol`: Tokenized ammunition ERC20
- `packages/contracts/src/AmmoFactory.sol`: Deploys CaliberMarket + AmmoToken pairs
- `packages/contracts/src/AmmoManager.sol`: Global registry and access control
- `apps/web/features/mint/mint-flow.tsx`: Mint UI state machine with wallet integration
- `apps/web/features/redeem/redeem-flow.tsx`: Redeem UI with shipping address collection
- `packages/db/src/client.ts`: Prisma client factory with connection pooling

**Testing:**

- `packages/contracts/test/`: Foundry test files (AmmoFactory.t.sol, CaliberMarket.t.sol, etc.)
- `apps/web/lib/mock-data.ts`: Mock market and order data for frontend demo

## Naming Conventions

**Files:**

- TypeScript components: `camelCase.tsx` (e.g., `mint-flow.tsx`, `swap-widget.tsx`)
- Solidity contracts: `PascalCase.sol` (e.g., `CaliberMarket.sol`, `AmmoToken.sol`)
- Interfaces: `IPascalCase.sol` (e.g., `IAmmoFactory.sol`, `ICaliberMarket.sol`)
- Tests: `{Contract}.t.sol` (e.g., `AmmoFactory.t.sol`)
- Barrel files: `index.ts` in feature directories for centralized exports
- Config files: `{purpose}.ts` (e.g., `wagmi.ts`, `prisma.config.ts`)

**Directories:**

- Feature modules: `{feature-name}/` (e.g., `mint/`, `redeem/`, `market/`)
- UI components: `ui/{component-name}/` (shadcn pattern, e.g., `ui/button/`, `ui/dialog/`)
- Packages: `@ammo-exchange/{package}` in npm scope (e.g., `@ammo-exchange/shared`)
- Solidity interfaces: `interfaces/` within contracts/src

**Variables & Types:**

- React state hooks: `use{Feature}State` (useState) or lowercase local variables
- Enums: `PascalCase` in both Solidity and TypeScript (e.g., `OrderType`, `KycStatus`)
- Constants: `UPPER_SNAKE_CASE` (e.g., `MINT_FEE_BPS`, `CALIBER_SPECS`)
- Type imports: `import type { Caliber }` (verbatimModuleSyntax enforced)

## Where to Add New Code

**New Feature (e.g., staking):**

- Primary code: `apps/web/features/{feature-name}/` with sub-components
- Tests: `packages/contracts/test/{Feature}.t.sol` for smart contracts
- Types: `packages/shared/src/types/index.ts` if adding new protocol types
- Database: `packages/db/prisma/schema.prisma` if adding new models

**New Component/Module:**

- Implementation: `apps/web/features/{domain}/` if domain-specific; `apps/web/components/ui/` if reusable
- Export: Add barrel export in `features/{domain}/index.ts`
- Styling: Use Tailwind classes; no inline CSS (see mint-flow.tsx for patterns)

**Utilities:**

- Shared helpers: `packages/shared/src/` (types, config, constants only)
- Frontend utilities: `apps/web/lib/utils.ts` or feature-specific utils
- Chain interaction: Existing viem client patterns in `apps/worker/src/index.ts`

**Contracts:**

- New caliber: Deploy new CaliberMarket + AmmoToken pair via AmmoFactory.createCaliber()
- New feature: Add to CaliberMarket if order-related; add to AmmoManager if role-based
- Test: Create `.t.sol` file alongside implementation using Foundry Test framework

## Special Directories

**node_modules/**

- Purpose: Dependencies for entire monorepo
- Generated: Yes (pnpm install)
- Committed: No (in .gitignore)

**packages/contracts/out/**

- Purpose: Foundry compilation output (bytecode, ABI JSON)
- Generated: Yes (pnpm contracts:build)
- Committed: No (in .gitignore)

**packages/db/generated/prisma/**

- Purpose: Generated Prisma TypeScript client
- Generated: Yes (pnpm db:generate)
- Committed: Yes (required for runtime)

**packages/contracts/lib/**

- Purpose: Foundry dependencies (forge-std library)
- Generated: No (managed by forge git submodule)
- Committed: Yes (as git submodule reference)

**.turbo/**

- Purpose: Turbo cache and daemon state
- Generated: Yes (by turbo)
- Committed: No (in .gitignore)

**.planning/**

- Purpose: GSD planning documents (architecture, structure, conventions, etc.)
- Generated: By GSD tools
- Committed: Yes

---

_Structure analysis: 2026-02-10_
