# Coding Conventions

**Analysis Date:** 2026-02-10

## Naming Patterns

**Files:**
- TypeScript/React files use PascalCase for components: `Hero.tsx`, `HowItWorks.tsx`, `MintFlow.tsx`
- Utility and hook files use camelCase: `utils.ts`, `wagmi.ts`, `mock-data.ts`
- Test files use `.t.sol` suffix for Foundry contracts: `AmmoFactory.t.sol`, `CaliberMarket.t.sol`
- Feature directories use kebab-case: `home/`, `mint/`, `trade/`, `redeem/`, `market/`, `portfolio/`
- Mock contracts use `Mock` prefix: `MockPriceOracle.sol`, `MockERC20.sol`

**Functions:**
- React components exported as PascalCase: `export function Hero()`, `export function HowItWorks()`
- Utility functions use camelCase: `export function cn(...)`, `export function getPrice()`
- Solidity functions use camelCase: `startMint()`, `finalizeMint()`, `transferOwnership()`
- Test functions use camelCase prefixed with `test`: `testCreateCaliber()`, `testStartMintCreatesOrder()`
- Helper functions in tests use underscore prefix: `_startMint()`, `_finalizeMint()`

**Variables:**
- Constants use SCREAMING_SNAKE_CASE: `CALIBER_9MM`, `ORACLE_PRICE`, `BPS_DENOMINATOR`
- Configuration objects use camelCase: `wagmiConfig`, `queryClient`
- React state variables use camelCase: `children`, `className`
- Solidity state variables use camelCase: `owner`, `feeRecipient`, `keepers`
- Local variables use camelCase: `expectedTokens`, `netUsdc`, `orderUser`

**Types:**
- TypeScript types/interfaces use PascalCase: `Caliber`, `KycStatus`, `OrderType`, `CaliberSpec`, `OrderRequest`
- Solidity enums use PascalCase: `MintStatus`, `RedeemStatus`
- Type-only imports use `import type`: `import type { Caliber, CaliberSpec }` in `packages/shared/src/constants/index.ts`

## Code Style

**Formatting:**
- Prettier 3.5.3 handles formatting
- No `.prettierrc` customization found — uses Prettier defaults
- Run via: `pnpm format` (formats all `**/*.{ts,tsx,json,md}`)
- Check formatting with: `pnpm format:check`

**Linting:**
- ESLint configured via `eslint-config-next` in `apps/web`
- No custom `.eslintrc` at root or in packages
- Strict TypeScript mode enabled in `tsconfig.json`

**TypeScript Configuration:**
- Strict mode: `"strict": true`
- `verbatimModuleSyntax`: true — enforces explicit `import type` for types
- `noUncheckedIndexedAccess`: true — prevents unsafe index access
- Declaration maps enabled for all builds
- Source maps enabled for all builds
- Target: ES2022 with ES2022 module resolution

## Import Organization

**Order:**
1. External libraries first: `import { ... } from "viem"`, `import { QueryClient } from "@tanstack/react-query"`
2. Internal packages from workspace: `import { CONTRACT_ADDRESSES } from "@ammo-exchange/shared"`
3. Local relative imports: `import { cn } from "@/lib/utils"` (uses path aliases `@/`)
4. Type-only imports separated: `import type { Caliber } from "../types/index"`

**Path Aliases:**
- `@/` points to current app root (`apps/web` in frontend)
- Used consistently in Next.js app: `import { cn } from "@/lib/utils"`, `import { wagmiConfig } from "@/lib/wagmi"`

**Barrel Files:**
- Feature directories export via index.ts: `export { Hero } from "./hero"` in `features/home/index.ts`
- Used for clean feature-level exports
- Shared package exports organized by section: `packages/shared/src/index.ts` exports types, config, constants

## Error Handling

**Patterns:**
- Solidity uses custom errors: `error NotOwner();`, `error ZeroAddress();`, `error CaliberExists();`
- Error names are PascalCase descriptive: `NotPendingOwner`, `NotOwner`, `ZeroAddress`
- TypeScript worker uses try-catch with console: `main().catch((err) => { console.error("[worker] Fatal error:", err); process.exit(1); })`
- Tests use `vm.expectRevert()` to assert Solidity reverts: `vm.expectRevert(AmmoFactory.NotOwner.selector)`

**Guard Clauses:**
- Solidity validates early: `if (feeRecipient_ == address(0)) revert ZeroAddress();` in `AmmoManager` constructor
- Revert on zero address checks pervasive: `if (newOwner == address(0)) revert ZeroAddress();`

## Logging

**Framework:** `console` (native console.log/console.error)

**Patterns:**
- Worker uses prefixed console logs with service name: `console.log("[worker] Starting Ammo Exchange event listener...")`
- Prefix pattern: `"[service-name] Message"` for context
- Error logging uses `console.error` with prefix: `console.error("[worker] Fatal error:", err)`
- No structured logging library (Pino, Winston) detected — uses native console only

## Comments

**When to Comment:**
- JSDoc comments on Solidity contracts: `/// @notice`, `/// @dev` patterns in `AmmoManager.sol`
- Function-level documentation in contracts: `/// @notice Global ops/admin and role registry...` preceding contract definition
- Inline comments for non-obvious logic: `// fee = 100e6 * 150 / 10_000 = 1_500_000` in test calculations

**JSDoc/TSDoc:**
- Solidity uses NatSpec (Ethereum documentation standard): `/// @notice ...`, `/// @dev ...`
- TypeScript has minimal JSDoc — relies on type inference
- React components use inline comments for SVG content: `{/* USDC circle */}` within TSX

**Comment Style:**
- Solidity section headers use dashed lines: `// ── Ownership (2-step) ──────────────────────────`
- Block-level organizational comments in tests: `// ── startMint ─────────────────────────────────`

## Function Design

**Size:**
- Small utility functions preferred: `cn()` in `lib/utils.ts` is 4 lines
- React components vary by complexity: `Hero` is ~180 lines, simple cards like `MintIllustration` are ~60 lines
- Solidity functions follow single-responsibility: `transferOwnership()`, `acceptOwnership()` separate 2-step pattern

**Parameters:**
- React components use object destructuring: `function Hero() { ... }`, `export function Providers({ children }: { children: ReactNode })`
- TypeScript explicit parameter typing: `function cn(...inputs: ClassValue[])`
- Solidity functions use named parameters with underscores for constructor args: `constructor(address feeRecipient_)`
- Solidity uses multi-line struct destructuring in tests: `(address orderUser, uint256 usdcAmt, ...)`

**Return Values:**
- React functional components return JSX: `return (<section>...</section>);`
- Utility functions return single types: `return twMerge(clsx(inputs));` (returns string)
- Solidity functions specify return type: `function getPrice() external view override returns (uint256)`
- Test helper functions return order ID: `uint256 orderId = market.startMint(...)`

## Module Design

**Exports:**
- Barrel files for features: `packages/shared/src/index.ts` re-exports from `./types/index`, `./config/index`, `./constants/index`
- Workspace packages export at root and subpaths: `@ammo-exchange/contracts` exports both `.` and `./abis`
- Named exports preferred over default: `export { Hero }` not `export default Hero`

**Barrel Files:**
- Every feature directory has `index.ts`: `features/home/index.ts`, `features/mint/index.ts`, `features/trade/index.ts`
- Used for organizing feature-level exports
- Allows clean imports: `import { Hero, HowItWorks } from "@/features/home"`

---

*Convention analysis: 2026-02-10*
