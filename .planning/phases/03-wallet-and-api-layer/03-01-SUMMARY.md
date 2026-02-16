---
phase: 03-wallet-and-api-layer
plan: 01
subsystem: ui
tags: [wagmi, wallet, metamask, erc20, multicall, react-hooks, viem]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: "Contract ABIs, shared types (Caliber), CONTRACT_ADDRESSES"
  - phase: 02-event-indexer
    provides: "Lowercase wallet address convention"
provides:
  - "useWallet hook: connect/disconnect/switchChain composing wagmi v2 hooks"
  - "useTokenBalances hook: multicall reading USDC + 4 AmmoToken balances"
  - "WalletButton component: 3-state UI (disconnected, wrong network, connected)"
  - "Navbar with real wagmi wallet state replacing useState(false) mock"
  - "truncateAddress, snowtraceUrl, snowtraceAddressUrl utility functions"
affects: [05-frontend-wiring, portfolio-dashboard]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Composed wagmi hook pattern (useWallet wraps 4 wagmi hooks)"
    - "useReadContracts multicall for batch ERC20 balance reads"
    - "isReconnecting guard to prevent SSR hydration mismatch"
    - "as any cast for dynamic useReadContracts contracts array (wagmi tuple type limitation)"

key-files:
  created:
    - apps/web/hooks/use-wallet.ts
    - apps/web/hooks/use-token-balances.ts
    - apps/web/features/layout/wallet-button.tsx
  modified:
    - apps/web/lib/utils.ts
    - apps/web/features/layout/navbar.tsx
    - apps/web/features/layout/index.ts

key-decisions:
  - "Used `as any` cast for useReadContracts contracts array -- wagmi's strict tuple type inference cannot handle dynamic .map() arrays"
  - "WalletButton renders disconnected state during isReconnecting to match SSR output and prevent hydration mismatch"
  - "USDC balance displayed inline next to address; ammo token balances read but not displayed (deferred to portfolio page)"
  - "Network badge always shows 'Avalanche Fuji' (testnet app) with dynamic dot color (green = correct, amber = wrong chain)"
  - "Identicon uses first hex character of address as placeholder letter"

patterns-established:
  - "Custom hook composition: wrap multiple wagmi hooks into one application-specific hook"
  - "Hydration-safe wallet UI: check isReconnecting before rendering connected state"
  - "formatUsdc: divide by 1e6 bigint for 6-decimal USDC display"

# Metrics
duration: 9min
completed: 2026-02-11
---

# Phase 3 Plan 1: Wallet Hooks Summary

**wagmi v2 wallet hooks with connect/disconnect/chain-switch, ERC20 multicall balances, and 3-state WalletButton replacing mock navbar state**

## Performance

- **Duration:** 9 min
- **Started:** 2026-02-11T03:10:00Z
- **Completed:** 2026-02-11T03:19:16Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments

- Replaced `useState(false)` wallet mock with real wagmi v2 hooks (useAccount, useConnect, useDisconnect, useSwitchChain)
- Created useTokenBalances hook reading USDC + 4 AmmoToken balances in single multicall RPC request
- Built WalletButton component with 3 visual states: disconnected, wrong network, connected with address + USDC balance
- Dynamic network badge in navbar (green dot when on Fuji, amber when on wrong network)
- Hydration-safe rendering using isReconnecting guard

## Task Commits

Each task was committed atomically:

1. **Task 1: Create wallet hooks and utility helpers** - `77b19cb` (feat)
   - Note: `use-token-balances.ts` was committed in `4479d70` by parallel plan agent
2. **Task 2: Create WalletButton component and rewire Navbar** - `6ecd594` (feat)

## Files Created/Modified

- `apps/web/hooks/use-wallet.ts` - Composed wagmi hook: address, isConnected, isWrongNetwork, connect, disconnect, switchToFuji
- `apps/web/hooks/use-token-balances.ts` - useReadContracts multicall for 5 balances (1 USDC + 4 AmmoTokens)
- `apps/web/lib/utils.ts` - Added truncateAddress, snowtraceUrl, snowtraceAddressUrl utilities
- `apps/web/features/layout/wallet-button.tsx` - 3-state wallet button with USDC balance display
- `apps/web/features/layout/navbar.tsx` - Replaced mock wallet state with WalletButton component + dynamic network badge
- `apps/web/features/layout/index.ts` - Added WalletButton export

## Decisions Made

- Used `as any` for useReadContracts dynamic contracts array (wagmi tuple inference limitation with .map())
- WalletButton shows disconnected state during isReconnecting to match SSR initial render
- USDC balance shown inline; ammo token balances read but deferred to portfolio page (Phase 5)
- Network badge text changed from "Avalanche Mainnet" to "Avalanche Fuji" (this is a testnet app)
- Identicon placeholder uses first hex character of address instead of fixed "A"

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Fixed pre-existing type errors in API route handlers**

- **Found during:** Task 2 (build verification)
- **Issue:** `app/api/balances/route.ts` line 47 and `app/api/market/route.ts` line 53 had possibly-undefined errors from `noUncheckedIndexedAccess` in tsconfig
- **Fix:** Used non-null assertion (`!`) since array index is guaranteed by CALIBERS.map() bounds
- **Files modified:** apps/web/app/api/balances/route.ts, apps/web/app/api/market/route.ts
- **Verification:** `pnpm check` passes
- **Committed in:** 6ecd594 (Task 2 commit)

**2. [Rule 3 - Blocking] Fixed Prisma webpack bundling in next.config.ts**

- **Found during:** Task 2 (build verification)
- **Issue:** Next.js build failed because webpack tried to bundle Prisma's wasm query compiler modules from workspace package `@ammo-exchange/db`
- **Fix:** Added `@prisma/client` to webpack externals for server builds in next.config.ts
- **Files modified:** apps/web/next.config.ts
- **Verification:** `pnpm build` succeeds (with benign MetaMask/WalletConnect warnings)
- **Committed in:** 6ecd594 (Task 2 commit)

---

**Total deviations:** 2 auto-fixed (2 blocking issues from parallel plan 03-02)
**Impact on plan:** Both auto-fixes necessary for build to pass. No scope creep.

## Issues Encountered

- wagmi's `useReadContracts` strict tuple type inference cannot handle dynamically-mapped contracts arrays -- resolved with `as any` cast (well-known wagmi limitation)
- Parallel plan 03-02 committed files concurrently, causing `use-token-balances.ts` to appear in both plans' scope -- handled cleanly since git tracked the file from the first commit

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Wallet hooks are ready for use by any component (portfolio, mint, redeem)
- useTokenBalances provides all balance data needed for portfolio dashboard
- WalletButton is exported from layout barrel for potential reuse
- Next.js build succeeds, TypeScript clean

---

_Phase: 03-wallet-and-api-layer_
_Completed: 2026-02-11_
