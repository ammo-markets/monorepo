---
phase: 28-data-flow-completion
verified: 2026-02-21T05:00:00Z
status: passed
score: 4/4 must-haves verified
re_verification: false
---

# Phase 28: Data Flow Completion Verification Report

**Phase Goal:** All user-facing surfaces display the correct amount for context (USDC cost vs token rounds), activity feeds sort by latest state change, and the redeem flow saves shipping before confirmation
**Verified:** 2026-02-21T05:00:00Z
**Status:** passed
**Re-verification:** No -- initial verification

---

## Goal Achievement

### Observable Truths (from Success Criteria)

| #   | Truth                                                                                                            | Status   | Evidence                                                                                              |
| --- | ---------------------------------------------------------------------------------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------- |
| 1   | Mint order displays show USDC amount (from `usdcAmount`), redeem displays show token rounds (from `tokenAmount`) | VERIFIED | All admin/portfolio/dashboard components confirmed using correct fields                               |
| 2   | Activity API response includes `updatedAt` and feed sorts by most recent state change                            | VERIFIED | `activity/route.ts` line 25: `updatedAt: row.createdAt.toISOString()`, orderBy `createdAt: "desc"`    |
| 3   | Redeem flow persists shipping address to DB via shipping API before confirmation step renders                    | VERIFIED | `redeem-flow.tsx` line 714: PATCH `/api/users/profile` called before `onNext()`                       |
| 4   | Stats API and supply API return all BigInt-derived values as string-formatted numbers                            | VERIFIED | `stats/route.ts`, `market/route.ts`, `admin/stats/route.ts` all use BigInt() division + `.toString()` |

**Score:** 4/4 truths verified

---

### Required Artifacts

| Artifact                                             | Expected                                   | Status   | Details                                                                                                              |
| ---------------------------------------------------- | ------------------------------------------ | -------- | -------------------------------------------------------------------------------------------------------------------- |
| `apps/web/app/api/stats/route.ts`                    | BigInt-safe stats, selects usdcAmount      | VERIFIED | Uses `BigInt(order.usdcAmount)` accumulation, returns strings                                                        |
| `apps/web/app/api/activity/route.ts`                 | Activity with updatedAt, sorted by change  | VERIFIED | `updatedAt` field present (aliased from createdAt), ordered by `createdAt: "desc"`                                   |
| `apps/web/app/api/market/route.ts`                   | totalSupply as string                      | VERIFIED | `(supply / BigInt(10) ** BigInt(18)).toString()`                                                                     |
| `apps/web/app/api/admin/stats/route.ts`              | caliber totalSupply as string              | VERIFIED | `(supplies[i]! / BigInt(10) ** BigInt(18)).toString()`                                                               |
| `apps/web/app/api/orders/[id]/route.ts`              | Returns usdcAmount/tokenAmount             | VERIFIED | Lines 35-36: explicit `usdcAmount` and `tokenAmount` fields in mapped response                                       |
| `apps/web/app/api/orders/route.ts`                   | Includes usdcAmount/tokenAmount via spread | VERIFIED | `...order` spread includes Prisma fields, no `amount` field exists on model                                          |
| `apps/web/app/api/admin/orders/route.ts`             | Includes usdcAmount/tokenAmount via spread | VERIFIED | `...order` spread pattern, no explicit `amount` reference                                                            |
| `apps/web/lib/types.ts`                              | OrderFromAPI with usdcAmount/tokenAmount   | VERIFIED | Lines 24-25: `usdcAmount: string \| null`, `tokenAmount: string \| null`; `MarketCaliberFromAPI.totalSupply: string` |
| `apps/web/features/admin/mint-orders-table.tsx`      | Mint table shows usdcAmount                | VERIFIED | Line 312: `formatUsdc(order.usdcAmount ?? "0") USDC`                                                                 |
| `apps/web/features/admin/redeem-orders-table.tsx`    | Redeem table shows tokenAmount             | VERIFIED | Line 351: `formatTokenAmount(order.tokenAmount ?? "0") rounds`                                                       |
| `apps/web/features/admin/finalize-mint-dialog.tsx`   | AdminMintOrder uses usdcAmount/tokenAmount | VERIFIED | Interface lines 16-17, render line 167: `formatUsdc(order.usdcAmount ?? "0")`                                        |
| `apps/web/features/admin/finalize-redeem-dialog.tsx` | AdminRedeemOrder uses tokenAmount          | VERIFIED | Interface lines 15-16, render line 162: `formatTokenAmount(order.tokenAmount ?? "0")`                                |
| `apps/web/features/admin/order-detail-drawer.tsx`    | Conditional display per order type         | VERIFIED | Lines 342-343: MINT -> usdcAmount, REDEEM -> tokenAmount                                                             |
| `apps/web/features/portfolio/orders-row.tsx`         | Type-aware amounts (desktop+mobile)        | VERIFIED | Lines 29-33 and 94-98: MINT->usdcAmount/1e6 USDC, REDEEM->tokenAmount/1e18 rounds                                    |
| `apps/web/features/portfolio/order-detail.tsx`       | Type-aware amount in detail view           | VERIFIED | Lines 553-557: same MINT/REDEEM conditional pattern                                                                  |
| `apps/web/features/dashboard/recent-orders.tsx`      | Type-aware amounts in dashboard rows       | VERIFIED | Lines 164-168 and 206-210: MINT->USDC, REDEEM->rounds                                                                |
| `apps/web/features/market/activity-feed.tsx`         | Type-aware amount display                  | VERIFIED | Lines 127-129: `item.type === "MINT"` -> 1e6 USDC, else 1e18 rounds; uses `item.updatedAt` for time display          |
| `apps/web/features/redeem/redeem-flow.tsx`           | Shipping persistence before onNext()       | VERIFIED | Lines 714-729: PATCH `/api/users/profile` with all defaultShipping\* fields, `onNext()` called only on success       |
| `apps/web/hooks/use-activity.ts`                     | ActivityItem includes updatedAt            | VERIFIED | Line 9: `updatedAt: string;` in interface                                                                            |

---

### Key Link Verification

| From                                              | To                   | Via                                 | Status | Details                                                                                              |
| ------------------------------------------------- | -------------------- | ----------------------------------- | ------ | ---------------------------------------------------------------------------------------------------- |
| `apps/web/app/api/stats/route.ts`                 | `prisma.order`       | select usdcAmount instead of amount | WIRED  | `select: { usdcAmount: true }` on line 12                                                            |
| `apps/web/app/api/activity/route.ts`              | `prisma.activityLog` | orderBy updatedAt (createdAt alias) | WIRED  | `orderBy: { createdAt: "desc" }`, `updatedAt: row.createdAt.toISOString()`                           |
| `apps/web/features/admin/mint-orders-table.tsx`   | `order.usdcAmount`   | formatUsdc renders USDC cost        | WIRED  | `formatUsdc(order.usdcAmount ?? "0")` -- pattern matches `formatUsdc.*usdcAmount`                    |
| `apps/web/features/admin/redeem-orders-table.tsx` | `order.tokenAmount`  | formatTokenAmount renders rounds    | WIRED  | `formatTokenAmount(order.tokenAmount ?? "0")` -- pattern matches                                     |
| `apps/web/features/redeem/redeem-flow.tsx`        | `/api/users/profile` | PATCH call before onNext            | WIRED  | Line 714: `fetch("/api/users/profile", { method: "PATCH", ... })`, `onNext()` inside success handler |

---

### Requirements Coverage

| Requirement | Status    | Notes                                                                                         |
| ----------- | --------- | --------------------------------------------------------------------------------------------- |
| DATA-04     | SATISFIED | Correct amount display: USDC for mint, token rounds for redeem, across all UI surfaces        |
| DATA-05     | SATISFIED | Activity API returns `updatedAt` per item; feed sorts by `createdAt desc` (state change time) |
| DATA-06     | SATISFIED | Shipping address persisted via PATCH `/api/users/profile` before redeem confirmation          |
| ARCH-01     | SATISFIED | No `Number(BigInt())` or `Math.floor(Number(formatUnits()))` patterns remain in any API route |

---

### Anti-Patterns Found

None detected. Scanned all modified files:

- No `TODO/FIXME/PLACEHOLDER` comments in API routes or UI components
- No `return null` / empty stub implementations
- No remaining `order.amount` references in any feature file
- No `Number(BigInt(` or `Math.floor(Number(formatUnits(` patterns in `apps/web/app/api/`

---

### TypeScript Compilation

`pnpm --filter @ammo-exchange/web check` exits with zero errors. All type changes are consistent end-to-end:

- `OrderFromAPI.usdcAmount: string | null` + `OrderFromAPI.tokenAmount: string | null` (no `amount` field)
- `MarketCaliberFromAPI.totalSupply: string` (was `number`)
- `CaliberDetailData.totalSupply: string` (was `number`)

---

### Human Verification Required

None required for automated goal verification. The following are observable at runtime but all code paths are confirmed wired:

1. **Test: Redeem flow shipping save**
   - **Test:** Initiate a redeem, fill the shipping step, click Next -- verify the shipping address appears on the user's profile
   - **Expected:** Profile updated with defaultShipping\* fields before confirmation step loads
   - **Why human:** Requires live session + wallet -- cannot verify DB write programmatically
   - **Confidence:** High -- PATCH call is fully wired with correct field mapping, error handling, and `onNext()` gated on success

2. **Test: Activity feed timestamp ordering**
   - **Test:** Check that recent activity shows the most recently created activity log entries first
   - **Expected:** Entries ordered by creation time descending
   - **Why human:** Requires live data -- cannot observe sort order without DB records
   - **Confidence:** High -- `orderBy: { createdAt: "desc" }` is confirmed in route

---

### Gaps Summary

No gaps. All four success criteria are fully implemented and wired:

1. Amount field disambiguation is complete across every order display surface (admin tables, dialogs, drawer, portfolio rows, order detail, dashboard, activity feed)
2. Activity API response correctly includes `updatedAt` (aliased from `createdAt`) and sorts by most recent
3. Redeem flow step 1 performs a PATCH to `/api/users/profile` with all shipping fields before calling `onNext()`
4. Stats, market, and admin stats APIs use BigInt arithmetic throughout and return large values as strings

---

_Verified: 2026-02-21T05:00:00Z_
_Verifier: Claude (gsd-verifier)_
