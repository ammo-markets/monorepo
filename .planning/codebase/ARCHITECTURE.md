# Architecture

**Analysis Date:** 2026-02-10

## Pattern Overview

**Overall:** Modular monorepo with tiered separation between smart contracts, shared types, database layer, and frontend/worker applications.

**Key Characteristics:**

- Turbo-based monorepo with explicit build dependency graph
- Multi-chain blockchain integration (Avalanche mainnet + Fuji testnet)
- 2-step order settlement pattern in smart contracts (initiate → finalize)
- API surface through webapp and event-driven worker
- Type-safe shared contracts and configuration across all packages

## Layers

**Smart Contracts (Solidity):**

- Purpose: Implement tokenized ammunition trading protocol on Avalanche
- Location: `packages/contracts/src/`
- Contains: Core contracts (AmmoToken, CaliberMarket, AmmoFactory, AmmoManager), interfaces, and test files
- Depends on: OpenZeppelin patterns, IPriceOracle interface
- Used by: Web app (via ABI exports), worker (via event watching)

**Shared Types & Config:**

- Purpose: Single source of truth for types, constants, and chain configuration
- Location: `packages/shared/src/`
- Contains: TypeScript types, Caliber specs, fee constants, contract addresses, Avalanche chain config
- Depends on: viem/wagmi chain definitions
- Used by: Web app, worker, contract ABIs

**Database Layer:**

- Purpose: Persistent state management and order tracking via Prisma ORM
- Location: `packages/db/`
- Contains: Prisma schema, generated client, connection pooling adapter
- Depends on: PostgreSQL (Neon), Prisma adapter-pg
- Used by: Worker (event listener writes), potential API routes

**Frontend (Next.js):**

- Purpose: User interface for minting, trading, redeeming, and portfolio management
- Location: `apps/web/`
- Contains: App router pages, feature components, hooks, mock data, wagmi/viem integration
- Depends on: Shared (types, config), contracts (ABIs via generated exports), React Query
- Used by: Users accessing protocol

**Worker (Bun/TypeScript):**

- Purpose: Event listener for contract events, background processing, order finalization
- Location: `apps/worker/src/`
- Contains: Main event listening loop with viem public client
- Depends on: Shared (config, types), database (prisma), viem for chain interaction
- Used by: Deployed on Railway, processes mint/redeem events

## Data Flow

**Mint Flow (Initiate → Finalize):**

1. User connects wallet → browser reads from Avalanche via wagmi
2. User enters amount and caliber in web app (`apps/web/features/mint/`)
3. Frontend calls CaliberMarket.startMint() → emits MintStarted event
4. Event listener (worker) catches MintStarted event
5. Worker calls CaliberMarket.finalizeMint() with actual USDC price from oracle
6. CaliberMarket mints AmmoToken to user, records order in database
7. Worker persists order state to PostgreSQL via Prisma

**Redeem Flow:**

1. User initiates RedeemRequested → CaliberMarket.requestRedeem()
2. Worker watches for RedeemRequested event
3. Worker finalizes with CaliberMarket.finalizeRedeem() (keeper signature)
4. CaliberMarket burns tokens, moves USDC to treasury/fee recipient
5. Shipping address and redemption tracked in database

**State Management:**

- On-chain: Order status (MintStatus, RedeemStatus) stored in CaliberMarket structs
- Off-chain: User, Order, ShippingAddress models in PostgreSQL
- Frontend: React Query caches and refreshes market data
- Wallet state: Managed locally in mint/redeem flow components via useState

## Key Abstractions

**CaliberMarket Contract:**

- Purpose: Per-caliber mint/redeem market with keeper-finalized settlement
- Examples: `packages/contracts/src/CaliberMarket.sol`, `packages/contracts/src/interfaces/ICaliberMarket.sol`
- Pattern: State machine (MintOrder.MintStatus: None → Started → Finalized/Refunded)

**AmmoToken:**

- Purpose: ERC20-like token representing tokenized ammunition
- Examples: `packages/contracts/src/AmmoToken.sol`
- Pattern: Minted by CaliberMarket on successful mint, burned on redeem

**AmmoFactory:**

- Purpose: Deploys new CaliberMarket + AmmoToken pairs per caliber
- Examples: `packages/contracts/src/AmmoFactory.sol`, `packages/contracts/src/interfaces/IAmmoFactory.sol`
- Pattern: Factory pattern with owner-guarded creation

**AmmoManager:**

- Purpose: Global operations registry, role management, treasury configuration
- Examples: `packages/contracts/src/AmmoManager.sol`, `packages/contracts/src/interfaces/IAmmoManager.sol`
- Pattern: Central registry referenced by all CaliberMarket instances for access control

**Caliber:**

- Purpose: Type union representing ammunition types
- Examples: `packages/shared/src/types/index.ts` (Caliber = "9MM" | "556" | "22LR" | "308")
- Pattern: Used in both Prisma schema and TypeScript types for consistency

## Entry Points

**Web App Frontend:**

- Location: `apps/web/app/page.tsx` (home) and route handlers
- Triggers: User navigation, browser fetch requests
- Responsibilities: Render UI, manage wallet state, submit mint/redeem/trade transactions

**Worker Event Listener:**

- Location: `apps/worker/src/index.ts`
- Triggers: Scheduled execution on Railway, contract events on Avalanche
- Responsibilities: Watch chain for events, persist to database, call finalization functions

**API Routes:**

- Location: Not yet implemented (planned in `apps/web/app/api/`)
- Triggers: Frontend form submissions, queries
- Responsibilities: Authentication, database queries, order management

## Error Handling

**Strategy:** Multi-layer error propagation

**Patterns:**

- **Contracts:** Custom error enums (NotOwner, InvalidStatus, DeadlineExpired, etc.) with revert
- **TypeScript:** try-catch in worker, optional types in shared for config
- **Frontend:** Error states in mint/redeem flow components (WrongNetworkBanner, error display)
- **Database:** Prisma adapter handles connection failures; worker logs errors before exit

## Cross-Cutting Concerns

**Logging:** Console-based logging in worker (prefixed with `[worker]`); Next.js built-in logging in web

**Validation:**

- Solidity: Require statements and custom errors in CaliberMarket
- TypeScript: Zod/react-hook-form in frontend forms (mint, redeem, shipping)
- Shared: CaliberSpec constants validate against supported calibers

**Authentication:**

- Wallet-based: wagmi + viem for signing transactions
- Access control: AmmoManager owns/manages keepers and treasury role
- No traditional API auth yet; order linking via userId (Prisma User model)

---

_Architecture analysis: 2026-02-10_
