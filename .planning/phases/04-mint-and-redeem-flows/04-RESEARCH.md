# Phase 4: Mint and Redeem Flows - Research

**Researched:** 2026-02-11
**Domain:** wagmi v2 write hooks (useWriteContract, useWaitForTransactionReceipt), ERC20 approve pattern, viem error decoding, transaction status state machines, CaliberMarket contract interaction
**Confidence:** HIGH

## Summary

Phase 4 replaces the simulated wallet state machine in the existing MintFlow and RedeemFlow components with real on-chain transactions. The existing UI components already have the correct multi-step structure (select caliber, enter amount, review, confirm) and placeholder wallet state management -- but all contract calls are currently faked with `setTimeout()` and `Math.random()`. This phase rewires those fake handlers to actual wagmi write hooks that send real transactions to the CaliberMarket contracts on Fuji.

The core interaction surface is narrow: (1) ERC20 `approve` on MockUSDC to let CaliberMarket spend the user's USDC, (2) `startMint(usdcAmount, maxSlippageBps, deadline)` on the target CaliberMarket, and (3) `startRedeem(tokenAmount, deadline)` on the target CaliberMarket. Both `startMint` and `startRedeem` require the user to have already approved the token transfer (USDC for mint, AmmoToken for redeem). The redeem flow also requires submitting a shipping address via the existing `POST /api/redeem/shipping` route and creating/updating a user KYC record in the database (auto-approved on testnet).

wagmi v2 provides `useWriteContract` for sending transactions and `useWaitForTransactionReceipt` for tracking confirmation. These two hooks compose into a state machine: idle -> pending (wallet popup) -> submitted (hash returned) -> confirming (waiting for block inclusion) -> confirmed/failed. Error handling requires distinguishing three failure modes: (a) user rejected the wallet popup (`UserRejectedRequestError`), (b) contract reverted with a custom error (e.g., `InvalidAmount`, `MinMintNotMet`, `MarketPaused`), and (c) transaction reverted after submission. viem automatically decodes custom errors from the contract ABI, so error.shortMessage contains human-readable text when the ABI is passed.

**Primary recommendation:** Use `useWriteContract` directly (not `useSimulateContract` + `useWriteContract`) for the approve/mint/redeem calls. The simulation pattern adds complexity and is not required -- wagmi wallets (MetaMask) simulate internally before prompting. Build a single `useMintTransaction` hook and `useRedeemTransaction` hook that compose `useWriteContract` + `useWaitForTransactionReceipt` with a unified error parser. Map all CaliberMarket custom errors to user-friendly messages via a static lookup table.

## Standard Stack

### Core

| Library                  | Version      | Purpose                                                                 | Why Standard                                                  |
| ------------------------ | ------------ | ----------------------------------------------------------------------- | ------------------------------------------------------------- |
| wagmi                    | 2.19.5       | `useWriteContract`, `useWaitForTransactionReceipt` for tx lifecycle     | Already installed, provides React Query-backed mutation hooks |
| viem                     | 2.45.1       | ABI encoding, error decoding, type utilities (`parseUnits`, `erc20Abi`) | Already installed, wagmi's underlying engine                  |
| @tanstack/react-query    | 5.90.20      | Mutation state management for write hooks                               | Already installed as wagmi peer dependency                    |
| @ammo-exchange/contracts | workspace:\* | CaliberMarketAbi, AmmoTokenAbi for typed contract calls                 | Already exports all ABIs with `as const`                      |
| @ammo-exchange/shared    | workspace:\* | CONTRACT_ADDRESSES, CALIBER_SPECS, FEES for address/config lookups      | Already exports per-caliber addresses and fee constants       |

### Supporting

| Library            | Version   | Purpose                                                 | When to Use                                                          |
| ------------------ | --------- | ------------------------------------------------------- | -------------------------------------------------------------------- |
| viem `erc20Abi`    | (bundled) | Standard ERC20 ABI for `approve` and `allowance` reads  | USDC approval before startMint                                       |
| viem `parseUnits`  | (bundled) | Convert human-readable amounts to wei/token units       | Converting USDC input (e.g., "100") to 6-decimal BigInt (100000000n) |
| viem `formatUnits` | (bundled) | Convert BigInt back to human-readable for display       | Displaying token balances                                            |
| zod                | 4.3.6     | Shipping address validation (already used in API route) | POST /api/redeem/shipping client-side pre-validation                 |

### Alternatives Considered

| Instead of                  | Could Use                                  | Tradeoff                                                                                                                                                                                                                                        |
| --------------------------- | ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `useWriteContract` directly | `useSimulateContract` + `useWriteContract` | Simulation adds a pre-flight check that catches errors before wallet popup. But MetaMask already simulates internally, and simulation queries run on every render (wasted RPC calls). Direct write is simpler and sufficient for this use case. |
| Custom error parser         | `decodeErrorResult` from viem              | `decodeErrorResult` is lower-level. wagmi's error object already includes decoded error info when ABI is provided. A simple error.shortMessage check + name-based lookup is enough.                                                             |
| Polling for tx status       | `useWaitForTransactionReceipt`             | The hook already does the polling internally via React Query. No need to build custom polling.                                                                                                                                                  |

**Installation:**
No new packages needed. All dependencies are already installed.

## Architecture Patterns

### Recommended Project Structure

```
apps/web/
  hooks/
    use-wallet.ts                  # EXISTING - wallet connect/disconnect/switch
    use-token-balances.ts          # EXISTING - multicall balance reads
    use-mint-transaction.ts        # NEW - approve + startMint + receipt tracking
    use-redeem-transaction.ts      # NEW - startRedeem + receipt tracking
    use-allowance.ts               # NEW - read current USDC/token allowance
  lib/
    wagmi.ts                       # EXISTING - no changes needed
    viem.ts                        # EXISTING - server-side client
    utils.ts                       # EXISTING - snowtraceUrl, truncateAddress
    errors.ts                      # NEW - contract error -> human message mapping
    tx-utils.ts                    # NEW - deadline calculation, amount parsing helpers
  features/
    mint/
      mint-flow.tsx                # MODIFIED - replace setTimeout with real hooks
      mint-progress.tsx            # EXISTING - no changes needed
    redeem/
      redeem-flow.tsx              # MODIFIED - replace setTimeout with real hooks
      redeem-progress.tsx          # EXISTING - no changes needed
  app/
    api/
      redeem/
        shipping/
          route.ts                 # EXISTING - already implemented in Phase 3
      users/
        kyc/
          route.ts                 # NEW - GET/POST KYC status, auto-approve for testnet
```

### Pattern 1: useWriteContract + useWaitForTransactionReceipt Composition

**What:** The core two-hook pattern for sending a transaction and tracking its confirmation. `useWriteContract` returns a hash on wallet approval. That hash feeds into `useWaitForTransactionReceipt` which polls for block inclusion.

**When to use:** Every on-chain write operation (approve, startMint, startRedeem).

**Example:**

```typescript
// Source: wagmi docs (https://wagmi.sh/react/guides/write-to-contract)
"use client";

import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import type { BaseError } from "wagmi";

export function useMintTransaction() {
  const {
    data: hash,
    error: writeError,
    isPending: isWritePending,
    writeContract,
    reset,
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    error: receiptError,
  } = useWaitForTransactionReceipt({ hash });

  // Derived state machine
  const status = !hash
    ? isWritePending
      ? "pending" // wallet popup open
      : "idle"
    : isConfirming
      ? "confirming" // tx submitted, waiting for block
      : isConfirmed
        ? "confirmed"
        : "failed";

  const error = writeError || receiptError;

  return {
    hash,
    status,
    error,
    isWritePending,
    isConfirming,
    isConfirmed,
    writeContract,
    reset,
  };
}
```

### Pattern 2: ERC20 Approve-Then-Execute (Two-Step Mint)

**What:** USDC must be approved before CaliberMarket can call `transferFrom` in `startMint`. This requires two sequential transactions: (1) `usdc.approve(marketAddress, amount)`, (2) `market.startMint(amount, slippage, deadline)`. The UI must track both steps.

**When to use:** Mint flow only. The redeem flow needs AmmoToken approval (token.approve to market), which follows the same pattern.

**Example:**

```typescript
// Approve USDC spending
writeContract({
  address: CONTRACT_ADDRESSES.fuji.usdc,
  abi: erc20Abi,
  functionName: "approve",
  args: [marketAddress, usdcAmountBigInt],
});

// After approval confirmed, call startMint
writeContract({
  address: marketAddress,
  abi: CaliberMarketAbi,
  functionName: "startMint",
  args: [
    usdcAmountBigInt, // uint256 usdcAmount
    BigInt(500), // uint256 maxSlippageBps (5%)
    BigInt(Math.floor(Date.now() / 1000) + 86400), // uint64 deadline (24h)
  ],
});
```

### Pattern 3: Allowance Check Before Approve

**What:** Before showing the "Approve USDC" button, check if the user already has sufficient allowance. Skip the approve step if allowance >= amount.

**When to use:** Mint step 3 (review), before showing approve/confirm buttons.

**Example:**

```typescript
import { useReadContract } from "wagmi";
import { erc20Abi } from "viem";

export function useAllowance(
  tokenAddress: `0x${string}`,
  ownerAddress: `0x${string}` | undefined,
  spenderAddress: `0x${string}`,
) {
  return useReadContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: "allowance",
    args: ownerAddress ? [ownerAddress, spenderAddress] : undefined,
    query: { enabled: !!ownerAddress },
  });
}
```

### Pattern 4: Contract Error to Human-Readable Message Mapping

**What:** CaliberMarket defines 12 custom errors. Map each to a user-friendly message. viem wraps contract errors in `ContractFunctionRevertedError` with an `errorName` property when the ABI is provided.

**When to use:** Error display in both mint and redeem flows.

**Example:**

```typescript
// apps/web/lib/errors.ts
import type { BaseError } from "wagmi";

const CONTRACT_ERROR_MESSAGES: Record<string, string> = {
  InvalidAmount: "Amount must be greater than zero.",
  MinMintNotMet:
    "Amount is below the minimum mint requirement for this caliber.",
  MarketPaused: "This market is currently paused. Please try again later.",
  DeadlineExpired:
    "The transaction deadline has passed. Please submit a new order.",
  Slippage:
    "Price moved beyond your slippage tolerance. Try again with a higher slippage.",
  InvalidPrice: "Oracle price is unavailable. Please try again shortly.",
  TreasuryNotSet: "Protocol configuration error. Please contact support.",
  NotKeeper: "Unauthorized: only protocol keepers can execute this.",
  NotOwner: "Unauthorized: only protocol owner can execute this.",
  Reentrancy: "Transaction conflict detected. Please try again.",
  ZeroAddress: "Invalid address configuration.",
  InvalidBps: "Fee configuration error.",
  InsufficientBalance: "Insufficient token balance for this operation.",
  InsufficientAllowance: "Token allowance not set. Please approve first.",
};

export function parseContractError(error: Error | null): string {
  if (!error) return "";

  const baseError = error as BaseError;

  // User rejected wallet popup
  if (baseError.shortMessage?.includes("User rejected")) {
    return "Transaction cancelled. You rejected the request in your wallet.";
  }

  // Contract revert — check for custom error name
  const cause = baseError.cause as
    | { data?: { errorName?: string } }
    | undefined;
  const errorName = cause?.data?.errorName;
  if (errorName && CONTRACT_ERROR_MESSAGES[errorName]) {
    return CONTRACT_ERROR_MESSAGES[errorName];
  }

  // Fallback to shortMessage (viem already formats most errors)
  if (baseError.shortMessage) {
    return baseError.shortMessage;
  }

  return "An unexpected error occurred. Please try again.";
}
```

### Pattern 5: Transaction Status State Machine

**What:** The mint and redeem flows need a unified status type that maps to UI states (button text, loading spinners, Snowtrace links).

**When to use:** Both mint and redeem flow orchestrators.

**Example:**

```typescript
type TxStatus =
  | "idle" // no transaction in progress
  | "approving" // approve tx pending in wallet
  | "approved" // approve confirmed, ready for main tx
  | "pending" // main tx pending in wallet
  | "confirming" // main tx submitted, waiting for block
  | "confirmed" // main tx confirmed on-chain
  | "failed"; // any step failed

// In UI:
// idle -> show "Approve USDC" button (or "Confirm Mint" if already approved)
// approving -> show spinning loader "Approving..."
// approved -> show "Confirm Mint" button
// pending -> show spinning loader "Confirming..."
// confirming -> show spinning loader "Waiting for confirmation..."
// confirmed -> show success screen with Snowtrace link
// failed -> show error message with retry button
```

### Pattern 6: Deadline Calculation

**What:** Both `startMint` and `startRedeem` accept a `uint64 deadline` parameter. If set to 0, no deadline is enforced. For UX safety, set a reasonable deadline (e.g., 24 hours from now).

**When to use:** When constructing startMint and startRedeem arguments.

**Example:**

```typescript
// apps/web/lib/tx-utils.ts
export function getDeadline(hoursFromNow: number = 24): bigint {
  return BigInt(Math.floor(Date.now() / 1000) + hoursFromNow * 3600);
}

export function getDefaultSlippageBps(): bigint {
  return BigInt(500); // 5% slippage tolerance
}
```

### Anti-Patterns to Avoid

- **Using useSimulateContract for every write:** Adds an automatic refetching query that polls the RPC on every render cycle. For simple approve/mint/redeem calls, this wastes RPC requests. Use `useWriteContract` directly.
- **Sharing a single useWriteContract instance for approve + mint:** Each `writeContract()` call resets the hook's state. Use separate hook instances for approve and mint/redeem, or manage state manually.
- **Calling writeContract inside useEffect:** `useWriteContract` returns a mutation function. Call it from event handlers (button clicks), never from effects. Effects cause unintended re-triggers.
- **Forgetting to reset state on retry:** After a failed transaction, calling `reset()` on the useWriteContract hook clears the error state. Without this, the error persists and blocks retries.
- **Using Number for amounts:** USDC has 6 decimals. `parseUnits("100", 6)` returns `100000000n`. Never use `Number(amount) * 1e6` -- floating point will introduce rounding errors for large amounts. Always use `parseUnits` from viem.
- **Hardcoding gas or gasPrice:** Let wagmi/viem estimate gas automatically. Avalanche Fuji gas estimation works reliably. Hardcoding gas values causes failed transactions when gas requirements change.
- **Not checking allowance before showing approve button:** If the user already approved USDC spending in a previous session, showing "Approve USDC" again wastes their time and gas. Check allowance first with `useReadContract`.

## Don't Hand-Roll

| Problem                             | Don't Build                                   | Use Instead                                               | Why                                                                                         |
| ----------------------------------- | --------------------------------------------- | --------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Transaction lifecycle management    | Custom state machine with eth_sendTransaction | wagmi `useWriteContract` + `useWaitForTransactionReceipt` | Handles wallet interaction, nonce management, gas estimation, receipt polling, error typing |
| ERC20 approve ABI                   | Hand-written approve ABI                      | viem `erc20Abi` import                                    | Standard, type-safe, includes all ERC20 functions and events                                |
| Amount parsing (human -> BigInt)    | `Number(x) * 1e6`                             | viem `parseUnits(x, 6)`                                   | Avoids floating point precision loss                                                        |
| Amount formatting (BigInt -> human) | `Number(x) / 1e18`                            | viem `formatUnits(x, 18)`                                 | Handles large numbers correctly                                                             |
| Error message extraction            | Manual try/catch with string matching         | wagmi `BaseError.shortMessage` + error cause inspection   | viem already decodes contract errors when ABI is provided                                   |
| Receipt polling                     | `setInterval` + `eth_getTransactionReceipt`   | `useWaitForTransactionReceipt`                            | Handles block reorgs, replacement transactions, configurable confirmations                  |
| Snowtrace link generation           | Hardcoded URL construction                    | Existing `snowtraceUrl()` from `lib/utils.ts`             | Already implemented in Phase 3                                                              |

**Key insight:** The entire Phase 4 write surface is three contract functions (approve, startMint, startRedeem) composed with two wagmi hooks (useWriteContract, useWaitForTransactionReceipt). The complexity is in the UI state machine, not the blockchain interaction.

## Common Pitfalls

### Pitfall 1: Approve Must Target MockUSDC, Not CaliberMarket

**What goes wrong:** Developer calls `approve` on the CaliberMarket address instead of the MockUSDC address. The transaction succeeds (CaliberMarket has no `approve` function, but a fallback might not revert) or reverts with a confusing error.
**Why it happens:** The mint flow involves two addresses (USDC for approve, CaliberMarket for startMint). It is easy to mix them up.
**How to avoid:** The approve call must use `CONTRACT_ADDRESSES.fuji.usdc` as the contract address, with the CaliberMarket address as the `spender` argument. The startMint call uses the CaliberMarket address.
**Warning signs:** "InvalidAmount" or "execution reverted" on the approve step.

### Pitfall 2: AmmoToken Approval Needed for startRedeem

**What goes wrong:** The redeem flow calls `startRedeem` without first approving the CaliberMarket to spend the user's AmmoTokens. The contract calls `token.transferFrom(msg.sender, address(this), tokenAmount)` which reverts with `InsufficientAllowance`.
**Why it happens:** The mint flow's USDC approval is well-documented, but the redeem flow's token approval is easy to forget because it is implicit in the contract code.
**How to avoid:** Before `startRedeem`, the user must call `ammoToken.approve(marketAddress, tokenAmount)`. Check AmmoToken allowance the same way as USDC allowance.
**Warning signs:** `InsufficientAllowance` revert on startRedeem.

### Pitfall 3: USDC Has 6 Decimals, AmmoToken Has 18 Decimals

**What goes wrong:** Developer uses `parseUnits(amount, 18)` for USDC amounts or `parseUnits(amount, 6)` for AmmoToken amounts. The transaction sends a wildly wrong amount.
**Why it happens:** Most ERC20 tokens use 18 decimals, but USDC uses 6. AmmoToken (deployed by CaliberMarket constructor) uses 18 decimals (viem default for ERC20). The CaliberMarket contract accounts for this difference in its calculations (the `scale = 10 ** (18 - usdcDecimals)` logic).
**How to avoid:** Always use `parseUnits(usdcAmount, 6)` for USDC and `parseUnits(tokenAmount, 18)` for AmmoTokens. Or better, read the `decimals()` from the contract and use it dynamically.
**Warning signs:** "InvalidAmount" or "MinMintNotMet" errors when amounts look correct in the UI.

### Pitfall 4: startMint Requires Pre-Existing Allowance on CaliberMarket

**What goes wrong:** The mint flow calls `startMint` but the USDC `approve` was granted to the wrong spender (e.g., AmmoManager instead of CaliberMarket). CaliberMarket's `_safeTransferFrom` reverts.
**Why it happens:** The CaliberMarket contract calls `_safeTransferFrom(usdc, msg.sender, address(this), usdcAmount)` -- it transfers USDC FROM the user TO itself. The allowance must be on the CaliberMarket address, not any other contract.
**How to avoid:** The spender in the `approve` call must be `CONTRACT_ADDRESSES.fuji.calibers[caliber].market`. Per-caliber market addresses differ.
**Warning signs:** "InvalidAmount" revert from CaliberMarket's `_safeTransferFrom`.

### Pitfall 5: UserRejectedRequestError is Not Always Named Consistently

**What goes wrong:** Error handling checks `error.name === 'UserRejectedRequestError'` but some wallet connectors return different error names or codes for user rejection.
**Why it happens:** The EIP-1193 standard defines error code 4001 for user rejection, but wallet implementations vary. MetaMask uses `UserRejectedRequestError`, but other connectors might not.
**How to avoid:** Check both `error.shortMessage` (contains "User rejected" or "User denied") and the error code (4001). The `BaseError.shortMessage` from wagmi is the most reliable field.
**Warning signs:** User rejects transaction but sees a generic "transaction failed" error instead of "you cancelled the transaction".

### Pitfall 6: useWriteContract State Persists Between Calls

**What goes wrong:** After a successful approve, the developer calls the same `writeContract` instance for `startMint`. The hook's `data` (hash) still contains the approve hash, so `useWaitForTransactionReceipt` tracks the wrong transaction.
**Why it happens:** `useWriteContract` is a TanStack Query mutation. Calling `writeContract()` again updates the state in place. The old hash is replaced, but there may be a brief moment where the receipt hook sees the old hash.
**How to avoid:** Use two separate `useWriteContract` instances -- one for approve, one for the main transaction. OR call `reset()` between steps. The cleanest approach is separate hooks.
**Warning signs:** "Transaction confirmed" shows immediately after startMint (because it is still watching the approve hash).

### Pitfall 7: BigInt(0) Deadline Means No Deadline Enforcement

**What goes wrong:** Developer passes `BigInt(0)` as the deadline, thinking it means "no deadline". The contract actually checks `if (order.deadline != 0 && block.timestamp > order.deadline)` -- so 0 disables deadline enforcement entirely.
**Why it happens:** The contract intentionally allows 0 as "no deadline". This is correct behavior but may surprise developers who expect a default deadline.
**How to avoid:** For MVP/testnet, passing 0 is fine (no deadline). For production, always set a reasonable deadline (e.g., 24 hours). Document the choice explicitly.
**Warning signs:** Orders remain open indefinitely without deadline protection.

### Pitfall 8: startRedeem tokenAmount is in 18-Decimal Units

**What goes wrong:** Developer passes the number of rounds directly (e.g., `500n`) instead of converting to 18-decimal token units (`500n * 10n**18n`). The contract receives a tiny amount and may revert with `InvalidAmount`.
**Why it happens:** The UI displays rounds as whole numbers (e.g., "500 rounds") but the contract works in 18-decimal token units. 1 round = 1e18 token units.
**How to avoid:** Always convert rounds to token units: `parseUnits(roundsAmount, 18)`. The AmmoToken has 18 decimals.
**Warning signs:** `InvalidAmount` or successfully redeeming a microscopic amount of tokens.

## Code Examples

Verified patterns from official sources and codebase analysis:

### Complete Mint Hook

```typescript
// apps/web/hooks/use-mint-transaction.ts
// Source: wagmi docs + codebase CaliberMarketAbi analysis
"use client";

import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { erc20Abi, parseUnits } from "viem";
import { CaliberMarketAbi } from "@ammo-exchange/contracts/abis";
import { CONTRACT_ADDRESSES } from "@ammo-exchange/shared";
import type { Caliber } from "@ammo-exchange/shared";

const fuji = CONTRACT_ADDRESSES.fuji;

export function useMintTransaction(caliber: Caliber) {
  const marketAddress = fuji.calibers[caliber].market;

  // Step 1: Approve USDC spending
  const {
    data: approveHash,
    error: approveError,
    isPending: isApprovePending,
    writeContract: writeApprove,
    reset: resetApprove,
  } = useWriteContract();

  const { isLoading: isApproveConfirming, isSuccess: isApproveConfirmed } =
    useWaitForTransactionReceipt({ hash: approveHash });

  // Step 2: Call startMint
  const {
    data: mintHash,
    error: mintError,
    isPending: isMintPending,
    writeContract: writeMint,
    reset: resetMint,
  } = useWriteContract();

  const { isLoading: isMintConfirming, isSuccess: isMintConfirmed } =
    useWaitForTransactionReceipt({ hash: mintHash });

  function approve(usdcAmount: string) {
    const amount = parseUnits(usdcAmount, 6); // USDC has 6 decimals
    writeApprove({
      address: fuji.usdc,
      abi: erc20Abi,
      functionName: "approve",
      args: [marketAddress, amount],
    });
  }

  function startMint(
    usdcAmount: string,
    slippageBps: bigint,
    deadline: bigint,
  ) {
    const amount = parseUnits(usdcAmount, 6);
    writeMint({
      address: marketAddress,
      abi: CaliberMarketAbi,
      functionName: "startMint",
      args: [amount, slippageBps, deadline],
    });
  }

  function reset() {
    resetApprove();
    resetMint();
  }

  return {
    // Approve step
    approve,
    approveHash,
    approveError,
    isApprovePending,
    isApproveConfirming,
    isApproveConfirmed,

    // Mint step
    startMint,
    mintHash,
    mintError,
    isMintPending,
    isMintConfirming,
    isMintConfirmed,

    // Shared
    reset,
  };
}
```

### Complete Redeem Hook

```typescript
// apps/web/hooks/use-redeem-transaction.ts
"use client";

import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseUnits } from "viem";
import { CaliberMarketAbi, AmmoTokenAbi } from "@ammo-exchange/contracts/abis";
import { CONTRACT_ADDRESSES } from "@ammo-exchange/shared";
import type { Caliber } from "@ammo-exchange/shared";

const fuji = CONTRACT_ADDRESSES.fuji;

export function useRedeemTransaction(caliber: Caliber) {
  const marketAddress = fuji.calibers[caliber].market;
  const tokenAddress = fuji.calibers[caliber].token;

  // Step 1: Approve AmmoToken spending
  const {
    data: approveHash,
    error: approveError,
    isPending: isApprovePending,
    writeContract: writeApprove,
    reset: resetApprove,
  } = useWriteContract();

  const { isLoading: isApproveConfirming, isSuccess: isApproveConfirmed } =
    useWaitForTransactionReceipt({ hash: approveHash });

  // Step 2: Call startRedeem
  const {
    data: redeemHash,
    error: redeemError,
    isPending: isRedeemPending,
    writeContract: writeRedeem,
    reset: resetRedeem,
  } = useWriteContract();

  const { isLoading: isRedeemConfirming, isSuccess: isRedeemConfirmed } =
    useWaitForTransactionReceipt({ hash: redeemHash });

  function approve(tokenAmount: string) {
    const amount = parseUnits(tokenAmount, 18); // AmmoToken has 18 decimals
    writeApprove({
      address: tokenAddress,
      abi: AmmoTokenAbi,
      functionName: "approve",
      args: [marketAddress, amount],
    });
  }

  function startRedeem(tokenAmount: string, deadline: bigint) {
    const amount = parseUnits(tokenAmount, 18);
    writeRedeem({
      address: marketAddress,
      abi: CaliberMarketAbi,
      functionName: "startRedeem",
      args: [amount, deadline],
    });
  }

  function reset() {
    resetApprove();
    resetRedeem();
  }

  return {
    approve,
    approveHash,
    approveError,
    isApprovePending,
    isApproveConfirming,
    isApproveConfirmed,
    startRedeem,
    redeemHash,
    redeemError,
    isRedeemPending,
    isRedeemConfirming,
    isRedeemConfirmed,
    reset,
  };
}
```

### Allowance Check Hook

```typescript
// apps/web/hooks/use-allowance.ts
"use client";

import { useReadContract } from "wagmi";
import { erc20Abi } from "viem";

export function useAllowance(
  tokenAddress: `0x${string}`,
  owner: `0x${string}` | undefined,
  spender: `0x${string}`,
) {
  const { data: allowance, refetch } = useReadContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: "allowance",
    args: owner ? [owner, spender] : undefined,
    query: { enabled: !!owner },
  });

  return {
    allowance: allowance as bigint | undefined,
    refetch,
    hasEnoughAllowance: (required: bigint) =>
      allowance !== undefined && (allowance as bigint) >= required,
  };
}
```

### KYC API Route (Auto-Approve for Testnet)

```typescript
// apps/web/app/api/users/kyc/route.ts

import type { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@ammo-exchange/db";

const walletSchema = z.object({
  wallet: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
});

// GET /api/users/kyc?wallet=0x...
export async function GET(request: NextRequest) {
  const wallet = request.nextUrl.searchParams.get("wallet");
  const parsed = walletSchema.safeParse({ wallet });
  if (!parsed.success) {
    return Response.json({ error: "Invalid wallet" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { walletAddress: parsed.data.wallet.toLowerCase() },
    select: { kycStatus: true },
  });

  return Response.json({
    kycStatus: user?.kycStatus ?? "NONE",
  });
}

// POST /api/users/kyc — auto-approve for testnet
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body) {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = walletSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Invalid wallet" }, { status: 400 });
  }

  const user = await prisma.user.upsert({
    where: { walletAddress: parsed.data.wallet.toLowerCase() },
    create: {
      walletAddress: parsed.data.wallet.toLowerCase(),
      kycStatus: "APPROVED", // Auto-approve for testnet
    },
    update: {
      kycStatus: "APPROVED",
    },
  });

  return Response.json({ kycStatus: user.kycStatus });
}
```

### Transaction Utility Helpers

```typescript
// apps/web/lib/tx-utils.ts

import { parseUnits, formatUnits } from "viem";

/** Get a deadline timestamp N hours from now */
export function getDeadline(hoursFromNow: number = 24): bigint {
  return BigInt(Math.floor(Date.now() / 1000) + hoursFromNow * 3600);
}

/** Default slippage for mint orders: 5% (500 bps) */
export const DEFAULT_SLIPPAGE_BPS = BigInt(500);

/** Parse USDC amount (6 decimals) */
export function parseUsdc(amount: string): bigint {
  return parseUnits(amount, 6);
}

/** Format USDC amount to human-readable */
export function formatUsdc(amount: bigint): string {
  return formatUnits(amount, 6);
}

/** Parse AmmoToken amount (18 decimals) */
export function parseTokenAmount(rounds: string): bigint {
  return parseUnits(rounds, 18);
}

/** Format AmmoToken amount to human-readable rounds */
export function formatTokenAmount(amount: bigint): string {
  return formatUnits(amount, 18);
}
```

## State of the Art

| Old Approach                                        | Current Approach                                                               | When Changed     | Impact                                                                  |
| --------------------------------------------------- | ------------------------------------------------------------------------------ | ---------------- | ----------------------------------------------------------------------- |
| `usePrepareContractWrite` + `useContractWrite` (v1) | `useWriteContract` (direct) or `useSimulateContract` + `useWriteContract` (v2) | wagmi v2 (2024)  | v1 pattern removed; v2 uses mutation-based API with optional simulation |
| `useWaitForTransaction` (v1)                        | `useWaitForTransactionReceipt` (v2)                                            | wagmi v2 (2024)  | Renamed; accepts `hash` instead of `data`                               |
| Manual `eth_sendTransaction`                        | wagmi `useWriteContract`                                                       | wagmi v1+        | Handles connector abstraction, error typing, mutation state             |
| `ethers.parseUnits`                                 | viem `parseUnits`                                                              | viem 1.0+ (2023) | Tree-shakeable, type-safe, no BigNumber class                           |

**Deprecated/outdated:**

- wagmi `usePrepareContractWrite`: Removed in v2. Replaced by `useSimulateContract` (optional).
- wagmi `useContractWrite`: Removed in v2. Replaced by `useWriteContract`.
- wagmi `useWaitForTransaction`: Removed in v2. Replaced by `useWaitForTransactionReceipt`.
- `useWriteContract` with `data.request` from simulation: Still works but not required. Direct invocation is simpler.

## Open Questions

1. **Should approve use exact amount or MAX_UINT256?**
   - What we know: Using `parseUnits(amount, 6)` for exact approval is safer but requires re-approval for each mint. Using `type(uint256).max` (MAX_UINT256) sets infinite approval, which is the standard DeFi pattern (Uniswap, Aave all do this).
   - What's unclear: Whether the user expects a one-time approval or per-transaction approval.
   - Recommendation: Use exact amount for MVP (safer, more transparent). Show "You only need to approve once per amount" in the UI. Can switch to infinite approval later if user feedback demands it.

2. **How to handle the two-step approve+mint UX when user already has allowance?**
   - What we know: The `useAllowance` hook can check current allowance. If sufficient, skip approve and go directly to startMint.
   - What's unclear: Whether to check allowance on page load or only when user clicks "Confirm".
   - Recommendation: Check allowance on step 2 (enter amount) whenever the amount changes. If allowance >= amount, skip the approve button and show "Confirm Mint" directly. This provides the smoothest UX.

3. **Where does the on-chain orderId come from after startMint?**
   - What we know: `startMint` returns `orderId` (uint256) and emits `MintStarted(orderId, user, ...)`. The return value is available in the transaction receipt's logs.
   - What's unclear: Whether to decode the return value from the receipt or from the event logs.
   - Recommendation: The worker already indexes `MintStarted` events and creates Order records in the database. The frontend does not need to parse the orderId from the receipt. After `isMintConfirmed`, redirect to portfolio or show the tx hash with Snowtrace link. The order will appear in the user's portfolio once the worker indexes it (seconds to minutes depending on polling interval).

4. **KYC auto-approve: in the API route or in the redeem flow component?**
   - What we know: REDEEM-03 requires "User KYC status tracked in database (auto-approved for testnet)". The Prisma User model has `kycStatus` with NONE/PENDING/APPROVED/REJECTED enum.
   - What's unclear: Whether to auto-approve at redeem time or when the user first connects their wallet.
   - Recommendation: Create a `POST /api/users/kyc` route that auto-approves. Call it during the redeem flow's KYC step. The existing KYC step UI (StepKyc component) already shows "Verify My Identity" -> "Verification In Progress" -> "Identity Verified". Wire this to the API call instead of `setTimeout`.

## Sources

### Primary (HIGH confidence)

- wagmi v2 `useWriteContract` docs: https://wagmi.sh/react/api/hooks/useWriteContract -- mutation API, parameters, return type
- wagmi v2 `useWaitForTransactionReceipt` docs: https://wagmi.sh/react/api/hooks/useWaitForTransactionReceipt -- hash parameter, confirmation tracking
- wagmi v2 `useSimulateContract` docs: https://wagmi.sh/react/api/hooks/useSimulateContract -- optional simulation pattern
- wagmi v2 Write to Contract guide: https://wagmi.sh/react/guides/write-to-contract -- complete write flow with error handling
- wagmi v2 Error Handling guide: https://wagmi.sh/core/guides/error-handling -- error types, BaseError.shortMessage
- Existing codebase: CaliberMarket.sol -- `startMint(uint256, uint256, uint64)`, `startRedeem(uint256, uint64)` function signatures
- Existing codebase: CaliberMarketAbi -- 12 custom errors (DeadlineExpired, InvalidAmount, MinMintNotMet, etc.)
- Existing codebase: MockUSDC.sol -- `approve(address, uint256)`, 6 decimals confirmed
- Existing codebase: AmmoToken.sol -- `approve(address, uint256)`, 18 decimals (default ERC20)
- Existing codebase: CONTRACT_ADDRESSES -- per-caliber market and token addresses on Fuji
- Existing codebase: mint-flow.tsx, redeem-flow.tsx -- current UI structure with mock wallet state
- Existing codebase: use-wallet.ts, use-token-balances.ts -- existing hooks from Phase 3
- Installed versions: wagmi 2.19.5, viem 2.45.1, @tanstack/react-query 5.90.20 (verified via pnpm)

### Secondary (MEDIUM confidence)

- viem ContractFunctionRevertedError behavior: https://github.com/wevm/viem/discussions/1789 -- custom error decoding from ABI
- viem decodeErrorResult: https://viem.sh/docs/contract/decodeErrorResult -- manual error decoding utility
- wagmi UserRejectedRequestError: https://github.com/wevm/wagmi/discussions/3428 -- user rejection error code 4001
- Scaffold-eth-2 wagmi write pattern: https://scaffold-eth-2-docs.vercel.app/recipes/WagmiContractWriteWithFeedback -- practical write+receipt pattern

### Tertiary (LOW confidence)

- None -- all findings verified with official documentation or codebase inspection.

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH -- all libraries already installed, versions verified from pnpm output
- Architecture (write hooks): HIGH -- wagmi v2 write hook APIs verified from official docs, patterns match codebase conventions
- Architecture (error handling): HIGH -- CaliberMarket custom errors enumerated from ABI, viem error decoding verified
- Pitfalls: HIGH -- all pitfalls derived from reading actual contract source code (CaliberMarket.sol, MockUSDC.sol, AmmoToken.sol)
- Code examples: HIGH -- constructed from verified hook APIs, existing codebase patterns, and actual ABI signatures
- KYC route: MEDIUM -- pattern follows existing API route conventions, but auto-approve logic is testnet-specific

**Research date:** 2026-02-11
**Valid until:** 2026-03-11 (30 days -- wagmi v2 is stable, contract ABIs are deployed and immutable on Fuji)
