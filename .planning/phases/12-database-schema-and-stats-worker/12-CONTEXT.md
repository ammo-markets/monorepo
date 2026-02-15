# Phase 12: Database Schema & Stats Worker - Context

**Gathered:** 2026-02-15
**Status:** Ready for planning

<domain>
## Phase Boundary

Build the enriched data layer for the protocol: ProtocolStats table with per-caliber volume totals, ActivityLog table for transaction history, UserPreference table for favorite calibers, a periodic stats worker job, and API endpoints to serve all three. This is the data foundation that Phases 14-16 consume.

</domain>

<decisions>
## Implementation Decisions

### Protocol stats scope
- Per-caliber totals only (no global aggregates, no time series)
- Metrics: total minted amount, total redeemed amount, net supply per caliber
- No USD value tracking — volume only
- Timestamps are internal bookkeeping only (not user-visible)
- Stats endpoint is public (unauthenticated) — serves the landing page caliber showcase in Phase 16

### Activity log design
- Transactions only — mint, redeem, and swap events (no status changes, no account events)
- Structured data only — store type, caliber, amount, txHash as fields; UI builds display strings
- Final state only — one row per transaction with current status (no status change history)
- Default API limit: last 5 activities (matches Phase 14 dashboard spec)

### User preferences model
- Favorite calibers only — no default trade settings, no display preferences
- Toggle-based favorites — users star/unstar calibers; favorited ones appear first in trade page
- Created on first use — no preferences row until user explicitly favorites something
- Standalone API endpoint — GET/PUT /api/user/preferences, separate from user profile

### Stats freshness & computation
- Recompute every 15 minutes via cron job
- Runs in the existing apps/worker service (new cron job, not a new service)
- Data source: database only — aggregate from already-indexed orders and events (no on-chain reads)
- On failure: serve stale data, log the error, retry next cycle

### Claude's Discretion
- Exact Prisma schema field types and indexes
- Worker scheduling mechanism (setInterval, node-cron, etc.)
- API response shapes and pagination patterns
- Error logging and monitoring approach

</decisions>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 12-database-schema-and-stats-worker*
*Context gathered: 2026-02-15*
