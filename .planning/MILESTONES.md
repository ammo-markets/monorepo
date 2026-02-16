# Milestones

## v1.0 Fuji Testnet Integration (Shipped: 2026-02-11)

**Phases completed:** 6 phases, 12 plans, 0 tasks

**Key accomplishments:**

- Deployed all smart contracts to Avalanche Fuji (AmmoManager, AmmoFactory, 4 CaliberMarkets, 4 AmmoTokens, MockUSDC) with shared config
- Built crash-recoverable event indexer polling 4 event types into database with BlockCursor checkpoint
- Wired real wallet connection (MetaMask) with network switching, token balances, and 5 API routes
- Connected mint and redeem UI flows to real contract calls with tx status tracking and error messages
- Eliminated all mock data -- every display reads from chain or database
- Built keeper-gated admin dashboard with finalizeMint/finalizeRedeem dialogs and protocol stats

---

## v1.1 End-to-End Flow Fix (Shipped: 2026-02-15)

**Phases completed:** 1 phase (Phase 7), 2 plans. Phase 8 (E2E Verification) superseded by v1.2.

**Key accomplishments:**

- Auto-create user DB record on wallet connect (fire-and-forget registration with upsert)
- Deployment block floor in shared config -- worker scans from block 51699730 instead of 0
- Progress logging during backfill for operational visibility

**Last phase number:** 7 (Phase 8 superseded, not shipped)

---

## v1.2 Production Hardening (Shipped: 2026-02-15)

**Phases completed:** 4 phases (9, 9.1, 10, 11), 10 plans, 20 tasks
**Files changed:** 94 (+6,849 / -609)
**Git range:** `4437533` (feat(09-01)) → `c55cd4e` (fix(11-02))

**Key accomplishments:**

- SIWE wallet authentication with iron-session cookies on all API routes, keeper-gated admin routes, and registration race condition fix
- Server-side admin protection (non-keepers see 404), KYC identity form with zod validation, and user profile page with shipping address management
- Worker handles all 11 CaliberMarket events with RPC retry/backoff, 5-block reorg protection, env validation, and graceful shutdown
- All 15 frontend components migrated from useEffect+fetch to TanStack Query with cache invalidation on admin actions
- Error boundaries on all 7 route segments, zero as-any casts, zero unused React imports
- CORS origin whitelist and 100 req/min rate limiting middleware

**Delivered:** Production-hardened DeFi protocol -- every API request authenticated, every contract event indexed reliably, every component on TanStack Query with error boundaries.

---

## v1.3 UX Restructure & Data Enrichment (Shipped: 2026-02-16)

**Phases completed:** 6 phases (12-17), 8 plans, 17 tasks
**Files changed:** 193 (+10,040 / -3,480)
**Git range:** `4c667ec` (feat(12-01)) → `bd8c1d3` (docs(phase-17))

**Key accomplishments:**

- Enriched data layer with ProtocolStats, ActivityLog, and UserPreference tables plus 15-minute stats cron job
- Split app into public landing and wallet-gated app with responsive 4-tab navigation (Dashboard, Trade, Portfolio, Profile)
- Personal dashboard with on-chain token balances, recent orders, quick actions, and pending order banner
- Unified Trade page with CaliberInfoPanel, Mint/Redeem/Swap tabs, and URL param pre-selection
- Public landing page with hero CTA, caliber showcase with specs, and FAQ accordion
- Eliminated duplicate caliber selection and wired ProtocolStats to real /api/stats data

**Delivered:** Full UX restructure -- visitors see a polished landing page, authenticated users get a 4-tab app with dashboard, unified trade, and enriched protocol data.

---

