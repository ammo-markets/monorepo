# Pitfalls Analysis: DeFi Protocol Integration

**Research Date:** 2026-02-10
**Domain:** DeFi contract-to-frontend wiring, event indexing, keeper workflows, testnet deployment
**Project:** Ammo Exchange — Tokenized ammunition on Avalanche

---

## P1. Event Listener Silently Dies, Orders Stuck Forever

**Severity:** CRITICAL
**Phase:** Worker event indexer implementation

**The Pitfall:**
viem's `watchContractEvent` uses polling-based filter watching under the hood. When the RPC endpoint drops the filter (common on public Avalanche endpoints under load), viem throws a "filter not found" error and the watcher silently stops. No events are emitted, no error callback fires. Meanwhile, users have called `startMint()` and their USDC is locked in the CaliberMarket contract with `MintStatus.Started`, waiting for a `finalizeMint()` that never comes because the worker never saw the event.

The current worker skeleton (`apps/worker/src/index.ts`) uses `http()` transport with no error handling, no reconnection logic, and no heartbeat. On Fuji, public RPC endpoints are rate-limited and occasionally return stale data.

**Warning Signs:**
- Worker logs stop printing new events but process stays alive (no crash = no Railway restart)
- Database `Order` table has no new rows despite on-chain `MintStarted` events
- Users report "stuck" orders in the admin queue with no matching DB entry
- `publicClient.getBlockNumber()` returns the same value across multiple calls (stale connection)

**Prevention Strategy:**
1. Do NOT rely solely on `watchContractEvent` for production event ingestion. Implement a polling loop with `publicClient.getContractEvents()` (getLogs) that tracks the last processed block number in the database. This is the pattern recommended by viem maintainers for reliability.
2. Store `lastProcessedBlock` in a persistent table (e.g., `IndexerState` in Prisma). On restart, resume from that block, not from "latest".
3. Add a heartbeat check: every 30 seconds, call `getBlockNumber()` and compare to the last known block. If stale for >2 minutes, recreate the public client.
4. Add a "gap detector" API route that compares on-chain `nextOrderId` for each CaliberMarket against the count of orders in the database. If they diverge, trigger a backfill from the gap.
5. Log every processed event with block number and tx hash. This audit trail is essential for debugging missed events.

**References:**
- [viem Discussion #534: watchEvents skipping events](https://github.com/wevm/viem/discussions/534)
- [viem Issue #1084: watchEvent dies after 30s on Bun](https://github.com/wevm/viem/issues/1084)
- [viem Issue #1063: watchContractEvent not working properly](https://github.com/wevm/viem/issues/1063)

---

## P2. USDC Approval UX Breaks the Mint Flow

**Severity:** HIGH
**Phase:** Frontend wagmi wiring for mint flow

**The Pitfall:**
The mint flow requires two sequential wallet transactions: (1) ERC20 `approve(caliberMarketAddress, usdcAmount)` on the USDC contract, then (2) `startMint(usdcAmount, maxSlippageBps, deadline)` on the CaliberMarket. The current mock UI (`apps/web/features/mint/mint-flow.tsx` lines 1044-1049) simulates this with `setTimeout`, but wiring real wagmi hooks introduces several failure modes:

- **Approval for wrong amount:** If the user changes the USDC amount between approval and mint, the allowance may be insufficient. The `startMint` call's internal `_safeTransferFrom` will revert with `InvalidAmount` (CaliberMarket line 328-331), but the error message is opaque.
- **Approval for wrong contract:** Each caliber has its own CaliberMarket address. Approving USDC for the 9MM market does not help if the user switches to 556.
- **Non-standard USDC behavior:** Avalanche's native USDC (0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E) returns `bool` from `approve()`, but wagmi's standard `erc20Abi` can break with some USDC implementations. On Fuji, you will deploy your own mock USDC, which may have different behavior than mainnet USDC.
- **Double-approval anti-pattern:** Some ERC20 tokens (not standard USDC, but worth noting) require setting allowance to 0 before setting a new value. The frontend must handle the "approval already exists but for a different amount" case.
- **User closes wallet popup:** If the user rejects or closes the approval transaction, the frontend state machine must reset cleanly. The current `WalletState` type does not have an "approval-rejected" state.

**Warning Signs:**
- Users report "Transaction Failed" after clicking "Confirm Mint" even though they approved
- `useWriteContract` returns `isPending: true` indefinitely (wagmi issue #4187 with WalletConnect)
- Approval transaction succeeds on-chain but frontend still shows "Approving..."
- Different behavior between MetaMask and WalletConnect during approval

**Prevention Strategy:**
1. Before calling `startMint`, always check current allowance with `useReadContract` calling `usdc.allowance(userAddress, caliberMarketAddress)`. Only prompt approval if `allowance < usdcAmount`.
2. Use the exact CaliberMarket address for the selected caliber, not a hardcoded address. Pull from `AmmoFactory.calibers(caliberId).market` or from the shared config after deployment.
3. Add explicit error parsing for CaliberMarket custom errors (InvalidAmount, InvalidBps, MarketPaused) using viem's `decodeErrorResult`. Show human-readable messages instead of raw hex.
4. Add a "approval-failed" and "approval-rejected" state to the `WalletState` machine in the mint flow component.
5. For Fuji testnet, deploy a mock USDC that matches mainnet behavior (6 decimals, standard ERC20 returns). Do NOT use an 18-decimal test token -- the CaliberMarket's `usdcDecimals` is immutable and set at deployment.
6. Implement `useWaitForTransactionReceipt` after approval to confirm it landed before enabling the mint button.

**References:**
- [wagmi Issue #4423: USDT non-standard ERC20 approval](https://github.com/wevm/wagmi/issues/4423)
- [wagmi Issue #4187: useWriteContract hash not returning with WalletConnect](https://github.com/wevm/wagmi/issues/4187)

---

## P3. Fuji Testnet Has No Official USDC -- Deployment Address Mismatch

**Severity:** HIGH
**Phase:** Contract deployment to Fuji

**The Pitfall:**
The shared config (`packages/shared/src/config/index.ts`) has placeholder `0x000...` addresses for Fuji USDC. Avalanche Fuji does not have an official Circle USDC deployment. You must deploy your own mock USDC token. However, this creates a cascade of issues:

- **Decimal mismatch:** CaliberMarket's `usdcDecimals` is immutable (set in constructor, line 76). If you deploy a mock USDC with 18 decimals instead of 6, all price calculations will be off by 10^12. The formula `uint256 scale = 10 ** (18 - usdcDecimals)` (line 156) will compute `10^0 = 1` instead of `10^12`, producing wildly wrong token amounts.
- **Address config propagation:** After deploying contracts to Fuji, you must update `CONTRACT_ADDRESSES.fuji` in the shared package AND the wagmi config. If the frontend reads from one source and the worker from another, they will disagree on which contracts to interact with.
- **Factory creates markets at deployment-time addresses:** When `AmmoFactory.createCaliber()` deploys a new CaliberMarket, the market address is deterministic but not known until the transaction is mined. The frontend and worker need to discover these addresses either from the factory's `calibers()` mapping or from the `CaliberCreated` event.
- **Foundry deploy scripts must set AmmoManager.treasury():** If treasury is not set before the first `finalizeMint()`, the transaction will revert with `TreasuryNotSet` (CaliberMarket line 212). This is easy to forget in deployment scripts.

**Warning Signs:**
- `finalizeMint` reverts with `TreasuryNotSet` on the first order
- Minted token amounts are astronomically large or near-zero (decimal mismatch)
- Frontend shows "0 balance" despite successful mint (reading wrong contract address)
- Worker indexes events from wrong contract address

**Prevention Strategy:**
1. Create a comprehensive Foundry deployment script (`script/Deploy.s.sol`) that deploys in order: (a) Mock USDC with 6 decimals, (b) AmmoManager with feeRecipient, (c) AmmoFactory with manager + USDC addresses, (d) createCaliber for each of the 4 calibers, (e) setTreasury on AmmoManager, (f) setKeeper for the keeper wallet.
2. After deployment, run `export-abis.ts` AND a new `export-addresses.ts` script that reads deployment artifacts and updates `packages/shared/src/config/index.ts` with real Fuji addresses.
3. Add a sanity-check script that reads `usdcDecimals` from each deployed CaliberMarket and verifies it matches the mock USDC's `decimals()` return value.
4. Add the mock USDC contract to your Foundry project's `test/` directory (you already have `MockERC20.sol` there -- ensure it supports configurable decimals).

---

## P4. Admin Finalization From Browser Wallet Has Gas and Nonce Issues

**Severity:** HIGH
**Phase:** Admin dashboard and keeper workflow

**The Pitfall:**
The architecture decision is that admin (keeper) triggers `finalizeMint()` and `finalizeRedeem()` from a browser wallet via wagmi in the admin UI. This means the keeper's hot wallet private key is in MetaMask or a similar browser extension. Several issues arise:

- **Gas estimation on Fuji is unreliable:** Avalanche Fuji's gas estimation can return values that are too low for contract calls that do token minting + USDC transfers. If the admin clicks "Finalize" and the transaction runs out of gas, the order stays in `MintStatus.Started` state. The admin must manually retry, and there is no obvious indicator that gas was the issue (just a generic "transaction reverted").
- **Nonce collision:** If the admin clicks "Finalize" on two orders rapidly, the second transaction may use the same nonce as the first (wagmi batches requests). This causes one transaction to fail silently.
- **Keeper wallet balance runs out of AVAX:** On Fuji, the keeper wallet needs test AVAX for gas. Faucets limit to 2 AVAX per day. If the keeper processes many orders in testing, they can run out of gas funds with no warning.
- **Price parameter is manually supplied:** `finalizeMint(orderId, actualPriceX18)` takes a price. The admin UI must compute this correctly. If `actualPriceX18` is in the wrong units (e.g., dollars instead of wei-scaled 1e18), the minted token amount will be wrong. There is no bounds check in the contract beyond slippage protection.
- **Keeper wallet exposure:** The keeper wallet address has elevated permissions (can mint tokens, refund USDC, cancel redeems). If the browser extension is compromised, the attacker can drain the protocol.

**Warning Signs:**
- Finalization transactions revert with no clear error ("execution reverted" with no custom error decoded)
- Admin sees "pending" transactions that never confirm (nonce gap)
- Token amounts minted are clearly wrong (e.g., 1e30 tokens for a $100 mint)
- Admin's AVAX balance hits zero mid-session

**Prevention Strategy:**
1. Add explicit gas limit override in the admin UI's `useWriteContract` calls. Set gas to 500,000 for finalize operations (typical usage is 150k-300k, but leave headroom). Do not rely on estimation.
2. Display the admin wallet's AVAX balance prominently on the admin dashboard. Add a warning banner when balance drops below 0.5 AVAX.
3. Build a price calculation helper in the admin UI: given the USDC amount and intended token output, compute `actualPriceX18 = (netUsdc * scale * 1e18) / expectedTokens`. Show the admin the expected token output BEFORE they submit.
4. Add contract-level price bounds in a future iteration: revert if `actualPriceX18` deviates more than 20% from `order.requestPrice`.
5. For testnet, create a faucet helper script that drips AVAX to the keeper wallet using the Fuji faucet API.
6. Use `useWaitForTransactionReceipt` after every finalization to confirm success before allowing the next action. Disable the "Finalize" button while a transaction is pending.

---

## P5. Prisma Connection Pooling Exhaustion on Neon Serverless

**Severity:** MEDIUM-HIGH
**Phase:** Next.js API routes + worker DB integration

**The Pitfall:**
The current Prisma client (`packages/db/src/client.ts`) uses the `@prisma/adapter-pg` with a raw connection string. In a serverless environment (Vercel), each API route invocation creates a new connection. Under load, this exhausts Neon's connection limit (default: 100 connections on free tier). The symptoms are intermittent "too many connections" errors that appear randomly under traffic.

Additionally, the worker on Railway is a long-running process that holds a single connection. If the connection drops (Neon's idle timeout is 5 minutes for free tier), the next Prisma query fails silently and the worker may crash.

The `globalForPrisma` pattern (client.ts lines 18-26) helps in development but does NOT help in production Vercel because each serverless function is a separate process with its own global scope.

**Warning Signs:**
- API routes intermittently return 500 errors with "Connection terminated unexpectedly"
- Worker crashes with "Connection refused" after idle periods
- Prisma queries take 2-5 seconds on first call after cold start (Neon compute waking up)
- Database shows connection count near limit in Neon dashboard

**Prevention Strategy:**
1. Use Neon's pooled connection string (with `-pooler` suffix) for the Vercel deployment. This routes through PgBouncer.
2. For the worker on Railway, add connection retry logic: wrap Prisma operations in a try/catch that reconnects on connection errors. Alternatively, use `$disconnect()` and `$connect()` to reset the connection.
3. Set `connection_limit=1` in the DATABASE_URL for serverless deployments: `?connection_limit=1&pool_timeout=10`.
4. Add a health check endpoint (`/api/health`) that runs a simple Prisma query (`prisma.$queryRaw\`SELECT 1\``) to verify database connectivity. Monitor this endpoint.
5. Consider using Prisma Accelerate or Neon's serverless driver (`@neondatabase/serverless`) for the Vercel edge runtime to avoid connection pooling issues entirely.

**References:**
- [Prisma + Neon documentation](https://www.prisma.io/docs/orm/overview/databases/neon)
- [Neon connection latency docs](https://neon.com/docs/connect/connection-latency)

---

## P6. On-Chain and Off-Chain Order State Diverge

**Severity:** MEDIUM-HIGH
**Phase:** Worker indexer + API routes + frontend

**The Pitfall:**
The system has two sources of truth for order state: the CaliberMarket contract (on-chain `MintOrder` / `RedeemOrder` structs) and the Prisma `Order` table (off-chain). These can diverge in several ways:

- **Worker misses an event** (see P1) -- on-chain order exists, DB row does not.
- **Admin finalizes an order but DB update fails** -- on-chain status is `Finalized`, DB status is still `PENDING`.
- **User's transaction reverts after the frontend optimistically writes to DB** -- DB row exists with txHash, but on-chain order does not.
- **Chain reorganization** (rare on Avalanche, but possible on Fuji) -- event is processed, DB updated, then the block is reverted. The order disappears on-chain but persists in DB.

The frontend currently plans to read order state from the API (which queries DB), but users may also check the block explorer. Discrepancies erode trust.

**Warning Signs:**
- Portfolio page shows an order as "Pending" but block explorer shows it as finalized
- Admin dashboard shows a different order count than on-chain `nextOrderId`
- User sees "Order not found" in the API but can verify on-chain that their `startMint` succeeded
- DB has orders with `status: COMPLETED` but no corresponding `MintFinalized` event on-chain

**Prevention Strategy:**
1. Treat on-chain state as the canonical source of truth. The DB is a read-optimized cache.
2. Add a reconciliation job (cron or manual admin button) that reads all orders from each CaliberMarket contract (iterating `mintOrders(1..nextOrderId)` and `redeemOrders(1..nextOrderId)`) and compares against DB state. Flag and auto-fix discrepancies.
3. When the worker indexes a `MintFinalized` or `RedeemFinalized` event, upsert the order (create if missing, update if exists). Do not assume the `MintStarted` event was processed first.
4. Add `onChainOrderId` (uint256) and `onChainStatus` fields to the Prisma `Order` model. Store the contract's order ID and status alongside the DB status.
5. Wait for at least 2 block confirmations before writing finalized state to DB to minimize reorg risk.

---

## P7. wagmi SSR Hydration Mismatch in Next.js 15

**Severity:** MEDIUM
**Phase:** Frontend wagmi wiring

**The Pitfall:**
The wagmi config (`apps/web/lib/wagmi.ts`) sets `ssr: true`, and the Providers component (`apps/web/app/providers.tsx`) wraps the app in `WagmiProvider`. However, Next.js 15's App Router aggressively server-renders components. Wallet-dependent hooks like `useAccount`, `useBalance`, and `useReadContract` return different values on server (no wallet) vs. client (wallet connected), causing React hydration mismatches.

The current mint/redeem flow components are marked `"use client"`, which helps, but any server component that imports data dependent on wallet state (e.g., portfolio page showing user balances) will hit this issue.

Additionally, the `QueryClient` is created as a module-level singleton (providers.tsx line 8). In Next.js 15, this can leak state between server-side renders of different requests if the app is deployed on a shared server (not a concern on Vercel's serverless, but relevant for development).

**Warning Signs:**
- Console warnings: "Text content does not match server-rendered HTML"
- Wallet connection state flickers on page load (shows disconnected then connected)
- Balance reads show "0" briefly before populating
- React Query cache shows stale data from a previous user's session

**Prevention Strategy:**
1. Never read wallet-dependent data in server components. Use `"use client"` boundary for any component that calls `useAccount`, `useBalance`, `useReadContract`, etc.
2. Create the `QueryClient` inside the Providers component (not at module level) or use a factory pattern with `useState`:
   ```tsx
   const [queryClient] = useState(() => new QueryClient());
   ```
3. Use wagmi's `useAccount` with an initial `status: "disconnected"` and only render wallet-dependent UI after hydration completes.
4. For the portfolio and admin pages, use a loading skeleton that shows while wallet state resolves. Do not SSR these pages with wallet data.

---

## P8. CaliberMarket Addresses Are Dynamic -- Config Cannot Be Hardcoded

**Severity:** MEDIUM
**Phase:** Contract deployment + frontend + worker wiring

**The Pitfall:**
The current shared config (`packages/shared/src/config/index.ts`) hardcodes individual token addresses (`ammoToken9MM`, `ammoToken556`, etc.). But the actual architecture uses `AmmoFactory.createCaliber()` to deploy CaliberMarket contracts, each of which creates its own AmmoToken. The addresses are not known until deployment.

Furthermore, the config structure conflates AmmoToken addresses with CaliberMarket addresses. The frontend needs CaliberMarket addresses (to call `startMint`), the worker needs CaliberMarket addresses (to watch events), and both need AmmoToken addresses (to read balances). The current config only stores token addresses.

If a new caliber is added post-deployment, or if contracts are redeployed on Fuji for bug fixes, every consumer must be updated. Manual address management is the #1 source of integration bugs in DeFi projects.

**Warning Signs:**
- Frontend calls `startMint` on the wrong address (gets "execution reverted" with no helpful error)
- Worker watches the AmmoToken address instead of the CaliberMarket address for events
- After redeployment, some parts of the system use old addresses while others use new ones
- New caliber added via `createCaliber` but not reflected in frontend

**Prevention Strategy:**
1. Restructure the config to store: `AmmoManager`, `AmmoFactory`, and per-caliber entries with both `market` and `token` addresses:
   ```ts
   export const CONTRACTS = {
     fuji: {
       ammoManager: "0x...",
       ammoFactory: "0x...",
       calibers: {
         "9MM": { market: "0x...", token: "0x..." },
         "556": { market: "0x...", token: "0x..." },
         // ...
       },
     },
   } as const;
   ```
2. Write a post-deployment script that reads addresses from Foundry's broadcast artifacts and updates the config file automatically.
3. Add a runtime discovery fallback: the worker can call `ammoFactory.calibers(caliberId)` to get the market+token address pair. Cache this on startup.
4. For the frontend, consider reading caliber addresses from the factory contract on page load (single multicall) rather than relying on hardcoded config. This makes the frontend resilient to redeployments.

---

## P9. Deadline Field Misuse Leads to Stuck or Prematurely Expired Orders

**Severity:** MEDIUM
**Phase:** Frontend mint/redeem wiring

**The Pitfall:**
CaliberMarket's `startMint` and `startRedeem` accept a `uint64 deadline` parameter. If `deadline != 0 && block.timestamp > deadline`, finalization reverts with `DeadlineExpired` (lines 209, 249). The frontend must set this correctly:

- **Deadline too short:** If the frontend sets a 30-minute deadline, but the admin (human-in-the-loop) takes 24-48 hours to finalize, every order will expire. The keeper will have to `refundMint` every order.
- **Deadline = 0 means no deadline:** This is a valid choice but means orders can sit indefinitely in `Started` state if the keeper never acts. Users have no recourse except hoping for a refund.
- **Block timestamp vs. JavaScript Date:** `block.timestamp` is in seconds. If the frontend computes deadline using `Date.now()` (milliseconds) and forgets to divide by 1000, the deadline will be in the year 52000+.
- **Fuji block timestamps:** Fuji's block times are ~2 seconds, but timestamps can drift from wall clock time.

**Warning Signs:**
- Admin clicks "Finalize" and gets `DeadlineExpired` revert on orders that were submitted recently
- All orders have `deadline: 0` (no protection for users) or `deadline: Date.now()` (already expired)
- Deadline values in the database look like millisecond timestamps (13 digits) instead of seconds (10 digits)

**Prevention Strategy:**
1. For the MVP with human-in-the-loop finalization, set deadline to `Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60)` (7 days from now). This gives the admin ample time while still protecting users.
2. Display the deadline as a human-readable date in both the user's portfolio and the admin order queue.
3. Add a unit test that verifies the frontend's deadline computation produces a valid `uint64` in seconds.
4. In the admin dashboard, sort pending orders by deadline (soonest first) and highlight orders expiring within 24 hours.

---

## P10. Mock Data Leaks Into Production Code Paths

**Severity:** MEDIUM
**Phase:** DB integration and mock data replacement

**The Pitfall:**
The entire frontend currently runs on mock data (`apps/web/lib/mock-data.ts` imported in mint-flow.tsx line 22, redeem-flow.tsx line 29, and likely many other components). The mock data includes hardcoded prices, fake user balances, and simulated transaction delays (`setTimeout`). When wiring real contract calls and API routes, developers often:

- Leave mock fallbacks that silently activate when the API fails, masking real bugs
- Forget to replace `caliberDetails[caliberId].price` (mock) with on-chain oracle data
- Keep `setTimeout` delays alongside real `useWaitForTransactionReceipt` calls, causing double-loading states
- Ship mock `userUsdcBalance` / `userTokenBalance` to production, showing fake balances

The mint flow (line 1057: `Math.random() > 0.2` for success) and redeem flow (line 1501: `Math.random() > 0.15`) simulate random failures. These MUST be fully removed.

**Warning Signs:**
- Users see non-zero balances without ever connecting a wallet
- Prices on the market page do not match on-chain oracle prices
- Transaction confirmations appear faster than block time (setTimeout artifacts)
- "Order submitted" UI appears before the transaction is actually mined

**Prevention Strategy:**
1. Create a `lib/mock-data.ts` barrel that exports ONLY when `process.env.NEXT_PUBLIC_USE_MOCKS === "true"`. Default to real data paths.
2. Add a lint rule or grep check in CI that flags imports of `mock-data` in non-test files.
3. Replace mock data incrementally per feature: first balances (useReadContract), then prices (API route from DB), then order state (API route), then transaction flows (useWriteContract).
4. Add a visible "TESTNET MODE" banner that shows when connected to Fuji (chainId 43113). This helps testers distinguish real vs. mock behavior.
5. Each component that currently uses mock data should have a `// TODO: Replace with real data` comment that can be grep-tracked.

---

## P11. Worker Process Crash Loses In-Flight Events With No Recovery

**Severity:** MEDIUM
**Phase:** Worker deployment on Railway

**The Pitfall:**
The worker (`apps/worker/src/index.ts`) is a single long-running Bun process on Railway. If it crashes (OOM, unhandled promise rejection, Railway restart), any events that were received but not yet persisted to the database are lost. There is no event queue, no dead-letter mechanism, and no WAL (write-ahead log).

Additionally, Railway free tier restarts containers periodically. The worker has no graceful shutdown handler. On restart, it will start watching from "latest" block, missing all events that occurred during downtime.

The combination of this pitfall with P1 (silent watcher death) means there are two independent failure modes that both result in missed events.

**Warning Signs:**
- Railway dashboard shows the worker restarted but the DB has a gap in order timestamps
- Worker logs show "Starting Ammo Exchange event listener..." repeatedly (restart loop) with no events in between
- Orders appear on-chain that have no corresponding DB entry

**Prevention Strategy:**
1. Store `lastProcessedBlock` per CaliberMarket in the database. On startup, query this value and start indexing from `lastProcessedBlock + 1` using `getContractEvents` (getLogs), not `watchContractEvent`.
2. Process events in a transaction: read events, write to DB, update `lastProcessedBlock` -- all in one Prisma `$transaction`. If the write fails, the block number is not advanced and events will be reprocessed on next iteration.
3. Add a `process.on("SIGTERM")` handler that logs the current block number and cleanly disconnects from the database.
4. Run the polling loop with a 5-second interval. This is fast enough for user experience (orders take 24-48 hours) and resilient to momentary RPC failures.
5. Add Railway health check endpoint (HTTP server on a secondary port) that returns 200 if the last poll succeeded within 30 seconds.

---

## P12. Admin Dashboard Auth Is UX-Only -- Keeper Contract Auth Is the Real Gate

**Severity:** MEDIUM
**Phase:** Admin dashboard implementation

**The Pitfall:**
The architecture decision states: "Admin auth = wallet address check. Contract already reverts for non-keepers. Middleware is UX, not security." This is correct for on-chain security, but creates a UX trap:

- If the admin connects a non-keeper wallet, the dashboard loads fine but every "Finalize" button will produce a confusing `NotKeeper` revert error. The error is only visible after the user submits the transaction and it fails.
- If `AmmoManager.setKeeper(adminAddress, false)` is called (removing keeper status), the admin dashboard still loads and shows the order queue. The admin discovers they lost access only when they try to finalize.
- Multiple admins could see the same pending order and both try to finalize it. The second transaction reverts with `InvalidStatus` (order already finalized).

**Warning Signs:**
- Admin sees orders but every finalization attempt reverts
- Two admins finalize the same order; one gets a confusing "InvalidStatus" error
- Admin changes their wallet in MetaMask without realizing the new wallet is not a keeper

**Prevention Strategy:**
1. On admin page load, call `ammoManager.isKeeper(connectedAddress)` and display a clear error banner if false. Do not show the order queue to non-keepers.
2. On the order detail page, check `mintOrders(orderId).status` on-chain before showing the "Finalize" button. If status is not `Started`, gray out the button and show "Already processed."
3. Consider adding optimistic locking: when an admin clicks "Finalize", immediately update the DB order status to `PROCESSING`. Other admins see this and know the order is being handled. If the transaction fails, revert the DB status.
4. Show the connected wallet address and keeper status prominently in the admin header.

---

## P13. ABI Export Pipeline Breaks Silently After Contract Changes

**Severity:** MEDIUM
**Phase:** Contract development iteration on Fuji

**The Pitfall:**
The build dependency graph is: `forge build` (compiles .sol to `out/`) -> `export-abis.ts` (reads JSON artifacts, writes TypeScript) -> frontend/worker import ABIs. If a developer modifies a Solidity contract (e.g., adds a new event or changes a function signature) but forgets to run `pnpm contracts:build`, the TypeScript ABIs become stale.

viem's type inference from `as const` ABIs means the TypeScript compiler will NOT catch the mismatch -- it will happily encode/decode based on the old ABI. The error only manifests at runtime as a cryptic "execution reverted" or decoded garbage data.

The `export-abis.ts` script (line 23) silently skips contracts whose artifacts are not found, printing only a `console.warn`. This means if the `out/` directory is stale or missing, the ABIs remain unchanged and no error is thrown.

**Warning Signs:**
- New event added to CaliberMarket but worker never receives it (ABI filter does not include the new event)
- Function call reverts on-chain but works in Foundry tests (ABI signature mismatch)
- `export-abis.ts` prints warnings that are buried in CI output
- Frontend type-checks pass but transactions revert at runtime

**Prevention Strategy:**
1. Add `contracts:build` as a dependency of `dev` and `build` in turbo.json. This already exists (`^build` in dependsOn), but verify it triggers `forge build` AND `export-abis.ts` in sequence.
2. Make `export-abis.ts` exit with code 1 if any artifact is missing (change `console.warn` + `continue` to `console.error` + `process.exit(1)`).
3. Add a CI step that runs `forge build && tsx scripts/export-abis.ts && pnpm check` to verify ABIs and types are in sync.
4. After any `.sol` file change, always run `pnpm contracts:build` before testing the frontend. Add this to the CLAUDE.md development workflow.

---

## P14. USDC Decimal Scaling Error in Price Display vs. Contract Math

**Severity:** MEDIUM
**Phase:** Frontend price display + contract interaction

**The Pitfall:**
USDC on Avalanche has 6 decimals. AmmoToken has 18 decimals. CaliberMarket uses a scaling formula: `uint256 scale = 10 ** (18 - usdcDecimals)` (line 156). The price oracle returns prices in 18-decimal fixed-point (`actualPriceX18`).

The frontend must handle three different decimal scales:
1. USDC amounts: 6 decimals (1 USDC = 1_000_000 units)
2. AmmoToken amounts: 18 decimals (1 token = 1e18 units)
3. Oracle prices: 18-decimal fixed-point (e.g., $0.30/round = 300000000000000000)

The current mock UI uses floating-point JavaScript numbers (`Number.parseFloat(usdcAmount)`, mint-flow.tsx line 257). When wiring real contract calls, you must convert to BigInt with correct scaling. A common mistake is:
- Passing `100` (meaning $100 USDC) directly to `startMint` instead of `100_000_000n` (100 * 1e6)
- Displaying token amounts as raw BigInt without dividing by 1e18
- Mixing up "price per round in USD" (human-readable) with "price per round in 1e18 wei" (contract format)

**Warning Signs:**
- User enters $100 USDC but the contract receives $0.0001 USDC (or $100 trillion USDC)
- Token balance shows as "1000000000000000000" instead of "1.0"
- Price chart shows numbers that are 10^12x too large or too small
- `parseUnits` / `formatUnits` used with wrong decimal parameter

**Prevention Strategy:**
1. Use viem's `parseUnits(amount, 6)` for USDC and `parseUnits(amount, 18)` for AmmoToken amounts. Never do manual BigInt multiplication.
2. Use `formatUnits(bigintValue, 6)` for displaying USDC and `formatUnits(bigintValue, 18)` for tokens.
3. Create shared utility functions in `packages/shared`: `toUsdcUnits(dollarAmount: string)`, `fromUsdcUnits(rawAmount: bigint)`, `toTokenUnits(roundCount: string)`, `fromTokenUnits(rawAmount: bigint)`.
4. Add unit tests for these conversion functions with edge cases: max uint256, zero, fractional amounts, amounts that lose precision.

---

## P15. Fuji Public RPC Rate Limiting Breaks Development Workflow

**Severity:** LOW-MEDIUM
**Phase:** Development and testing on Fuji

**The Pitfall:**
The wagmi config (`apps/web/lib/wagmi.ts`) uses `http()` with no custom RPC URL for both Avalanche mainnet and Fuji. This defaults to the public RPC endpoints. Public Fuji RPC (`https://api.avax-test.network/ext/bc/C/rpc`) has aggressive rate limiting. When the frontend makes multiple `useReadContract` calls on page load (balance checks, order status, market prices), it can hit the rate limit and return errors.

The worker also uses `http()` without a custom URL. If both the frontend (via Vercel) and the worker (via Railway) are hitting the same public endpoint, they compete for rate limit quota.

Additionally, React Query's default `refetchInterval` behavior combined with wagmi's auto-refresh on block changes can create a firehose of RPC requests on a single page.

**Warning Signs:**
- Console shows "429 Too Many Requests" errors from the RPC endpoint
- Balance reads return undefined intermittently
- Worker logs show "request failed" errors during high frontend activity
- Page load takes 5+ seconds due to sequential failed RPC retries

**Prevention Strategy:**
1. Use a dedicated RPC provider for Fuji (QuickNode, Alchemy, or Infura all offer free Avalanche Fuji endpoints). Set the URL via `FUJI_RPC_URL` env var.
2. Configure separate RPC URLs for frontend and worker to avoid shared rate limits.
3. Use wagmi's `multicall` batching (enabled by default in wagmi v2) to combine multiple `useReadContract` calls into a single RPC request.
4. Set explicit `refetchInterval` on React Query hooks: 30 seconds for balances, 60 seconds for market data. Do not use wagmi's `watchBlockNumber` for frontend data refresh -- it creates too many requests.

---

## Summary: Pitfall Priority by Phase

| Phase | Pitfalls | Action |
|-------|----------|--------|
| **Contract Deployment (Fuji)** | P3 (USDC decimals), P4 (treasury not set), P8 (address config) | Deploy script must handle all setup atomically |
| **Worker Event Indexer** | P1 (silent death), P6 (state divergence), P11 (crash recovery) | Use getLogs polling with persistent block cursor, not watchContractEvent |
| **Frontend Wagmi Wiring** | P2 (approval UX), P7 (SSR hydration), P9 (deadline), P10 (mock data), P14 (decimals) | Replace mocks incrementally; use parseUnits/formatUnits everywhere |
| **Admin Dashboard** | P4 (gas/nonce), P12 (auth UX), P13 (ABI staleness) | Check keeper status on load; add gas overrides; keep ABIs in sync |
| **Infrastructure** | P5 (Prisma pooling), P15 (RPC rate limits) | Pooled connection string for Vercel; dedicated RPC endpoint |

---

*Pitfalls analysis: 2026-02-10*
