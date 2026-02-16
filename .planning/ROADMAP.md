# Roadmap: Ammo Exchange

## Milestones

- ✅ **v1.0 Fuji Testnet Integration** -- Phases 1-6 (shipped 2026-02-11)
- ✅ **v1.1 End-to-End Flow Fix** -- Phase 7 (shipped 2026-02-15)
- ✅ **v1.2 Production Hardening** -- Phases 9-11 + 9.1 (shipped 2026-02-15)
- ✅ **v1.3 UX Restructure & Data Enrichment** -- Phases 12-17 (shipped 2026-02-16)
- 🚧 **v1.4 UI/UX Polish & Accessibility** -- Phases 18-23 (in progress)

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

### 🚧 v1.4 UI/UX Polish & Accessibility (In Progress)

**Milestone Goal:** Address UI/UX critique -- fix accessibility gaps, theme inconsistencies, navigation issues, flow UX problems, and admin usability.

- [x] **Phase 18: Theme & Accessibility Foundation** - Unified design system and color contrast fixes (completed 2026-02-16)
- [x] **Phase 19: Interactive States & ARIA** - Focus-visible, hover classes, and screen reader support (completed 2026-02-16)
- [x] **Phase 20: Navigation & Wallet** - Nav improvements and wallet dropdown (completed 2026-02-16)
- [x] **Phase 21: User Flow Improvements** - Mint/redeem UX, profile KYC, swap Coming Soon (completed 2026-02-16)
- [ ] **Phase 22: Admin Enhancements** - Reject/refund actions, dashboard enrichment, order details, table filters
- [ ] **Phase 23: Landing Page & Cleanup** - Trust strip, social proof, swap widget refactor

## Phase Details

### Phase 18: Theme & Accessibility Foundation
**Goal**: The app has one consistent design system with accessible color contrast
**Depends on**: Nothing (foundation for v1.4)
**Requirements**: THEME-01, THEME-02, THEME-03, THEME-04, A11Y-04
**Success Criteria** (what must be TRUE):
  1. All CSS variables come from a single unified system (no duplicate shadcn + custom variable definitions)
  2. Admin sidebar uses the same theme variables as the rest of the app (no hardcoded Tailwind color classes)
  3. Border radius values throughout the app reference a consistent CSS variable scale
  4. The app enforces dark mode only with no unused theme toggle code remaining
  5. All muted text meets WCAG AA contrast ratio (4.5:1 minimum against background)
**Plans**: 2 plans

Plans:
- [x] 18-01-PLAN.md -- Consolidate CSS variable systems, fix contrast, remove next-themes, enforce dark-only
- [x] 18-02-PLAN.md -- Migrate admin components from hardcoded Tailwind colors to unified theme variables

### Phase 19: Interactive States & ARIA
**Goal**: Every interactive element communicates its state to all users (sighted and assistive tech)
**Depends on**: Phase 18 (theme variables available for focus/hover styling)
**Requirements**: A11Y-01, A11Y-02, A11Y-03
**Success Criteria** (what must be TRUE):
  1. Tabbing through any page shows a visible focus ring on every interactive element (buttons, links, inputs, tabs)
  2. No JavaScript onMouseEnter/onMouseLeave handlers remain -- all hover effects use Tailwind hover: classes
  3. Every icon-only button has an aria-label that describes its action (screen reader announces purpose)
**Plans**: 2 plans

Plans:
- [ ] 19-01-PLAN.md -- Focus-visible states, Tailwind color mappings, and hover class migration (21 files)
- [ ] 19-02-PLAN.md -- ARIA labels audit and fix for icon-only buttons, nav states, and tab roles

### Phase 20: Navigation & Wallet
**Goal**: Users can navigate all sections from any device and manage their wallet connection
**Depends on**: Phase 18 (theme variables for consistent styling)
**Requirements**: WALL-01, WALL-02, NAV-01, NAV-02, NAV-03
**Success Criteria** (what must be TRUE):
  1. Clicking the wallet button opens a dropdown with copy address, view on explorer, and disconnect options
  2. Selecting disconnect shows a confirmation dialog before actually disconnecting
  3. Market page is reachable from the main navigation sidebar and mobile bottom tabs
  4. Admin section has a responsive mobile navigation (hamburger menu or bottom tabs) that works on small screens
  5. Keeper wallets see an Admin link in the mobile bottom navigation
**Plans**: 2 plans

Plans:
- [x] 20-01-PLAN.md -- Wallet dropdown menu with copy address, explorer link, and disconnect confirmation dialog
- [x] 20-02-PLAN.md -- Market nav link, admin responsive mobile navigation, keeper admin link in bottom tabs

### Phase 21: User Flow Improvements
**Goal**: Users encounter clear disclosures before committing to actions and can complete KYC from profile
**Depends on**: Phase 18 (theme consistency)
**Requirements**: MINT-01, MINT-02, REDM-01, REDM-02, PROF-01, TRAD-01
**Success Criteria** (what must be TRUE):
  1. User sees "24-48 hour processing time" disclosure prominently before starting a mint
  2. User sees a disclaimer explaining that the admin sets the final price at fulfillment
  3. Starting a redeem flow checks KYC status first -- unverified users see a prompt to complete KYC before proceeding
  4. User can initiate and complete KYC verification directly from the Profile page (not only during redeem)
  5. Swap tab displays a "Coming Soon" badge with an explanation of what it will offer
**Plans**: 2 plans

Plans:
- [x] 21-01-PLAN.md -- Mint flow disclosures (processing time, price disclaimer) and swap Coming Soon label
- [x] 21-02-PLAN.md -- Redeem KYC pre-check gate and profile page KYC completion form

### Phase 22: Admin Enhancements
**Goal**: Admin can efficiently manage orders with reject/refund actions, enriched dashboard, and detailed views
**Depends on**: Phase 18 (theme consistency), Phase 19 (accessible interactive elements)
**Requirements**: ADMN-01, ADMN-02, ADMN-03, ADMN-04, ADMN-05, ADMN-06
**Success Criteria** (what must be TRUE):
  1. Admin can reject a mint order (calls refundMint) and cancel a redeem order (calls cancelRedeem) from the dashboard
  2. Admin dashboard shows a count badge for pending orders and alert indicators for orders needing attention
  3. Admin dashboard has quick action buttons that jump directly to the pending orders queue
  4. Admin order tables support text search, filter by caliber, and paginated navigation
  5. Admin can click any order row to see full details (wallet address, transaction history, KYC status, shipping info, timeline)
**Plans**: 2 plans

Plans:
- [ ] 22-01-PLAN.md -- Reject/refund actions, AlertDialog confirmations, and dashboard alert stat cards
- [ ] 22-02-PLAN.md -- Order detail drawer, table search, caliber filter, and pagination

### Phase 23: Landing Page & Cleanup
**Goal**: Landing page builds trust with visible social proof, and codebase is clean of oversized components
**Depends on**: Phase 18 (theme/contrast fixes)
**Requirements**: LAND-01, LAND-02, TRAD-02
**Success Criteria** (what must be TRUE):
  1. Trust strip text on the landing page is clearly readable against the dark background (adequate contrast)
  2. Landing page displays real social proof stats (total volume, registered users, rounds tokenized)
  3. Swap widget component is refactored into smaller sub-components (each under 300 lines)
**Plans**: TBD

Plans:
- [ ] 23-01: Landing page trust strip contrast and social proof stats
- [ ] 23-02: Swap widget component refactor

## Progress

**Execution Order:**
Phases execute in numeric order: 18 -> 19 -> 20 -> 21 -> 22 -> 23

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
| 22. Admin Enhancements | v1.4 | 0/2 | Not started | - |
| 23. Landing Page & Cleanup | v1.4 | 0/2 | Not started | - |

---

_Roadmap created: 2026-02-10_
_Last updated: 2026-02-16 (Phase 21 complete)_
