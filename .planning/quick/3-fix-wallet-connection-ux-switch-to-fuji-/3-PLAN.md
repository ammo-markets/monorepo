---
phase: quick
plan: 3
type: execute
wave: 1
depends_on: []
files_modified:
  - apps/web/lib/wagmi.ts
  - apps/web/hooks/use-wallet.ts
  - apps/web/features/layout/wallet-button.tsx
autonomous: true
must_haves:
  truths:
    - "Clicking Connect Wallet opens a dialog showing available wallet options (MetaMask, Coinbase, etc.) instead of auto-opening Phantom"
    - "User can choose which wallet to connect with from the dialog"
    - "Switch to Fuji button only appears when wallet IS connected but on wrong network"
    - "User can disconnect wallet from the dropdown menu"
  artifacts:
    - path: "apps/web/lib/wagmi.ts"
      provides: "Wagmi config with explicit connector declarations"
    - path: "apps/web/hooks/use-wallet.ts"
      provides: "Wallet hook exposing available connectors and per-connector connect"
    - path: "apps/web/features/layout/wallet-button.tsx"
      provides: "Wallet button with connector selection dialog"
  key_links:
    - from: "apps/web/features/layout/wallet-button.tsx"
      to: "apps/web/hooks/use-wallet.ts"
      via: "useWallet hook returns connectors list and connectWith(connector) function"
    - from: "apps/web/hooks/use-wallet.ts"
      to: "apps/web/lib/wagmi.ts"
      via: "wagmi useConnectors reads declared connectors from config"
---

<objective>
Fix wallet connection UX so clicking "Connect Wallet" shows a connector selection dialog instead of auto-opening Phantom. The "Switch to Fuji" button should only appear when wallet is connected but on wrong network.

Purpose: Users need to choose which wallet to connect with, not have Phantom hijack the flow.
Output: Proper wallet selection dialog using existing Dialog UI component and wagmi's useConnectors.
</objective>

<execution_context>
@/Users/chiranjibipoudyal/.claude/get-shit-done/workflows/execute-plan.md
@/Users/chiranjibipoudyal/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@apps/web/lib/wagmi.ts
@apps/web/hooks/use-wallet.ts
@apps/web/features/layout/wallet-button.tsx
@apps/web/components/ui/dialog.tsx
@apps/web/app/providers.tsx
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add explicit connectors to wagmi config and expose connector selection in useWallet hook</name>
  <files>apps/web/lib/wagmi.ts, apps/web/hooks/use-wallet.ts</files>
  <action>
1. In `apps/web/lib/wagmi.ts`: Add explicit connectors array to the wagmi config:
   - `injected()` (covers MetaMask, Brave, and other injected wallets)
   - `coinbaseWallet({ appName: "Ammo Exchange" })`
   - Import from `wagmi/connectors`
   - Do NOT add `walletConnect` — it requires a WalletConnect projectId which isn't configured
   - Keep existing chains and transports unchanged

2. In `apps/web/hooks/use-wallet.ts`:
   - Import `useConnectors` from wagmi
   - Remove the hardcoded `injected()` connector import from `wagmi/connectors`
   - Replace `connect: () => connect({ connector: injected() })` with:
     - `connectors` — expose the list from `useConnectors()` (filter out duplicates by connector.id)
     - `connectWith: (connector) => connect({ connector })` — connect using a specific connector
   - Remove the old `connect` function
   - Keep all other hook state and actions the same
     </action>
     <verify>Run `pnpm --filter @ammo-exchange/web check` — no type errors</verify>
     <done>wagmi config declares explicit connectors; useWallet exposes connector list and connectWith function instead of hardcoded injected connect</done>
     </task>

<task type="auto">
  <name>Task 2: Replace direct connect button with wallet selection dialog in WalletButton</name>
  <files>apps/web/features/layout/wallet-button.tsx</files>
  <action>
1. In the WalletButton component, replace the "not connected" state (the current button that calls `connect` directly) with a Dialog-based wallet selector:

2. Add state: `const [showConnectDialog, setShowConnectDialog] = useState(false);`

3. Destructure `connectors` and `connectWith` from `useWallet()` instead of the old `connect`.

4. The "Connect Wallet" button (State A, lines 57-70) should now open the dialog:
   - `onClick={() => setShowConnectDialog(true)}` instead of `onClick={connect}`
   - Remove `disabled={isConnecting}` from the trigger button (dialog handles state)

5. Add a Dialog after the button (use existing Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription from `@/components/ui/dialog`):

   ```
   <Dialog open={showConnectDialog} onOpenChange={setShowConnectDialog}>
     <DialogContent>
       <DialogHeader>
         <DialogTitle>Connect Wallet</DialogTitle>
         <DialogDescription>Choose a wallet to connect with Ammo Exchange</DialogDescription>
       </DialogHeader>
       <div className="flex flex-col gap-2">
         {connectors.map((connector) => (
           <button
             key={connector.uid}
             type="button"
             className="flex items-center gap-3 rounded-lg border border-border-hover px-4 py-3 text-sm font-medium text-text-primary transition-all duration-150 hover:border-brass-border hover:bg-ax-tertiary disabled:opacity-50"
             onClick={() => {
               connectWith(connector);
               setShowConnectDialog(false);
             }}
             disabled={isConnecting}
           >
             {connector.icon && (
               <img src={connector.icon} alt="" className="h-6 w-6 rounded" />
             )}
             <span>{connector.name}</span>
           </button>
         ))}
       </div>
     </DialogContent>
   </Dialog>
   ```

6. The "Switch to Fuji" state (State B, lines 74-91) is CORRECT as-is — it only shows when `isWrongNetwork` is true, which already checks `account.isConnected && account.chainId !== avalancheFuji.id`. No change needed here.

7. Make sure imports are updated: add Dialog components, remove old `connect` destructure, add `connectors` and `connectWith`.
   </action>
   <verify>
   Run `pnpm --filter @ammo-exchange/web check` — no type errors.
   Run `pnpm --filter @ammo-exchange/web build` — build succeeds.
   </verify>
   <done>
   Clicking "Connect Wallet" opens a dialog listing available wallet connectors with their names and icons. Each connector button connects with that specific wallet and closes the dialog. Phantom no longer auto-opens. Switch to Fuji only shows when connected to wrong network.
   </done>
   </task>

</tasks>

<verification>
- `pnpm --filter @ammo-exchange/web check` passes with no type errors
- `pnpm --filter @ammo-exchange/web build` succeeds
- The Connect Wallet button opens a dialog (not Phantom directly)
- Each wallet option in the dialog calls connectWith with the specific connector
- Switch to Fuji button behavior unchanged (only shows when connected + wrong chain)
- Disconnect flow unchanged
- SIWE sign-in flow unchanged
</verification>

<success_criteria>

- Connect Wallet shows a selection dialog with available wallets
- No wallet auto-opens on page load or button click
- Users can pick MetaMask, Coinbase Wallet, or any injected wallet
- Network switch flow only triggers after wallet is connected
- All existing states (wrong network, sign-in, connected dropdown) still work
  </success_criteria>

<output>
After completion, create `.planning/quick/3-fix-wallet-connection-ux-switch-to-fuji-/3-SUMMARY.md`
</output>
