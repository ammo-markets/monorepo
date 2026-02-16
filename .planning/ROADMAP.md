# Roadmap: Ammo Exchange

## Milestones

- ✅ **v1.0 Fuji Testnet Integration** -- Phases 1-6 (shipped 2026-02-11)
- ✅ **v1.1 End-to-End Flow Fix** -- Phase 7 (shipped 2026-02-15)
- ✅ **v1.2 Production Hardening** -- Phases 9-11 + 9.1 (shipped 2026-02-15)
- **v1.3 UX Restructure & Data Enrichment** -- Phases 12-16 (in progress)

## Phases

<details>
<summary>v1.0 Fuji Testnet Integration (Phases 1-6) -- SHIPPED 2026-02-11</summary>

- [x] Phase 1: Foundation (2/2 plans) -- completed 2026-02-11
- [x] Phase 2: Event Indexer (2/2 plans) -- completed 2026-02-11
- [x] Phase 3: Wallet and API Layer (2/2 plans) -- completed 2026-02-11
- [x] Phase 4: Mint and Redeem Flows (2/2 plans) -- completed 2026-02-11
- [x] Phase 5: Portfolio and Data Integration (2/2 plans) -- completed 2026-02-11
- [x] Phase 6: Admin Dashboard (2/2 plans) -- completed 2026-02-11

Full details: `.planning/milestones/v1.0-ROADMAP.md`

</details>

<details>
<summary>v1.1 End-to-End Flow Fix (Phase 7) -- SHIPPED 2026-02-15</summary>

- [x] Phase 7: Registration and Indexing Fixes (2/2 plans) -- completed 2026-02-15

Phase 8 (E2E Verification) superseded by v1.2.

</details>

<details>
<summary>v1.2 Production Hardening (Phases 9-11 + 9.1) -- SHIPPED 2026-02-15</summary>

- [x] Phase 9: Authentication and API Hardening (2/2 plans) -- completed 2026-02-15
- [x] Phase 9.1: Admin Protection, KYC Data & User Profile (4/4 plans) -- completed 2026-02-15
- [x] Phase 10: Worker Hardening (2/2 plans) -- completed 2026-02-15
- [x] Phase 11: Frontend Data Layer and Quality (2/2 plans) -- completed 2026-02-15

Full details: `.planning/milestones/v1.2-ROADMAP.md`

</details>

### v1.3 UX Restructure & Data Enrichment (In Progress)

**Milestone Goal:** Split the app into a public landing site and a wallet-connected app with clean 4-tab navigation, enriched database for protocol stats/activity/preferences, and unified trade experience.

- [x] **Phase 12: Database Schema & Stats Worker** - New tables and periodic stats computation
- [x] **Phase 13: App Shell Restructure** - Route groups, 4-tab nav, wallet gate
- [x] **Phase 14: Dashboard** - Personal dashboard with balances, orders, and quick actions
- [x] **Phase 15: Unified Trade Page** - Combined mint/redeem/swap with inline caliber info
- [ ] **Phase 16: Landing Page** - Public marketing page with hero, how-it-works, caliber showcase, FAQ

## Phase Details

### Phase 12: Database Schema & Stats Worker
**Goal**: Protocol has enriched data layer with stats, activity tracking, and user preferences ready for UI consumption
**Depends on**: Nothing (data layer foundation for this milestone)
**Requirements**: DB-01, DB-02, DB-03, DB-04
**Success Criteria** (what must be TRUE):
  1. ProtocolStats table exists and stores aggregate metrics (total minted/redeemed per caliber, user count, volume)
  2. ActivityLog table stores human-readable transaction history with descriptions and status changes
  3. UserPreference table stores favorite calibers and display settings per user
  4. Worker job periodically computes and caches protocol stats from chain and DB data
  5. API endpoints exist that serve protocol stats, activity log, and user preferences
**Plans:** 2 plans

Plans:
- [x] 12-01-PLAN.md -- Prisma schema (ProtocolStats, ActivityLog, UserPreference) + migration + seed
- [x] 12-02-PLAN.md -- Stats worker cron job + API endpoints (stats, activity, preferences)

### Phase 13: App Shell Restructure
**Goal**: App has clean separation between public landing routes and wallet-connected app routes with responsive 4-tab navigation
**Depends on**: Nothing (can run parallel with Phase 12, but listed after for clarity)
**Requirements**: SHELL-01, SHELL-02, SHELL-03, SHELL-04
**Success Criteria** (what must be TRUE):
  1. Next.js route groups split landing (public) and app (wallet-connected) with distinct layouts
  2. App section has 4-tab navigation (Dashboard, Trade, Portfolio, Profile) with active state indicators
  3. Visiting any app route without a connected wallet redirects to the landing page
  4. Navigation is responsive -- sidebar on desktop, bottom tabs on mobile
**Plans:** 2 plans

Plans:
- [x] 13-01-PLAN.md -- Route groups ((landing) + (app)), wallet gate, move existing routes
- [x] 13-02-PLAN.md -- Responsive 4-tab AppNav (sidebar desktop, bottom tabs mobile)

### Phase 14: Dashboard
**Goal**: Users see a personal dashboard as their home screen with token balances, recent activity, and quick actions
**Depends on**: Phase 12 (needs DB tables and stats), Phase 13 (needs app shell and nav)
**Requirements**: DASH-01, DASH-02, DASH-03, DASH-04
**Success Criteria** (what must be TRUE):
  1. User sees token balances for all 4 calibers with USD value on dashboard
  2. User sees last 5 orders with status, amount, and timestamp on dashboard
  3. User can initiate Mint or Redeem directly from dashboard quick action buttons
  4. User sees a banner when they have pending orders that need attention
**Plans:** 1 plan

Plans:
- [x] 14-01-PLAN.md -- Dashboard page with balance cards, recent orders, quick actions, pending banner

### Phase 15: Unified Trade Page
**Goal**: Users have a single trade page where they can mint, redeem, or swap any caliber with full context
**Depends on**: Phase 13 (needs app shell and nav)
**Requirements**: TRADE-01, TRADE-02, TRADE-03, TRADE-04
**Success Criteria** (what must be TRUE):
  1. User can select any caliber and see inline specs (grain, type, min order) with current price
  2. User can switch between Mint and Redeem via tabs on the unified Trade page
  3. User can access the swap widget for token trading on the Trade page
  4. User sees order summary with fees, amounts, and total before confirming any action
**Plans:** 1 plan

Plans:
- [x] 15-01-PLAN.md -- Caliber info panel, Mint/Redeem/Swap tabs, unified trade page

### Phase 16: Landing Page
**Goal**: Visitors see a polished public landing page that explains the protocol and drives them to connect a wallet
**Depends on**: Phase 13 (needs public route group from shell restructure)
**Requirements**: LAND-01, LAND-02, LAND-03, LAND-04
**Success Criteria** (what must be TRUE):
  1. Visitor sees hero section with protocol tagline and a prominent "Launch App" CTA
  2. Visitor sees how-it-works section explaining mint/trade/redeem in 3-4 visual steps
  3. Visitor sees caliber showcase displaying all 4 calibers with specs and current prices
  4. Visitor sees FAQ section answering common questions about the protocol
**Plans:** 1 plan

Plans:
- [ ] 16-01-PLAN.md -- Update hero CTA, enhance caliber showcase with specs, add FAQ section

## Progress

**Execution Order:**
Phases execute in numeric order: 12 -> 13 -> 14 -> 15 -> 16

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|---------------|--------|-----------|
| 1. Foundation | v1.0 | 2/2 | Complete | 2026-02-11 |
| 2. Event Indexer | v1.0 | 2/2 | Complete | 2026-02-11 |
| 3. Wallet and API Layer | v1.0 | 2/2 | Complete | 2026-02-11 |
| 4. Mint and Redeem Flows | v1.0 | 2/2 | Complete | 2026-02-11 |
| 5. Portfolio and Data Integration | v1.0 | 2/2 | Complete | 2026-02-11 |
| 6. Admin Dashboard | v1.0 | 2/2 | Complete | 2026-02-11 |
| 7. Registration and Indexing Fixes | v1.1 | 2/2 | Complete | 2026-02-15 |
| 9. Authentication and API Hardening | v1.2 | 2/2 | Complete | 2026-02-15 |
| 9.1 Admin Protection, KYC Data & Profile | v1.2 | 4/4 | Complete | 2026-02-15 |
| 10. Worker Hardening | v1.2 | 2/2 | Complete | 2026-02-15 |
| 11. Frontend Data Layer and Quality | v1.2 | 2/2 | Complete | 2026-02-15 |
| 12. Database Schema & Stats Worker | v1.3 | 2/2 | Complete | 2026-02-15 |
| 13. App Shell Restructure | v1.3 | 2/2 | Complete | 2026-02-16 |
| 14. Dashboard | v1.3 | 1/1 | Complete | 2026-02-16 |
| 15. Unified Trade Page | v1.3 | 1/1 | Complete | 2026-02-16 |
| 16. Landing Page | v1.3 | 0/TBD | Not started | - |

---
*Roadmap created: 2026-02-10*
*Last updated: 2026-02-16 (Phase 15 complete)*
