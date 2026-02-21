# Requirements: Ammo Exchange Pitch Deck

**Defined:** 2026-02-17
**Core Value:** Anyone worldwide can get price exposure to U.S. ammunition by minting ammo tokens with USDC, while only verified U.S. residents in allowed states can redeem for physical delivery.

## v1.5 Requirements

Requirements for the Pitch Deck milestone. Each maps to roadmap phases.

### Setup & Foundation

- [x] **SETUP-01**: Pitch deck app scaffolded at `apps/pitchdeck` with Next.js 15, Tailwind v4, and static export (`output: "export"`)
- [x] **SETUP-02**: Hex-only CSS theme matching ammo-exchange brass/dark palette (no oklch colors)
- [x] **SETUP-03**: Turborepo integration with correct build deps (shared package only, port 3001)

### Slide Content

- [x] **SLIDE-01**: Cover slide with brand identity, tagline, and 5-second hook
- [x] **SLIDE-02**: Problem slide presenting $8B ammunition market pain points
- [x] **SLIDE-03**: Why Now slide — market timing narrative with ammunition demand trends and crypto convergence
- [x] **SLIDE-04**: Market Opportunity — TAM/SAM/SOM with buyer statistics
- [x] **SLIDE-05**: Buyer Personas — target customer profiles (institutional, retail, international)
- [x] **SLIDE-06**: Solution slide — USDC in, tokens out, redeem for physical delivery
- [x] **SLIDE-07**: Revenue Model — fee structure table and unit economics
- [x] **SLIDE-08**: Competitive Landscape — "PAXG for ammunition" positioning vs AmmoSeek/AmmoSquared
- [x] **SLIDE-09**: Traction/Demo slide with live testnet link CTA to Fuji dashboard
- [x] **SLIDE-10**: Regulatory Positioning — no FFL required, KYC at redemption, token classification
- [x] **SLIDE-11**: Roadmap — protocol development timeline and milestones
- [x] **SLIDE-12**: Ask/CTA — general call-to-action for investors and partners
- [x] **SLIDE-13**: Close slide — final brand impression with contact details

### Navigation & Interaction

- [x] **NAV-01**: Keyboard navigation (ArrowLeft/Right, Space, Home/End)
- [x] **NAV-02**: Slide counter and progress indicator
- [x] **NAV-03**: Slide transitions via framer-motion (opacity + translateX, smooth visual change)
- [x] **NAV-04**: Prev/Next click controls

### PDF Export

- [ ] **PDF-01**: Client-side PDF export via html2canvas-pro + jsPDF (all 13 slides)
- [ ] **PDF-02**: Off-screen rendering at 1920x1080 with scale:2 for crisp text
- [ ] **PDF-03**: Export progress indicator during PDF generation

### Deployment

- [ ] **DEPLOY-01**: Static export deployable to Vercel at shareable investor URL

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Personalization

- **PERS-01**: URL parameter personalization (?investor=Name shows "Prepared for [Name]" on cover)

### Advanced Visuals

- **VIS-01**: Animated protocol flow visualization on solution slide
- **VIS-02**: Live on-chain metrics feed from Fuji testnet

### Analytics

- **ANLY-01**: Custom view analytics for tracking investor engagement

## Out of Scope

| Feature | Reason |
|---------|--------|
| Presentation editor/CMS | Content changes quarterly; edit the code directly |
| Presenter mode / speaker notes | Unnecessary complexity for investor distribution |
| Embedded dApp in deck | Link out to Fuji dashboard instead — keeps deck lightweight |
| Multi-language support | English-only for U.S.-focused initial investor outreach |
| Tokenomics slides | Deferred in whitepaper; including them invites securities scrutiny |
| Dark mode toggle | Deck is always dark theme (brass/dark brand) |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| SETUP-01 | Phase 24 | Satisfied |
| SETUP-02 | Phase 24 | Satisfied |
| SETUP-03 | Phase 24 | Satisfied |
| SLIDE-01 | Phase 25 | Satisfied |
| SLIDE-02 | Phase 25 | Satisfied |
| SLIDE-03 | Phase 25 | Satisfied |
| SLIDE-04 | Phase 25 | Satisfied |
| SLIDE-05 | Phase 25 | Satisfied |
| SLIDE-06 | Phase 25 | Satisfied |
| SLIDE-07 | Phase 25 | Satisfied |
| SLIDE-08 | Phase 25 | Satisfied |
| SLIDE-09 | Phase 25 | Satisfied |
| SLIDE-10 | Phase 25 | Satisfied |
| SLIDE-11 | Phase 25 | Satisfied |
| SLIDE-12 | Phase 25 | Satisfied |
| SLIDE-13 | Phase 25 | Satisfied |
| NAV-01 | Phase 25 | Satisfied |
| NAV-02 | Phase 25 | Satisfied |
| NAV-03 | Phase 25 | Satisfied |
| NAV-04 | Phase 25 | Satisfied |
| PDF-01 | Phase 26 | Pending |
| PDF-02 | Phase 26 | Pending |
| PDF-03 | Phase 26 | Pending |
| DEPLOY-01 | Phase 26 | Pending |

**Coverage:**
- v1.5 requirements: 24 total
- Satisfied: 20 (Phases 24-25 complete)
- Pending: 4 (Phase 26)
- Unmapped: 0

---
*Requirements defined: 2026-02-17*
*Last updated: 2026-02-21 — slide requirements updated to match creative rewrite (WhyNow, Personas, Close replaced Volatility, HowItWorks, Team)*
