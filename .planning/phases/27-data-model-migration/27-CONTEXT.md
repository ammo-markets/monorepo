# Phase 27: Data Model Migration - Context

**Gathered:** 2026-02-21
**Status:** Ready for planning

<domain>
## Phase Boundary

Prisma schema migration for composite order uniqueness (txHash + logIndex) and normalized amount fields (usdcAmount, tokenAmount), plus worker handlers populating the new model. Existing testnet data will be wiped and re-indexed from chain.

</domain>

<decisions>
## Implementation Decisions

### Migration strategy
- Single Prisma migration: add new columns + composite unique constraint in one step
- Wipe existing order data and start fresh (Fuji testnet — no preservation needed)
- Drop the old txHash-only unique constraint entirely (no non-unique index kept)
- logIndex column is required (non-nullable) — every on-chain event has a logIndex, fail loudly if missing

### Amount field semantics
- Both `usdcAmount` and `tokenAmount` are nullable columns
- Mint creation: set `usdcAmount`, leave `tokenAmount` null
- Redeem creation: set `tokenAmount`, leave `usdcAmount` null
- On finalization: populate BOTH fields (completed orders have full data for portfolio views)
- Drop the old `amount` column entirely — clean break
- Store raw wei values (no conversion at ingestion). Display-time formatting only

### Worker handler behavior
- Idempotency via silent upsert: if order with same (txHash, logIndex) exists, do nothing (no warning log)
- Self-healing on finalization: if no matching pending order exists, create from finalization event (don't fail)
- Extract logIndex directly from viem's event log object (not from receipt)
- Store amounts as raw wei values from chain events

### Backfill / re-indexing
- After schema migration and data wipe, worker re-indexes all historical events from a start block
- Start block sourced from a shared config constant in @ammo-exchange/shared (hardcoded deployment block)
- Auto re-index on empty DB: if no orders exist at startup, replay from start block; otherwise listen for new events only
- Batch processing: fetch events in block ranges (e.g., 2000 blocks per query) for speed

### Claude's Discretion
- Column type choice for amount fields (BigInt vs Decimal) — based on what viem returns and Prisma capabilities
- Exact batch size for re-indexing block ranges
- Migration file naming and Prisma migration metadata
- Error handling details for RPC failures during re-indexing

</decisions>

<specifics>
## Specific Ideas

- Worker should be self-healing: finalization events create order records even if initiation was missed
- "Auto on empty DB" pattern: smart startup behavior that avoids manual intervention on fresh deployments
- Raw wei storage with display-time formatting aligns with the audit's BigInt-safe requirement (Phase 28 DATA-04)

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 27-data-model-migration*
*Context gathered: 2026-02-21*
