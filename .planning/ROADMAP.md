# Roadmap: Ammo Exchange

## Milestones

- ✅ **v1.0 Fuji Testnet Integration** -- Phases 1-6 (shipped 2026-02-11)
- ✅ **v1.1 End-to-End Flow Fix** -- Phase 7 (shipped 2026-02-15)
- ✅ **v1.2 Production Hardening** -- Phases 9-11 + 9.1 (shipped 2026-02-15)
- ✅ **v1.3 UX Restructure & Data Enrichment** -- Phases 12-17 (shipped 2026-02-16)
- ✅ **v1.4 UI/UX Polish & Accessibility** -- Phases 18-23 (shipped 2026-02-16)
- 🚧 **v1.5 Pitch Deck** -- Phases 24-26 (in progress)
- ✅ **v1.6 Audit Remediation** -- Phases 27-31 (shipped 2026-02-21)
- 📋 **v1.7 Contract Rollback** -- Phase 32 (planned)

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

<details>
<summary>v1.6 Audit Remediation (Phases 27-31) -- SHIPPED 2026-02-21</summary>

- [x] **Phase 27: Data Model Migration** - Prisma schema migration for composite order uniqueness and normalized amount fields (completed 2026-02-21)
- [x] **Phase 28: Data Flow Completion** - APIs and UI render correct amount fields, activity feed sorts by updatedAt, BigInt-safe formatting (completed 2026-02-21)
- [x] **Phase 29: Security Hardening** - KYC endpoint masking, mutation error handling, rate limiter IP trust, state code validation, SIWE policy enforcement (completed 2026-02-21)
- [x] **Phase 30: Architecture & Contract Hardening** - Dynamic caliber registry, worker backfill self-healing, contract deadline validation, price sanity bounds, Fuji redeployment (completed 2026-02-21)
- [x] **Phase 31: Test Suite** - Automated tests for worker idempotency, API auth/compliance, and E2E mint/redeem/finalize flows (completed 2026-02-21)

</details>

### v1.7 Contract Rollback (Planned)

**Milestone Goal:** Remove the oracle sanity check from finalizeMint and roll back to pre-30-01 deployed contracts on Fuji -- the keeper passes actual price directly and the user's slippage guard (minTokensOut) is sufficient protection.

- [x] **Phase 32: Contract Rollback & Cleanup** - Revert CaliberMarket.sol to pre-30-01 state, roll back Fuji addresses, regenerate ABI, clean up tests and frontend error mappings, purge stale testnet data (completed 2026-02-22)

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

### Phase 32: Contract Rollback & Cleanup

**Goal**: The protocol runs on the pre-30-01 Fuji contracts without oracle sanity checks, deadline validation, or price deviation bounds -- the keeper supplies the actual price and the user's slippage guard is the sole protection
**Depends on**: Nothing (first phase of v1.7, independent of v1.5)
**Requirements**: CNTR-01, CNTR-02, CNTR-03, CONF-01, CONF-02, FEND-01, DATA-01
**Success Criteria** (what must be TRUE):

1. CaliberMarket.sol source contains no DeadlineInPast error, no oracle price query in finalizeMint, no maxPriceDeviationBps state variable, no setMaxPriceDeviation function, and no PriceTooLow/PriceTooHigh errors
2. Running `forge test` in packages/contracts passes with zero test failures (removed tests for DeadlineInPast, PriceTooLow, PriceTooHigh, setMaxPriceDeviation no longer exist)
3. The CaliberMarket ABI in packages/contracts/src/abis/ matches the reverted contract source (regenerated via forge build + export-abis), and `pnpm build` compiles without ABI mismatch errors across web and worker
4. Shared config contract addresses point to the old Fuji deployment (block 51699730) and the app connects to the correct markets/tokens when a user initiates a mint or redeem
5. The CONTRACT_ERROR_MESSAGES map in apps/web/lib/errors.ts contains no entries for DeadlineInPast, PriceTooLow, or PriceTooHigh
   **Plans**: 1 plan

Plans:

- [ ] 32-01-PLAN.md -- Revert contract source, clean up tests, regenerate ABI, roll back config addresses, remove frontend error mappings

## Progress

**Execution Order:**
Phase 32 is the sole phase in v1.7.

| Phase                                    | Milestone | Plans Complete | Status      | Completed  |
| ---------------------------------------- | --------- | -------------- | ----------- | ---------- |
| 1. Foundation                            | v1.0      | 2/2            | Complete    | 2026-02-11 |
| 2. Event Indexer                         | v1.0      | 2/2            | Complete    | 2026-02-11 |
| 3. Wallet and API Layer                  | v1.0      | 2/2            | Complete    | 2026-02-11 |
| 4. Mint and Redeem Flows                 | v1.0      | 2/2            | Complete    | 2026-02-11 |
| 5. Portfolio and Data Integration        | v1.0      | 2/2            | Complete    | 2026-02-11 |
| 6. Admin Dashboard                       | v1.0      | 2/2            | Complete    | 2026-02-11 |
| 7. Registration and Indexing Fixes       | v1.1      | 2/2            | Complete    | 2026-02-15 |
| 9. Authentication and API Hardening      | v1.2      | 2/2            | Complete    | 2026-02-15 |
| 9.1 Admin Protection, KYC Data & Profile | v1.2      | 4/4            | Complete    | 2026-02-15 |
| 10. Worker Hardening                     | v1.2      | 2/2            | Complete    | 2026-02-15 |
| 11. Frontend Data Layer and Quality      | v1.2      | 2/2            | Complete    | 2026-02-15 |
| 12. Database Schema & Stats Worker       | v1.3      | 2/2            | Complete    | 2026-02-15 |
| 13. App Shell Restructure                | v1.3      | 2/2            | Complete    | 2026-02-16 |
| 14. Dashboard                            | v1.3      | 1/1            | Complete    | 2026-02-16 |
| 15. Unified Trade Page                   | v1.3      | 1/1            | Complete    | 2026-02-16 |
| 16. Landing Page                         | v1.3      | 1/1            | Complete    | 2026-02-16 |
| 17. Trade UX Fix & Stats Wiring          | v1.3      | 1/1            | Complete    | 2026-02-16 |
| 18. Theme & Accessibility Foundation     | v1.4      | 2/2            | Complete    | 2026-02-16 |
| 19. Interactive States & ARIA            | v1.4      | 2/2            | Complete    | 2026-02-16 |
| 20. Navigation & Wallet                  | v1.4      | 2/2            | Complete    | 2026-02-16 |
| 21. User Flow Improvements               | v1.4      | 2/2            | Complete    | 2026-02-16 |
| 22. Admin Enhancements                   | v1.4      | 2/2            | Complete    | 2026-02-16 |
| 23. Landing Page & Cleanup               | v1.4      | 2/2            | Complete    | 2026-02-16 |
| 24. Foundation & Setup                   | v1.5      | 1/1            | Complete    | 2026-02-17 |
| 25. Slide Content & Navigation           | v1.5      | 0/2            | Not started | -          |
| 26. PDF Export & Deployment              | v1.5      | 0/2            | Not started | -          |
| 27. Data Model Migration                 | v1.6      | 2/2            | Complete    | 2026-02-21 |
| 28. Data Flow Completion                 | v1.6      | 2/2            | Complete    | 2026-02-21 |
| 29. Security Hardening                   | v1.6      | 1/1            | Complete    | 2026-02-21 |
| 30. Architecture & Contract Hardening    | v1.6      | 3/3            | Complete    | 2026-02-21 |
| 31. Test Suite                           | v1.6      | 3/3            | Complete    | 2026-02-21 |
| 32. Contract Rollback & Cleanup          | v1.7      | Complete    | 2026-02-22 | -          |

---

_Roadmap created: 2026-02-10_
_Last updated: 2026-02-22 (v1.7 Contract Rollback roadmap added)_
