---
phase: 27-data-model-migration
verified: 2026-02-21T04:30:00Z
status: passed
score: 10/10 must-haves verified
re_verification: false
---

# Phase 27: Data Model Migration Verification Report

**Phase Goal:** Order records use composite uniqueness and store normalized amount fields so each on-chain event maps to exactly one unambiguous database record
**Verified:** 2026-02-21T04:30:00Z
**Status:** passed
**Re-verification:** No - initial verification

## Goal Achievement

### Observable Truths

| #   | Truth                                                                                 | Status   | Evidence                                                                                                          |
| --- | ------------------------------------------------------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------- |
| 1   | Order model has separate nullable usdcAmount and tokenAmount columns stored as String | VERIFIED | `schema.prisma` lines 76-77: `usdcAmount String?` and `tokenAmount String?`                                       |
| 2   | Order model has a required logIndex Int column                                        | VERIFIED | `schema.prisma` line 81: `logIndex Int` (non-nullable, no `?`)                                                    |
| 3   | Order model has composite unique constraint on (txHash, logIndex)                     | VERIFIED | `schema.prisma` line 89: `@@unique([txHash, logIndex])`; old `@unique` on txHash removed                          |
| 4   | The old amount column no longer exists in the Order model                             | VERIFIED | `schema.prisma` Order model has no `amount` field; migration SQL at line 5 drops it explicitly                    |
| 5   | MintStarted handler creates order with usdcAmount populated, composite upsert         | VERIFIED | `mint.ts` lines 44-47: `where: { txHash_logIndex: {...} }`, line 53: `usdcAmount: args.usdcAmount.toString()`     |
| 6   | RedeemRequested handler creates order with tokenAmount populated, composite upsert    | VERIFIED | `redeem.ts` lines 44-47: `where: { txHash_logIndex: {...} }`, line 54: `tokenAmount: args.tokenAmount.toString()` |
| 7   | MintFinalized handler has self-healing (creates if no pending order, count === 0)     | VERIFIED | `mint.ts` lines 102-131: `if (count === 0)` block with `tx.order.upsert` using composite key                      |
| 8   | RedeemFinalized handler has self-healing (creates if no pending order, count === 0)   | VERIFIED | `redeem.ts` lines 103-132: `if (count === 0)` block with `tx.order.upsert` using composite key                    |
| 9   | logIndex is extracted from viem's event log and passed to all handlers via EventMeta  | VERIFIED | `indexer.ts` lines 223-228: `meta.logIndex: event.logIndex` in processAndCommit for every event type              |
| 10  | No references to the old `amount` field remain in the worker package                  | VERIFIED | `grep -r ".amount" apps/worker/src/` returns zero matches on Order.amount; stats.ts uses usdcAmount/tokenAmount   |

**Score:** 10/10 truths verified

### Required Artifacts

| Artifact                                                                                            | Expected                                                       | Status   | Details                                                                                                                                                                                                                      |
| --------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------- | --------------------------------------------------------------------------------------------------- |
| `packages/db/prisma/schema.prisma`                                                                  | Order model with composite uniqueness, split amounts           | VERIFIED | Contains `@@unique([txHash, logIndex])`, `usdcAmount String?`, `tokenAmount String?`, `logIndex Int`                                                                                                                         |
| `packages/db/prisma/migrations/20260221092449_composite_order_uniqueness_and_amounts/migration.sql` | Applied migration SQL                                          | VERIFIED | Drops `amount`, adds `logIndex INTEGER NOT NULL`, adds `usdcAmount TEXT`, creates composite unique index                                                                                                                     |
| `packages/db/generated/prisma/models/Order.ts`                                                      | Regenerated Prisma client with new schema                      | VERIFIED | `$OrderPayload` at line 984 shows `usdcAmount: string                                                                                                                                                                        | null`, `tokenAmount: string | null`, `logIndex: number`; `OrderWhereUniqueInput`at line 320 exposes`txHash_logIndex` compound key |
| `apps/worker/src/handlers/mint.ts`                                                                  | MintStarted composite upsert, MintFinalized self-healing       | VERIFIED | `txHash_logIndex` composite where in both handleMintStarted and handleMintFinalized self-heal block                                                                                                                          |
| `apps/worker/src/handlers/redeem.ts`                                                                | RedeemRequested composite upsert, RedeemFinalized self-healing | VERIFIED | `txHash_logIndex` composite where in both handleRedeemRequested and handleRedeemFinalized self-heal block                                                                                                                    |
| `apps/worker/src/handlers/refund.ts`                                                                | No old amount references                                       | VERIFIED | Uses only `status` updates via updateMany; no amount field references at all                                                                                                                                                 |
| `apps/worker/src/indexer.ts`                                                                        | EventMeta.logIndex passed to all handlers                      | VERIFIED | `meta: EventMeta` includes `logIndex: event.logIndex` at line 227; passed to all 4 order-creating handlers                                                                                                                   |
| `apps/worker/src/stats.ts`                                                                          | Uses usdcAmount/tokenAmount, no old amount column              | VERIFIED | `backfillActivityLog` selects `usdcAmount: true, tokenAmount: true` (line 33-34); `createMany` uses `usdcAmount ?? tokenAmount ?? "0"` (line 50); `computeStats` selects `usdcAmount: true, tokenAmount: true` (lines 77-78) |

### Key Link Verification

| From                 | To                    | Via                                      | Status | Details                                                                                                                     |
| -------------------- | --------------------- | ---------------------------------------- | ------ | --------------------------------------------------------------------------------------------------------------------------- |
| `indexer.ts`         | `handlers/mint.ts`    | `meta` object with `logIndex`            | WIRED  | `meta.logIndex = event.logIndex` constructed in `processAndCommit`, passed to `handleMintStarted` and `handleMintFinalized` |
| `handlers/mint.ts`   | `prisma.order.upsert` | composite `txHash_logIndex` where clause | WIRED  | `where: { txHash_logIndex: { txHash: meta.transactionHash, logIndex: meta.logIndex } }` in both handlers                    |
| `handlers/redeem.ts` | `prisma.order.upsert` | composite `txHash_logIndex` where clause | WIRED  | `where: { txHash_logIndex: { txHash: meta.transactionHash, logIndex: meta.logIndex } }` in both handlers                    |

### Requirements Coverage

No requirements explicitly mapped to phase 27 in REQUIREMENTS.md; the phase goal was self-contained schema + worker migration.

### Anti-Patterns Found

| File                                    | Line    | Pattern                       | Severity | Impact                                                                                                                           |
| --------------------------------------- | ------- | ----------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `apps/web/app/api/orders/[id]/route.ts` | 35      | `order.amount` reference      | Info     | Phase 28 scope; web app has not been migrated yet. TypeScript errors exist in `apps/web` but are explicitly deferred to Phase 28 |
| `apps/web/app/api/stats/route.ts`       | 12, 27  | `amount` select and reference | Info     | Phase 28 scope                                                                                                                   |
| Multiple `apps/web/features/**`         | various | `order.amount` display        | Info     | Phase 28 scope                                                                                                                   |

None of these are blockers for phase 27 — the SUMMARY for 27-02 explicitly states "apps/web still references old `order.amount` field -- Phase 28 must update those references" and the plan `27-02-PLAN.md` line 298 explicitly scopes out web changes: "Do NOT change any files in `apps/web/`".

### Human Verification Required

None — all critical behaviors are verifiable from the static code and typecheck output.

One optional runtime check if desired:

**Test:** Deploy worker against Fuji testnet and emit a MintStarted event. Confirm the database record has `usdcAmount` set, `tokenAmount` null, and the `logIndex` column populated with the on-chain log index value.

**Why optional:** The composite upsert pattern and field population are fully verified by static analysis and the worker typecheck passing cleanly.

### Gaps Summary

No gaps. All must-haves from both plans (27-01 and 27-02) are fully implemented and wired.

**Plan 27-01 (schema):** The Prisma schema has `@@unique([txHash, logIndex])`, `usdcAmount String?`, `tokenAmount String?`, `logIndex Int` (required), and no `amount` field. The migration SQL was applied (`20260221092449_composite_order_uniqueness_and_amounts`). The generated Prisma client reflects all new fields and exposes the `txHash_logIndex` compound unique input type.

**Plan 27-02 (worker handlers):** All four event handlers (MintStarted, MintFinalized, RedeemRequested, RedeemFinalized) use the composite `txHash_logIndex` upsert. Both finalization handlers have self-healing `if (count === 0)` blocks. The indexer passes `logIndex: event.logIndex` in `EventMeta` to every handler. `stats.ts` is fully migrated to `usdcAmount`/`tokenAmount`. `pnpm --filter @ammo-exchange/worker check` passes with zero errors.

The web app (`apps/web`) has TypeScript errors due to stale `order.amount` references — this is the explicitly documented scope of Phase 28, not a gap in Phase 27.

---

_Verified: 2026-02-21T04:30:00Z_
_Verifier: Claude (gsd-verifier)_
