---
phase: quick
plan: 3
subsystem: ui
tags: [wagmi, wallet, dialog, connectors, radix-ui]

provides:
  - "Wallet connector selection dialog with multi-wallet support"
  - "useWallet hook with connectors list and connectWith function"
affects: [wallet-button, auth-context, mint-flow, redeem-flow]

tech-stack:
  added: []
  patterns:
    - "Connector selection via Dialog instead of auto-connect"
    - "Deduplicated connector list from useConnectors"

key-files:
  created: []
  modified:
    - apps/web/lib/wagmi.ts
    - apps/web/hooks/use-wallet.ts
    - apps/web/features/layout/wallet-button.tsx

key-decisions:
  - "Kept backward-compatible connect() function using first connector for mint/redeem flows"
  - "Explicit Config type annotation on wagmiConfig to avoid TS2742 coinbase-wallet-sdk portability error"
  - "No WalletConnect connector (requires projectId not configured)"

duration: 2min
completed: 2026-02-21
---

# Quick Task 3: Fix Wallet Connection UX Summary

**Wallet connector selection dialog replacing Phantom auto-open, with explicit injected + Coinbase connectors in wagmi config**

## Performance

- **Duration:** 2 min
- **Started:** 2026-02-21T01:49:04Z
- **Completed:** 2026-02-21T01:51:40Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- Connect Wallet button now opens a Dialog listing all available wallet connectors
- Users can choose MetaMask, Coinbase Wallet, or any injected wallet
- Phantom no longer hijacks the connection flow
- Switch to Fuji, SIWE sign-in, and disconnect flows unchanged

## Task Commits

Each task was committed atomically:

1. **Task 1: Add explicit connectors to wagmi config and expose connector selection in useWallet** - `ea44a81` (feat)
2. **Task 2: Replace direct connect with wallet selection dialog in WalletButton** - `ef192cd` (feat)

## Files Created/Modified
- `apps/web/lib/wagmi.ts` - Added explicit injected() and coinbaseWallet() connectors with Config type annotation
- `apps/web/hooks/use-wallet.ts` - Added connectors list, connectWith(connector), kept backward-compatible connect()
- `apps/web/features/layout/wallet-button.tsx` - Replaced direct connect button with Dialog-based connector selector

## Decisions Made
- Kept backward-compatible `connect()` function that uses the first available connector -- auth-context.tsx, mint-flow.tsx, and redeem-flow.tsx all depend on it
- Added explicit `Config` type annotation on `wagmiConfig` export to avoid TS2742 deep node_modules portability error from coinbaseWallet connector types
- Did not add WalletConnect connector since it requires a WalletConnect projectId which is not configured

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Kept backward-compatible connect() for existing consumers**
- **Found during:** Task 1 (useWallet hook update)
- **Issue:** auth-context.tsx, mint-flow.tsx, and redeem-flow.tsx all destructure `connect` from useWallet -- removing it caused 6 type errors
- **Fix:** Added `connect()` back as a function that uses the first available connector
- **Files modified:** apps/web/hooks/use-wallet.ts
- **Verification:** `pnpm --filter @ammo-exchange/web check` passes
- **Committed in:** ea44a81 (Task 1 commit)

**2. [Rule 3 - Blocking] Added Config type annotation to wagmiConfig export**
- **Found during:** Task 1 (wagmi config update)
- **Issue:** TypeScript TS2742 error -- inferred type cannot be named without reference to deep @coinbase/wallet-sdk node_modules path
- **Fix:** Added explicit `Config` type annotation on the export
- **Files modified:** apps/web/lib/wagmi.ts
- **Verification:** `pnpm --filter @ammo-exchange/web check` passes
- **Committed in:** ea44a81 (Task 1 commit)

---

**Total deviations:** 2 auto-fixed (2 blocking)
**Impact on plan:** Both fixes necessary for type safety and backward compatibility. No scope creep.

## Issues Encountered
None beyond the auto-fixed deviations above.

## User Setup Required
None - no external service configuration required.

---
*Quick Task: 3*
*Completed: 2026-02-21*
