---
phase: quick
plan: 2
type: execute
wave: 1
depends_on: []
files_modified:
  - packages/contracts/scripts/export-abis.ts
  - packages/contracts/src/abis/MockUSDC.ts
  - packages/contracts/src/abis/index.ts
  - apps/web/hooks/use-usdc-faucet.ts
  - apps/web/features/dashboard/usdc-faucet-button.tsx
  - apps/web/features/dashboard/balance-cards.tsx
  - apps/web/features/dashboard/index.ts
autonomous: true
must_haves:
  truths:
    - "User sees a 'Get Test USDC' button on the dashboard when connected to Fuji testnet"
    - "Clicking the button calls MockUSDC.faucet(10_000e6) and mints 10,000 USDC to the user"
    - "USDC balance refreshes automatically after successful faucet transaction"
    - "Faucet button shows loading/pending state while transaction confirms"
  artifacts:
    - path: "packages/contracts/src/abis/MockUSDC.ts"
      provides: "MockUSDC ABI for faucet function"
      contains: "MockUSDCAbi"
    - path: "apps/web/hooks/use-usdc-faucet.ts"
      provides: "Hook wrapping useWriteContract for MockUSDC.faucet"
      exports: ["useUsdcFaucet"]
    - path: "apps/web/features/dashboard/usdc-faucet-button.tsx"
      provides: "Faucet button component"
      exports: ["UsdcFaucetButton"]
  key_links:
    - from: "apps/web/hooks/use-usdc-faucet.ts"
      to: "packages/contracts/src/abis/MockUSDC.ts"
      via: "import MockUSDCAbi"
      pattern: "import.*MockUSDCAbi.*from.*@ammo-exchange/contracts"
    - from: "apps/web/features/dashboard/usdc-faucet-button.tsx"
      to: "apps/web/hooks/use-usdc-faucet.ts"
      via: "import useUsdcFaucet"
      pattern: "useUsdcFaucet"
    - from: "apps/web/features/dashboard/balance-cards.tsx"
      to: "apps/web/features/dashboard/usdc-faucet-button.tsx"
      via: "renders UsdcFaucetButton in USDC balance row"
      pattern: "UsdcFaucetButton"
---

<objective>
Add a "Get Test USDC" faucet button to the dashboard that calls MockUSDC.faucet(10_000e6) when connected to Fuji testnet, allowing users to mint test USDC for protocol interactions.

Purpose: Users need test USDC to mint ammo tokens on Fuji testnet. Currently there is no in-app way to get test USDC.
Output: A faucet button integrated into the dashboard USDC balance row that mints 10,000 USDC per click.
</objective>

<execution_context>
@/Users/chiranjibipoudyal/.claude/get-shit-done/workflows/execute-plan.md
@/Users/chiranjibipoudyal/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@packages/contracts/scripts/export-abis.ts
@packages/contracts/src/abis/index.ts
@packages/contracts/src/MockUSDC.sol
@packages/shared/src/config/index.ts
@apps/web/hooks/use-token-balances.ts
@apps/web/hooks/use-mint-transaction.ts
@apps/web/features/dashboard/balance-cards.tsx
@apps/web/features/dashboard/quick-actions.tsx
@apps/web/features/dashboard/index.ts
@apps/web/app/(app)/dashboard/page.tsx
</context>

<tasks>

<task type="auto">
  <name>Task 1: Export MockUSDC ABI from contracts package</name>
  <files>packages/contracts/scripts/export-abis.ts, packages/contracts/src/abis/MockUSDC.ts, packages/contracts/src/abis/index.ts</files>
  <action>
1. Add "MockUSDC" to the `CONTRACTS_TO_EXPORT` array in `packages/contracts/scripts/export-abis.ts`.
2. Run `pnpm contracts:build` from repo root to compile Solidity and export all ABIs (this runs `forge build && tsx scripts/export-abis.ts`).
3. Verify that `packages/contracts/src/abis/MockUSDC.ts` was generated with `export const MockUSDCAbi = [...]  as const`.
4. Verify that `packages/contracts/src/abis/index.ts` now includes `export { MockUSDCAbi } from "./MockUSDC.js";`.

The MockUSDC ABI only needs the `faucet(uint256)` function but the full ABI will be exported (balanceOf, approve, transfer, etc.) which is fine.
  </action>
  <verify>
- File `packages/contracts/src/abis/MockUSDC.ts` exists and contains `MockUSDCAbi`
- `packages/contracts/src/abis/index.ts` exports `MockUSDCAbi`
- `pnpm --filter @ammo-exchange/contracts check` passes (typecheck)
  </verify>
  <done>MockUSDC ABI is exported from @ammo-exchange/contracts/abis and importable by web app</done>
</task>

<task type="auto">
  <name>Task 2: Create faucet hook and button component, integrate into dashboard</name>
  <files>apps/web/hooks/use-usdc-faucet.ts, apps/web/features/dashboard/usdc-faucet-button.tsx, apps/web/features/dashboard/balance-cards.tsx, apps/web/features/dashboard/index.ts</files>
  <action>
**Hook: `apps/web/hooks/use-usdc-faucet.ts`**

Create a hook following the exact pattern in `use-mint-transaction.ts`:
- `"use client"` directive
- Import `useWriteContract`, `useWaitForTransactionReceipt` from wagmi
- Import `MockUSDCAbi` from `@ammo-exchange/contracts/abis`
- Import `CONTRACT_ADDRESSES` from `@ammo-exchange/shared`
- Export `useUsdcFaucet()` that returns: `{ faucet, hash, error, isPending, isConfirming, isConfirmed }`
- `faucet()` calls `writeContract` with:
  - `address: CONTRACT_ADDRESSES.fuji.usdc`
  - `abi: MockUSDCAbi`
  - `functionName: "faucet"`
  - `args: [BigInt(10_000e6)]` (10,000 USDC, 6 decimals)
- Use `useWaitForTransactionReceipt({ hash })` to track confirmation
- Accept an `onSuccess` callback parameter that fires when `isConfirmed` becomes true (use a `useEffect` watching `isConfirmed` to call it, same pattern as other hooks)

**Component: `apps/web/features/dashboard/usdc-faucet-button.tsx`**

Create a client component:
- `"use client"` directive
- Import `useUsdcFaucet` from `@/hooks/use-usdc-faucet`
- Import `useChainId` from wagmi (to check if on Fuji, chainId 43113)
- Props: `{ onSuccess?: () => void }`
- If `chainId !== 43113`, return `null` (only show on Fuji)
- Render a button styled consistently with the app:
  - Text: "Get Test USDC" (default), "Requesting..." (isPending), "Confirming..." (isConfirming), "Minted!" (isConfirmed, show briefly)
  - Style: small outline button, similar to the redeem button style in `quick-actions.tsx` — use classes: `rounded-lg border border-border-hover bg-transparent px-3 py-1.5 text-xs font-semibold text-text-primary transition-colors duration-150 hover:border-brass-border hover:bg-ax-tertiary`
  - Disabled when `isPending || isConfirming`
  - When `isConfirmed`, call `onSuccess` prop

**Integration: `apps/web/features/dashboard/balance-cards.tsx`**

In the USDC Balance Row section (the `mt-3 flex items-center justify-between` div at the bottom):
- Import `UsdcFaucetButton` from `./usdc-faucet-button`
- The component already receives no `refetch` prop, so we need to add it. Add `onRefetch?: () => void` to `BalanceCardsProps`.
- Place `<UsdcFaucetButton onSuccess={onRefetch} />` between the USDC label and the balance amount. Adjust the layout: wrap the right side (faucet button + balance) in a `flex items-center gap-3` div.

**Dashboard page: `apps/web/app/(app)/dashboard/page.tsx`**

Pass `refetch` from `useTokenBalances()` to `BalanceCards` as `onRefetch={refetch}`:
```tsx
<BalanceCards
  balances={tokens}
  usdc={usdc}
  marketData={marketData}
  isLoading={balancesLoading || marketLoading}
  onRefetch={refetch}
/>
```

**Barrel export: `apps/web/features/dashboard/index.ts`**

Add: `export { UsdcFaucetButton } from "./usdc-faucet-button";`
  </action>
  <verify>
- `pnpm --filter @ammo-exchange/web check` passes (typecheck)
- Run `pnpm dev` and visit dashboard while connected to Fuji testnet
- "Get Test USDC" button visible next to USDC balance
- Button not visible if not on Fuji (chainId !== 43113)
  </verify>
  <done>
- Faucet button appears on dashboard USDC balance row when connected to Fuji
- Clicking it sends MockUSDC.faucet(10_000e6) transaction
- Button shows pending/confirming states during transaction
- USDC balance refreshes after successful mint
- Button hidden when not on Fuji testnet
  </done>
</task>

</tasks>

<verification>
1. `pnpm --filter @ammo-exchange/contracts check` — contracts typecheck passes
2. `pnpm --filter @ammo-exchange/web check` — web typecheck passes
3. Dashboard page loads without errors
4. UsdcFaucetButton renders only on Fuji (chainId 43113)
5. Clicking button triggers MockUSDC.faucet transaction
6. Balance updates after successful mint
</verification>

<success_criteria>
- MockUSDC ABI exported and importable from @ammo-exchange/contracts/abis
- "Get Test USDC" button visible on dashboard when wallet connected to Fuji testnet
- Button calls MockUSDC.faucet(10_000e6) on click
- USDC balance refreshes after successful faucet transaction
- Both packages typecheck cleanly
</success_criteria>

<output>
After completion, create `.planning/quick/2-add-get-test-usdc-faucet-button-to-ui-fo/2-SUMMARY.md`
</output>
