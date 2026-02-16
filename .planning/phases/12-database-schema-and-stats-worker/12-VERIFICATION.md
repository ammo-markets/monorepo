---
phase: 12-database-schema-and-stats-worker
verified: 2026-02-15T22:30:00Z
status: passed
score: 7/7
re_verification: false
---

# Phase 12: Database Schema & Stats Worker Verification Report

**Phase Goal:** Protocol has enriched data layer with stats, activity tracking, and user preferences ready for UI consumption

**Verified:** 2026-02-15T22:30:00Z

**Status:** passed

**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| #   | Truth                                                                                                              | Status     | Evidence                                                                                                                                                                        |
| --- | ------------------------------------------------------------------------------------------------------------------ | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Stats worker recomputes per-caliber protocol stats every 15 minutes                                                | ✓ VERIFIED | STATS_INTERVAL_MS = 15 _ 60 _ 1000 in constants.ts, setInterval(computeStats, STATS_INTERVAL_MS) in index.ts                                                                    |
| 2   | Stats worker backfills ActivityLog from completed orders on first startup (when ActivityLog is empty)              | ✓ VERIFIED | backfillActivityLog() checks count, queries completed orders, uses createMany. Called before computeStats in worker startup                                                     |
| 3   | Public stats endpoint returns per-caliber minted/redeemed/netSupply without authentication                         | ✓ VERIFIED | GET /api/stats calls prisma.protocolStats.findMany(), maps to response with caliber/totalMinted/totalRedeemed/netSupply/userCount/computedAt. No auth check                     |
| 4   | Activity endpoint returns last 5 transaction records by default with structured data (no status field in response) | ✓ VERIFIED | GET /api/activity queries activityLog.findMany with limit (default 5, max 50). Response maps id/type/caliber/amount/txHash/walletAddress/createdAt. No status field in response |
| 5   | Worker event handlers write ActivityLog rows when orders complete (ongoing population)                             | ✓ VERIFIED | mint.ts:105 and redeem.ts:106 both call tx.activityLog.create() after order completion. Wrapped in try/catch                                                                    |
| 6   | Preferences endpoint allows authenticated users to GET and PUT favorite calibers                                   | ✓ VERIFIED | GET /api/user/preferences calls requireSession(), queries userPreference.findUnique. PUT validates with zod, calls userPreference.upsert                                        |
| 7   | Stale stats are served if computation fails                                                                        | ✓ VERIFIED | computeStats() catches errors, logs them, returns without throwing. Cron continues. ProtocolStats table retains last successful computation                                     |

**Score:** 7/7 truths verified

### Required Artifacts

| Artifact                                   | Expected                                      | Status     | Details                                                                                                         |
| ------------------------------------------ | --------------------------------------------- | ---------- | --------------------------------------------------------------------------------------------------------------- |
| apps/worker/src/stats.ts                   | Stats computation and activity backfill logic | ✓ VERIFIED | Exports backfillActivityLog and computeStats. 120 lines. Substantive implementation with DB queries and upserts |
| apps/web/app/api/stats/route.ts            | Public protocol stats endpoint                | ✓ VERIFIED | Exports GET handler. Queries protocolStats.findMany, maps to response. No auth                                  |
| apps/web/app/api/activity/route.ts         | Transaction activity endpoint                 | ✓ VERIFIED | Exports GET handler. Queries activityLog.findMany with limit param. No status field                             |
| apps/web/app/api/user/preferences/route.ts | User preferences CRUD                         | ✓ VERIFIED | Exports GET and PUT handlers. GET queries userPreference, PUT validates and upserts                             |
| apps/worker/src/handlers/mint.ts           | ActivityLog write on mint completion          | ✓ VERIFIED | Contains tx.activityLog.create at line 105 after order completion. No status field                              |
| apps/worker/src/handlers/redeem.ts         | ActivityLog write on redeem completion        | ✓ VERIFIED | Contains tx.activityLog.create at line 106 after order completion. No status field                              |

### Key Link Verification

| From                                       | To                       | Via                                                    | Status  | Details                                                                                                               |
| ------------------------------------------ | ------------------------ | ------------------------------------------------------ | ------- | --------------------------------------------------------------------------------------------------------------------- |
| apps/worker/src/stats.ts                   | prisma.protocolStats     | Prisma upsert in computeStats                          | ✓ WIRED | Line 95: await prisma.protocolStats.upsert({ where: { caliber }, create: {...}, update: {...} })                      |
| apps/worker/src/stats.ts                   | prisma.activityLog       | backfillActivityLog creates rows from completed orders | ✓ WIRED | Line 45: await prisma.activityLog.createMany({ data: orders.map(...) })                                               |
| apps/worker/src/index.ts                   | apps/worker/src/stats.ts | setInterval import and startup backfill call           | ✓ WIRED | Line 7: import { backfillActivityLog, computeStats }. Lines 53, 56, 57: calls backfill, computeStats, and setInterval |
| apps/worker/src/handlers/mint.ts           | prisma.activityLog       | create ActivityLog row on MintFinalized                | ✓ WIRED | Line 105: await tx.activityLog.create({ data: { type, caliber, amount, txHash, walletAddress } })                     |
| apps/worker/src/handlers/redeem.ts         | prisma.activityLog       | create ActivityLog row on RedeemFinalized              | ✓ WIRED | Line 106: await tx.activityLog.create({ data: { type, caliber, amount, txHash, walletAddress } })                     |
| apps/web/app/api/stats/route.ts            | prisma.protocolStats     | findMany query                                         | ✓ WIRED | Line 7: const rows = await prisma.protocolStats.findMany()                                                            |
| apps/web/app/api/user/preferences/route.ts | prisma.userPreference    | upsert on PUT                                          | ✓ WIRED | Line 79: const prefs = await prisma.userPreference.upsert({ where: { userId }, create: {...}, update: {...} })        |

### Requirements Coverage

| Requirement                                                        | Status      | Blocking Issue                                                                                                                                                                                                        |
| ------------------------------------------------------------------ | ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| DB-01: ProtocolStats table stores aggregate metrics                | ✓ SATISFIED | Schema has ProtocolStats model with caliber/totalMinted/totalRedeemed/netSupply/userCount/computedAt. Worker computes stats                                                                                           |
| DB-02: ActivityLog table stores human-readable transaction history | ✓ SATISFIED | Schema has ActivityLog model with type/caliber/amount/txHash/walletAddress/createdAt. No status field (final-state-only). Backfill + ongoing writes                                                                   |
| DB-03: UserPreference table stores favorite calibers               | ⚠️ PARTIAL  | Schema has UserPreference model with favoriteCalibers array. Requirement mentions "display settings and notification preferences" but only favoriteCalibers implemented. This aligns with Plan scope (favorites only) |
| DB-04: Worker job periodically computes and caches protocol stats  | ✓ SATISFIED | computeStats runs every 15 minutes, queries completed orders, upserts ProtocolStats rows                                                                                                                              |

**Note on DB-03:** Plan scope was "favorite calibers only" per user decision. Display settings and notification preferences were not in Plan must_haves. This is a requirements vs plan scope difference, not a gap in plan execution.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact                                                |
| ---- | ---- | ------- | -------- | ----------------------------------------------------- |
| None | -    | -       | -        | No TODOs, placeholders, or stub implementations found |

### Human Verification Required

#### 1. Stats Worker Startup Behavior

**Test:** Run worker with `pnpm --filter @ammo-exchange/worker dev` and observe console logs

**Expected:**

- `[backfill] ActivityLog already populated (N rows), skipping` OR `[backfill] Backfilled N completed orders into ActivityLog`
- `[stats] Computed protocol stats for 4 calibers`
- `[worker] Computing stats every 15 minutes`

**Why human:** Verifies the cron starts correctly and backfill logic works. Programmatic check can't observe runtime behavior without running the app.

#### 2. API Endpoint Response Structure

**Test:**

- `curl http://localhost:3000/api/stats` (public, no auth)
- `curl http://localhost:3000/api/activity` (public, no auth)
- `curl http://localhost:3000/api/activity?limit=10` (with limit param)
- `curl -H "Cookie: session=..." http://localhost:3000/api/user/preferences` (authenticated)

**Expected:**

- `/api/stats` returns `{ stats: [{ caliber, totalMinted, totalRedeemed, netSupply, userCount, computedAt }] }`
- `/api/activity` returns `{ activity: [{ id, type, caliber, amount, txHash, walletAddress, createdAt }] }` with 5 items by default
- `/api/activity?limit=10` returns up to 10 items
- `/api/user/preferences` returns `{ favoriteCalibers: [] }` for new users

**Why human:** Requires running the dev server and making HTTP requests. Can't verify runtime behavior programmatically.

#### 3. ActivityLog Write on Order Completion

**Test:** Trigger a mint or redeem transaction (testnet) and observe:

1. Worker logs `[mint] Created ActivityLog entry for mint {id}` or `[redeem] Created ActivityLog entry for redeem {id}`
2. Database has new ActivityLog row matching the order
3. ActivityLog row has no status field
4. If ActivityLog write fails, order still completes (check handler logs)

**Expected:** ActivityLog populated on every completed order. Failures logged but don't block order processing.

**Why human:** Requires end-to-end transaction flow with real blockchain events. Can't simulate programmatically.

---

## Summary

**All must-haves verified.** Phase goal achieved.

- ✓ ProtocolStats, ActivityLog, UserPreference models exist in schema
- ✓ Stats worker computes per-caliber aggregates every 15 minutes
- ✓ ActivityLog backfilled on startup and populated ongoing by handlers
- ✓ Public /api/stats endpoint serves protocol stats
- ✓ Public /api/activity endpoint serves transaction history (no status field)
- ✓ Authenticated /api/user/preferences endpoint serves favorite calibers
- ✓ All key links verified (worker → DB, handlers → ActivityLog, endpoints → DB)
- ✓ No anti-patterns found
- ✓ All commits verified

**Ready to proceed** with Phase 13 (API endpoints) and Phase 14-16 (UI consumption).

---

_Verified: 2026-02-15T22:30:00Z_
_Verifier: Claude (gsd-verifier)_
