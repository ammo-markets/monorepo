# Roadmap: Ammo Exchange

## Milestones

- ✅ **v1.0 Fuji Testnet Integration** -- Phases 1-6 (shipped 2026-02-11)
- ✅ **v1.1 End-to-End Flow Fix** -- Phase 7 (shipped 2026-02-15)
- ✅ **v1.2 Production Hardening** -- Phases 9-11 + 9.1 (shipped 2026-02-15)
- ✅ **v1.3 UX Restructure & Data Enrichment** -- Phases 12-17 (shipped 2026-02-16)
- ✅ **v1.4 UI/UX Polish & Accessibility** -- Phases 18-23 (shipped 2026-02-16)
- 🚧 **v1.5 Pitch Deck** -- Phases 24-26 (in progress)
- 📋 **v1.6 Audit Remediation** -- Phases 27-31 (planned)

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
- [x] Phase 9.1: Admin Protection, KYC Data & Profile (4/4 plans) -- completed 2026-02-15
- [x] Phase 10: Worker Hardening (2/2 plans) -- completed 2026-02-15
- [x] Phase 11: Frontend Data Layer and Quality (2/2 plans) -- completed 2026-02-15

Full details: `.planning/milestones/v1.2-ROADMAP.md`

</details>

<details>
<summary>v1.3 UX Restructure & Data Enrichment (Phases 12-17) -- SHIPPED 2026-02-16</summary>

- [x] Phase 12: Database Schema & Stats Worker (2/2 plans) -- completed 2026-02-15
- [x] Phase 13: App Shell Restructure (2/2 plans) -- completed 2026-02-16
- [x] Phase 14: Dashboard (1/1 plan) -- completed 2026-02-16
- [x] Phase 15: Unified Trade Page (1/1 plan) -- completed 2026-02-16
- [x] Phase 16: Landing Page (1/1 plan) -- completed 2026-02-16
- [x] Phase 17: Trade UX Fix & Stats Wiring (1/1 plan) -- completed 2026-02-16

Full details: `.planning/milestones/v1.3-ROADMAP.md`

</details>

<details>
<summary>v1.4 UI/UX Polish & Accessibility (Phases 18-23) -- SHIPPED 2026-02-16</summary>

- [x] Phase 18: Theme & Accessibility Foundation (2/2 plans) -- completed 2026-02-16
- [x] Phase 19: Interactive States & ARIA (2/2 plans) -- completed 2026-02-16
- [x] Phase 20: Navigation & Wallet (2/2 plans) -- completed 2026-02-16
- [x] Phase 21: User Flow Improvements (2/2 plans) -- completed 2026-02-16
- [x] Phase 22: Admin Enhancements (2/2 plans) -- completed 2026-02-16
- [x] Phase 23: Landing Page & Cleanup (2/2 plans) -- completed 2026-02-16

</details>

<details>
<summary>v1.5 Pitch Deck (Phases 24-26) -- IN PROGRESS</summary>

- [x] **Phase 24: Foundation & Setup** - Scaffold pitchdeck app with hex-only brass/dark theme and Turborepo integration (completed 2026-02-17)
- [ ] **Phase 25: Slide Content & Navigation** - All 13 slides with keyboard navigation, transitions, and progress indicator
- [ ] **Phase 26: PDF Export & Deployment** - Client-side PDF generation and static deploy to shareable investor URL

Full details in Phase Details below.

</details>

### 📋 v1.6 Audit Remediation (Planned)

**Milestone Goal:** Fix all audit findings -- data correctness, security hardening, architecture gaps, and contract guards -- to bring the protocol to production-grade integrity before mainnet.

- [ ] **Phase 27: Data Model Migration** - Prisma schema migration for composite order uniqueness and normalized amount fields, plus worker handlers populating the new model
- [ ] **Phase 28: Data Flow Completion** - APIs and UI render correct amount fields, activity feed sorts by updatedAt, redeem flow persists shipping, BigInt-safe formatting
- [ ] **Phase 29: Security Hardening** - KYC endpoint masking, mutation error handling, rate limiter IP trust, state code validation, SIWE policy enforcement
- [ ] **Phase 30: Architecture & Contract Hardening** - Dynamic caliber registry, worker backfill self-healing, contract deadline validation, price sanity bounds, Fuji redeployment
- [ ] **Phase 31: Test Suite** - Automated tests for worker idempotency, API auth/compliance, and E2E mint/redeem/finalize flows

## Phase Details

### Phase 24: Foundation & Setup
**Goal**: A working pitchdeck app scaffold that renders in-browser and produces a non-blank PDF page (validating the hex-only color strategy)
**Depends on**: Nothing (first phase of v1.5)
**Requirements**: SETUP-01, SETUP-02, SETUP-03
**Success Criteria** (what must be TRUE):
  1. Running `pnpm dev --filter @ammo-exchange/pitchdeck` starts the app on port 3001 with a visible test slide
  2. The app uses hex-only CSS custom properties for all colors (no oklch values anywhere in the pitchdeck globals.css)
  3. `pnpm build` from the monorepo root builds the pitchdeck app as a static export (output directory contains only HTML/CSS/JS, no server)
  4. The pitchdeck app imports from `@ammo-exchange/shared` without build errors (transpilePackages configured)
**Plans**: 1 plan

Plans:
- [ ] 24-01-PLAN.md -- Scaffold pitchdeck app with hex-only theme, static export, and Turborepo wiring

### Phase 25: Slide Content & Navigation
**Goal**: Users can view a complete 13-slide investor deck in the browser with keyboard navigation, click controls, and smooth transitions
**Depends on**: Phase 24
**Requirements**: SLIDE-01, SLIDE-02, SLIDE-03, SLIDE-04, SLIDE-05, SLIDE-06, SLIDE-07, SLIDE-08, SLIDE-09, SLIDE-10, SLIDE-11, SLIDE-12, SLIDE-13, NAV-01, NAV-02, NAV-03, NAV-04
**Success Criteria** (what must be TRUE):
  1. All 13 slides render with their complete content (cover, problem, price chart, solution, how it works, market, competitive, revenue, traction, regulatory, roadmap, team, ask)
  2. Pressing ArrowRight/ArrowLeft/Space/Home/End navigates between slides with correct boundary behavior (no wrap-around past first/last)
  3. Clicking Prev/Next buttons navigates between slides and buttons disable at boundaries
  4. A slide counter shows current position (e.g., "3 / 13") and a progress indicator reflects advancement
  5. Slide transitions use CSS opacity + translateX animation (no animation library, smooth visual change between slides)
**Plans**: 2 plans

Plans:
- [ ] 25-01-PLAN.md -- Slide system architecture (useDeck hook, PitchDeck orchestrator, SlideRenderer, SlideControls, keyboard nav, CSS transitions, recharts install)
- [ ] 25-02-PLAN.md -- All 13 slide content components with slideData.ts and SlideLayout

### Phase 26: PDF Export & Deployment
**Goal**: Users can download a crisp multi-page PDF of the entire deck and access it at a shareable URL
**Depends on**: Phase 25
**Requirements**: PDF-01, PDF-02, PDF-03, DEPLOY-01
**Success Criteria** (what must be TRUE):
  1. Clicking "Export PDF" generates a landscape PDF containing all 13 slides with readable text (no blank pages, no blurry text)
  2. PDF renders at 1920x1080 with scale:2 for crisp output (text is sharp when zoomed to 200%)
  3. A progress indicator shows export status during PDF generation (user sees which slide is being captured)
  4. The app is deployed as a static site to a shareable URL that loads without errors
**Plans**: TBD

Plans:
- [ ] 26-01: PDF export with html2canvas-pro + jsPDF (off-screen rendering, progress indicator)
- [ ] 26-02: Static deployment to Vercel

### Phase 27: Data Model Migration
**Goal**: Order records use composite uniqueness and store normalized amount fields so each on-chain event maps to exactly one unambiguous database record
**Depends on**: Nothing (first phase of v1.6, independent of v1.5)
**Requirements**: DATA-01, DATA-02, DATA-03
**Success Criteria** (what must be TRUE):
  1. Prisma schema defines a unique constraint on (txHash, logIndex) for the Order model, and running `pnpm db:migrate` applies the migration without data loss
  2. Order model has separate `usdcAmount` and `tokenAmount` columns (both BigInt/Decimal), and existing orders are backfill-migrated with amounts in the correct field
  3. Worker MintStarted handler creates an order with `usdcAmount` populated from the event's USDC-wei value and `tokenAmount` left null until finalization
  4. Worker RedeemRequested handler creates an order with `tokenAmount` populated from the event's token-wei value and `usdcAmount` left null until finalization
  5. Two events emitted in the same transaction (different logIndex) each produce their own distinct order record (no silent overwrite)
**Plans**: TBD

### Phase 28: Data Flow Completion
**Goal**: All user-facing surfaces display the correct amount for context (USDC cost vs token rounds), activity feeds sort by latest state change, and the redeem flow saves shipping before confirmation
**Depends on**: Phase 27
**Requirements**: DATA-04, DATA-05, DATA-06, ARCH-01
**Success Criteria** (what must be TRUE):
  1. Mint order displays show the USDC amount paid (from `usdcAmount` field) and redeem order displays show the token amount burned (from `tokenAmount` field) -- no field confusion
  2. Activity API response includes `updatedAt` timestamp and the activity feed sorts entries by most recent state change, not creation time
  3. When a user submits a redeem order, the shipping address is persisted to the database via the shipping API before the confirmation step renders
  4. Stats API and supply API return all BigInt-derived values as string-formatted numbers (no JavaScript Number conversion that silently truncates values above 2^53)
**Plans**: TBD

### Phase 29: Security Hardening
**Goal**: All user-facing endpoints enforce proper data masking, input validation, and authentication policy so sensitive data never leaks and invalid inputs are rejected
**Depends on**: Phase 27 (needs updated schema for state validation context)
**Requirements**: SEC-01, SEC-02, SEC-03, SEC-04, SEC-05
**Success Criteria** (what must be TRUE):
  1. GET /api/kyc returns KYC status and masked identity info (last 4 of gov ID only) -- full gov ID number is never included in any API response
  2. KYC mutation hook surfaces non-2xx responses as thrown errors so React error boundaries and toast notifications activate on failure
  3. Rate limiter extracts client IP from the last entry in x-forwarded-for (trusted proxy) or falls back to socket address -- never trusts the first/raw header value from an untrusted client
  4. State code input is uppercased and validated against the set of valid US state/territory codes server-side before any restricted-state comparison runs
  5. SIWE message verification checks that the domain matches the app domain, the URI matches the expected callback, and the chain ID matches the configured network -- not just nonce validity
**Plans**: TBD

### Phase 30: Architecture & Contract Hardening
**Goal**: The system self-heals gaps in activity history, discovers new caliber markets automatically, and smart contracts reject obviously invalid keeper inputs
**Depends on**: Phase 28 (needs BigInt-safe APIs), Phase 29 (security fixes should land before contract changes)
**Requirements**: ARCH-02, ARCH-03, CNTR-01, CNTR-02
**Success Criteria** (what must be TRUE):
  1. Caliber registry is sourced from AmmoFactory MarketCreated events (or shared config) so a newly deployed CaliberMarket is automatically indexed and surfaced in the UI without code changes
  2. Worker stats backfill detects gaps in ActivityLog history (missing time windows) and fills them on startup instead of skipping when any rows exist
  3. CaliberMarket.startMint and CaliberMarket.startRedeem revert with a descriptive error when called with a deadline timestamp that is already in the past
  4. CaliberMarket.finalizeMint reverts when the keeper-supplied actualPriceX18 falls outside a configurable sanity range (e.g., not zero, within reasonable bounds of last known price)
  5. Modified contracts are redeployed to Fuji testnet and all contract addresses in shared config are updated to the new deployment
**Plans**: TBD

### Phase 31: Test Suite
**Goal**: Automated tests verify that audit remediation changes work correctly -- worker idempotency, API auth and compliance, and end-to-end mint/redeem flows
**Depends on**: Phase 27, Phase 28, Phase 29, Phase 30 (tests exercise code from all prior phases)
**Requirements**: TEST-01, TEST-02, TEST-03, TEST-04, TEST-05
**Success Criteria** (what must be TRUE):
  1. Running worker event handler tests shows that processing the same event twice (identical txHash + logIndex) results in exactly one order record (idempotent replay)
  2. Running worker event handler tests shows that two events with the same txHash but different logIndex values produce two distinct order records
  3. API auth tests confirm that unauthenticated requests to protected routes return 401/403, and non-keeper requests to admin routes return 404
  4. API compliance tests confirm that a user in a restricted state is rejected for redemption, state codes are normalized (e.g., "ca" treated as "CA"), and KYC GET response contains no raw gov ID
  5. E2E flow tests cover the happy path for mint initiation (USDC approval + startMint), redeem initiation (token approval + startRedeem), and keeper finalization (finalizeMint with valid price)
**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 27 -> 28 -> 29 -> 30 -> 31

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
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
| 16. Landing Page | v1.3 | 1/1 | Complete | 2026-02-16 |
| 17. Trade UX Fix & Stats Wiring | v1.3 | 1/1 | Complete | 2026-02-16 |
| 18. Theme & Accessibility Foundation | v1.4 | 2/2 | Complete | 2026-02-16 |
| 19. Interactive States & ARIA | v1.4 | 2/2 | Complete | 2026-02-16 |
| 20. Navigation & Wallet | v1.4 | 2/2 | Complete | 2026-02-16 |
| 21. User Flow Improvements | v1.4 | 2/2 | Complete | 2026-02-16 |
| 22. Admin Enhancements | v1.4 | 2/2 | Complete | 2026-02-16 |
| 23. Landing Page & Cleanup | v1.4 | 2/2 | Complete | 2026-02-16 |
| 24. Foundation & Setup | v1.5 | 1/1 | Complete | 2026-02-17 |
| 25. Slide Content & Navigation | v1.5 | 0/2 | Not started | - |
| 26. PDF Export & Deployment | v1.5 | 0/2 | Not started | - |
| 27. Data Model Migration | v1.6 | 0/? | Not started | - |
| 28. Data Flow Completion | v1.6 | 0/? | Not started | - |
| 29. Security Hardening | v1.6 | 0/? | Not started | - |
| 30. Architecture & Contract Hardening | v1.6 | 0/? | Not started | - |
| 31. Test Suite | v1.6 | 0/? | Not started | - |

---

_Roadmap created: 2026-02-10_
_Last updated: 2026-02-21 (v1.6 Audit Remediation roadmap added)_
