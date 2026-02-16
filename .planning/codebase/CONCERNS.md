# Codebase Concerns

**Analysis Date:** 2026-02-10

## Critical Issues (Recently Fixed)

### Treasury Flow — USDC Trapped Without Forwarding

**Status:** Fixed in commit `63714d1`

**Issue:** In `CaliberMarket.sol`, USDC received from `startMint()` was held in the contract but not forwarded to treasury during `finalizeMint()`. Only the fee was sent to `feeRecipient`, while the net USDC remained in the contract indefinitely.

**Files:** `packages/contracts/src/CaliberMarket.sol` (lines 214–228)

**Impact:** HIGH - Core protocol flow broken. User funds would be inaccessible. Tests: `testFinalizeMintForwardsNetUsdcToTreasury`, `testFinalizeMintRevertsWhenTreasuryNotSet` now verify correct behavior.

**Fix applied:**

- Line 212: Added `address treasury = manager.treasury()` lookup with `TreasuryNotSet` revert
- Line 228: Added `_safeTransfer(usdc, treasury, netUsdc)` to forward net proceeds
- Treasury must be set before processing mints

---

### Fee/Config Snapshot — Retroactive Configuration Changes

**Status:** Fixed in commit `63714d1`

**Issue:** Fee percentages (`mintFeeBps`, `redeemFeeBps`) and minimum mint rounds (`minMintRounds`) were retrieved from contract state at finalization time, not at order creation. If admin changed fees after a user initiated an order, the new fees would apply retroactively to that user's order.

**Files:**

- `packages/contracts/src/CaliberMarket.sol` (lines 154, 169, 192, 214–217, 251–252)
- Tests: `testFinalizeMintUsesSnapshotFee`, `testFinalizeRedeemUsesSnapshotFee`

**Impact:** MEDIUM - Users could have fees increased unexpectedly, or minimum mint requirements raised after they started an order. Breaks user trust and could be used as griefing vector.

**Fix applied:**

- Fees now snapshot at order creation: `feeBps: mintFeeBps` (line 168) and `feeBps: redeemFeeBps` (line 192)
- Min mint rounds snapshot at mint start: `minMintAtStart: minMintRounds` (line 169)
- Finalization reads from order struct, not live contract state

---

### Missing Pause Guards on Finalize/Cancel Operations

**Status:** Fixed in commit `63714d1`

**Issue:** `finalizeMint()` and `finalizeRedeem()` lacked `whenNotPaused` modifiers. If the market was paused (emergency mode), keepers could still finalize orders, bypassing the pause mechanism. Intended behavior: pause should allow refund/cancel but block new user-initiated operations.

**Files:** `packages/contracts/src/CaliberMarket.sol` (lines 204, 246)

**Impact:** MEDIUM - Emergency pause would not fully halt the market. Inconsistent protection between user operations and keeper operations.

**Fix applied:**

- Added `whenNotPaused` to `finalizeMint()` (line 204)
- Added `whenNotPaused` to `finalizeRedeem()` (line 246)
- `refundMint()` and `cancelRedeem()` intentionally remain unpaused to allow recovery

---

## Known Gaps & Future Work

### Event Listener (Worker) Not Implemented

**Issue:** The worker app (`apps/worker/src/index.ts`) is a skeleton. Event listening for contract events is commented out.

**Files:** `apps/worker/src/index.ts` (lines 18–29)

**Impact:** MEDIUM - Without event listeners, the backend cannot:

- Detect when users initiate `startMint()` or `startRedeem()` orders
- Trigger off-chain fulfillment workflows (purchase ammo, verify KYC, ship orders)
- Update database state based on on-chain events

The system currently depends on manual keeper action. Automation is blocked.

**What's needed:**

```typescript
// TODO: Implement watchContractEvent for all caliber markets
// Listen to CaliberMarket.MintStarted → trigger procurement workflow
// Listen to CaliberMarket.RedeemRequested → trigger KYC + shipping workflow
// Update Order records in database (packages/db/prisma/schema.prisma)
```

**Priority:** HIGH - Blocks production launch. Cannot scale without automation.

---

### Frontend Has Zero Test Coverage

**Issue:** The web app (`apps/web`) contains 94 TypeScript/TSX files with zero unit tests (.test.ts/.spec.ts files not present).

**Files:** `apps/web/app/`, `apps/web/features/` (all untested)

**Impact:** MEDIUM - High risk for regressions in user-facing flows:

- Mint/redeem UX flows (connect wallet → approve USDC → submit order)
- Order status tracking and deadline UI
- Market data display (prices, 24h changes)
- Error handling and user feedback

**Components at risk:**

- `apps/web/features/mint/mint-flow.tsx` — No tests for USDC approval, order submission
- `apps/web/features/trade/swap-widget.tsx` — No tests for DEX integration
- `apps/web/app/portfolio/orders/[id]/page.tsx` — No tests for order polling and status display

**Priority:** MEDIUM - Mitigated by test coverage on contracts. Frontend is less critical for launch but should be addressed before scaling to real users.

---

### Incomplete KYC/Redemption Flow

**Issue:** The database schema defines `KycStatus` (enum with PENDING, APPROVED, REJECTED) but the redemption flow does not enforce it.

**Files:**

- `packages/db/prisma/schema.prisma` (lines 12–17)
- `apps/web/app/redeem/page.tsx` (basic UI, no KYC integration)

**Impact:** MEDIUM - Federal law requires age verification (21+ for handgun ammo, 18+ for rifle/shotgun) before redemption and shipping. Current system has no checks.

**What's missing:**

- No KYC provider integration (Veriff, Jumio, Persona, etc.)
- No enforcement of `KycStatus.APPROVED` in `finalizeRedeem()` caller
- No shipment address validation before keeper calls `finalizeRedeem()`

**Priority:** HIGH - Legal requirement before production. Redemptions cannot proceed without this.

---

### Price Oracle Lacks Safeguards

**Issue:** The `IPriceOracle` interface is minimal, and the price feed mechanism is not specified.

**Files:**

- `packages/contracts/src/IPriceOracle.sol` (10 lines, no implementation)
- `packages/contracts/src/CaliberMarket.sol` (lines 151, 205)

**Impact:** MEDIUM-HIGH - Price feeds are critical to token valuation:

- `startMint()` queries oracle for slippage baseline (line 151)
- `finalizeMint()` accepts keeper-provided price with no oracle cross-check (line 205)
- If oracle is manipulated, mints could occur at unfavorable prices
- If oracle is down, mints are blocked entirely

**Current behavior:**

- `startMint()` reads oracle price and stores as snapshot (good)
- `finalizeMint()` accepts keeper-supplied `actualPriceX18` without oracle verification
  - Keeper could mint at inflated prices if not monitored
  - No bounds checking: keeper could claim absurd prices (1e27 wei/round)

**Gaps:**

1. No oracle implementation provided (MockPriceOracle is test-only)
2. No price bounds in `finalizeMint()` (e.g., max deviation from `requestPrice`)
3. Keeper has sole discretion over final price — single point of trust

**Priority:** HIGH - Before mainnet deployment:

- Integrate real oracle (Chainlink, Pyth, custom feed)
- Add `finalizeMint()` bounds check: revert if `actualPriceX18` deviates >X% from `requestPrice`
- Consider multi-sig keeper approval for large deviations

---

### Warehouse/Proof of Reserves Not Implemented

**Issue:** The whitepaper (section 4.3) promises monthly attestations and transparent proof of reserves, but no mechanism exists on-chain or in the database to track inventory.

**Files:**

- `packages/db/prisma/schema.prisma` (lines 86–91) — `Inventory` model defined but unused
- `apps/worker/src/index.ts` — No inventory sync logic
- No smart contract function to query total rounds per caliber vs. circulating supply

**Impact:** MEDIUM - Users cannot verify the protocol is actually backed 1:1 by physical ammo. This breaks a core promise.

**What's missing:**

- Off-chain warehouse audit ingestion (how does attestation data get into the system?)
- On-chain way to query: "Are there more tokens minted than rounds in storage?" (Transparency fails)
- No automated audit trail (when was inventory last verified?)

**Priority:** MEDIUM - Needed for trustworthiness, but doesn't block core functionality. Can be added in Phase 2.

---

### No Rate Limiting or DOS Protections on User Functions

**Issue:** `startMint()` and `startRedeem()` have no rate limiting. A user can submit unlimited orders in a single block or transaction.

**Files:**

- `packages/contracts/src/CaliberMarket.sol` (lines 142–177, 179–200)

**Impact:** LOW-MEDIUM - Denial of service / order spam:

- User could submit 1000 pending orders
- Keeper would have to manually refund each one
- Order ID counter (`nextOrderId`) could overflow (though uint256 is astronomically large)
- No economic disincentive

**Possible mitigations:**

- Enforce minimum order size (already exists: `minMintRounds`)
- Add per-user pending order limit
- Require order fee deposit (front-end or contract-level)

**Priority:** LOW - Not critical for MVP. Add if order spam observed in production.

---

### Guardian Role Incomplete

**Issue:** Guardian is defined in `AmmoManager` and can call `pause()`, but has no other special powers.

**Files:**

- `packages/contracts/src/AmmoManager.sol` (line 10)
- `packages/contracts/src/CaliberMarket.sol` (line 300)

**Current behavior:**

```solidity
function pause() external {
    if (!manager.isOwner(msg.sender) && msg.sender != manager.guardian()) revert NotOwner();
    paused = true;
}
```

**Gap:** Guardian can pause but cannot unpause (only owner can). Also, guardian has no other admin functions. Role is under-utilized.

**Priority:** LOW - Works as designed for emergency pause by a trusted party. Clarify intended role in governance docs.

---

### Hardcoded Caliber Specs vs. Dynamic Catalog

**Issue:** Supported calibers and specs are hardcoded in the whitepaper and database enum, not on-chain.

**Files:**

- `packages/db/prisma/schema.prisma` (lines 32–37) — `enum Caliber` has 4 hardcoded values
- `packages/contracts/src/AmmoFactory.sol` — No registry of caliber specs

**Impact:** MEDIUM - Adding new calibers requires:

1. Database migration
2. Smart contract redeployment (caliber specs not stored on-chain)
3. Warehouse coordination (new SKU specs, inventory tracking)

**Ideal state:** Calibers and specs should be on-chain data in `AmmoManager`, allowing owner to add new calibers without redeploying `CaliberMarket` templates.

**Priority:** LOW - Fine for MVP with 4 fixed calibers. Refactor for extensibility in Phase 2.

---

### No Explicit Reentrancy Risk, But Pattern Could Be Cleaner

**Issue:** Reentrancy guard (`_locked`) is implemented, which is good. However, the pattern is manual.

**Files:** `packages/contracts/src/CaliberMarket.sol` (lines 85, 105–110)

**Status:** Safe as implemented. But modern best practice is `ReentrancyGuard` from OpenZeppelin.

**Improvement:** Consider using `@openzeppelin/contracts/security/ReentrancyGuard.sol` for clarity and reduced code size.

**Priority:** LOW - Current implementation is solid and well-tested. Not blocking.

---

## Tech Debt

### TypeScript Strict Mode Not Enforced Uniformly

**Issue:** `tsconfig.json` at root should enforce `strict: true`, but per-package configuration might override.

**Files:** `tsconfig.json`, `packages/*/tsconfig.json`

**Impact:** LOW - Type safety could degrade if a package loosens checks. Check for consistency.

**Recommendation:** Audit each package's `tsconfig.json` to ensure `strict: true` and no `@ts-ignore` comments.

---

### Shared Package Ships Raw TypeScript

**Issue:** `packages/shared` has no build step — consumers transpile it directly. Works but adds dependency on each consumer's TypeScript setup.

**Files:** `packages/shared/package.json`, `packages/shared/tsconfig.json`

**Impact:** LOW - If a consumer doesn't use TypeScript, imports will fail. Fine for internal monorepo, but limits external reuse.

**Current approach:** Acceptable for MVP. Refactor to pre-compiled output in Phase 2 if others adopt the protocol.

---

### Database Schema Unused Fields

**Issue:** `Order.chainId` is stored but never used to validate orders came from Avalanche.

**Files:** `packages/db/prisma/schema.prisma` (line 61)

**Impact:** LOW - Cross-chain spoofing not a real risk yet, but add validation later.

---

## Security Considerations

### Contract Upgrade Path Not Specified

**Issue:** Whitepaper (section 3.2) mentions upgradeable proxies but no actual proxy contracts are deployed.

**Files:** `packages/contracts/src/` — no proxy contracts present

**Current state:** Contracts are non-upgradeable. This is actually safer for launch.

**Future:** Whitepaper promises upgradeable contracts. Implementation deferred until needed. Track as future tech debt.

**Priority:** MEDIUM - Needed before major changes or if bugs are found post-launch.

---

## Performance Concerns

### No Batch Operations for Keeper

**Issue:** Keeper must call `finalizeMint()` / `refundMint()` once per order. No batch function.

**Files:** `packages/contracts/src/CaliberMarket.sol` (lines 204, 234, 246, 265)

**Impact:** LOW - Gas cost scales linearly with number of orders. If 1000 mints are pending, keeper needs 1000 transactions.

**Improvement:** Add `batchFinalizeMint(uint256[] orderId, uint256[] prices)` to reduce tx count.

**Priority:** LOW - Optimize only if keeper operations become bottleneck in production.

---

## Remaining Gaps for Production

1. **Event listener automation** — Worker must listen to contracts and trigger fulfillment
2. **KYC integration** — Redemption requires age verification before shipment
3. **Warehouse audit integration** — Proof of reserves reporting
4. **Price oracle implementation** — Real feed (Chainlink, Pyth, or custom)
5. **Frontend testing** — 94 files with zero test coverage
6. **Load testing** — No data on how many concurrent orders the system can handle

---

_Concerns audit: 2026-02-10_
