# Requirements: Ammo Exchange Pitch Deck

**Defined:** 2026-02-17
**Core Value:** Anyone worldwide can get price exposure to U.S. ammunition by minting ammo tokens with USDC, while only verified U.S. residents in allowed states can redeem for physical delivery.

## v1.5 Requirements

Requirements for the Pitch Deck milestone. Each maps to roadmap phases.

### Setup & Foundation

- [ ] **SETUP-01**: Pitch deck app scaffolded at `apps/pitchdeck` with Next.js 15, Tailwind v4, and static export (`output: "export"`)
- [ ] **SETUP-02**: Hex-only CSS theme matching ammo-exchange brass/dark palette (no oklch colors)
- [ ] **SETUP-03**: Turborepo integration with correct build deps (shared package only, port 3001)

### Slide Content

- [ ] **SLIDE-01**: Cover slide with brand identity, tagline, and 5-second hook
- [ ] **SLIDE-02**: Problem slide presenting $8B ammunition market pain points
- [ ] **SLIDE-03**: Interactive 9mm price volatility chart with historical data (Recharts)
- [ ] **SLIDE-04**: Solution slide — USDC in, tokens out, redeem for physical delivery
- [ ] **SLIDE-05**: How It Works — 2-step async mint/redeem flow with per-caliber tokens
- [ ] **SLIDE-06**: Market Opportunity — TAM/SAM/SOM with buyer statistics
- [ ] **SLIDE-07**: Competitive Landscape — "PAXG for ammunition" positioning vs AmmoSeek/AmmoSquared
- [ ] **SLIDE-08**: Revenue Model — fee structure table and unit economics
- [ ] **SLIDE-09**: Traction/Demo slide with live testnet link CTA to Fuji dashboard
- [ ] **SLIDE-10**: Regulatory Positioning — no FFL required, KYC at redemption, token classification
- [ ] **SLIDE-11**: Roadmap — protocol development timeline and milestones
- [ ] **SLIDE-12**: Team slide with placeholder bios
- [ ] **SLIDE-13**: Ask/CTA — general call-to-action for investors and partners

### Navigation & Interaction

- [ ] **NAV-01**: Keyboard navigation (ArrowLeft/Right, Space, Home/End)
- [ ] **NAV-02**: Slide counter and progress indicator
- [ ] **NAV-03**: CSS slide transitions (opacity + translateX, no animation library)
- [ ] **NAV-04**: Prev/Next click controls

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

- **VIS-01**: Animated protocol flow visualization on How It Works slide
- **VIS-02**: Live on-chain metrics feed from Fuji testnet

### Analytics

- **ANLY-01**: Custom view analytics for tracking investor engagement

## Out of Scope

| Feature | Reason |
|---------|--------|
| Presentation editor/CMS | Content changes quarterly; edit the code directly |
| Presenter mode / speaker notes | Unnecessary complexity for investor distribution |
| Slide transitions beyond CSS | Framer Motion adds 30KB+ for one transition effect |
| Embedded dApp in deck | Link out to Fuji dashboard instead — keeps deck lightweight |
| Multi-language support | English-only for U.S.-focused initial investor outreach |
| Tokenomics slides | Deferred in whitepaper; including them invites securities scrutiny |
| Dark mode toggle | Deck is always dark theme (brass/dark brand) |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| SETUP-01 | Phase 24 | Pending |
| SETUP-02 | Phase 24 | Pending |
| SETUP-03 | Phase 24 | Pending |
| SLIDE-01 | Phase 25 | Pending |
| SLIDE-02 | Phase 25 | Pending |
| SLIDE-03 | Phase 25 | Pending |
| SLIDE-04 | Phase 25 | Pending |
| SLIDE-05 | Phase 25 | Pending |
| SLIDE-06 | Phase 25 | Pending |
| SLIDE-07 | Phase 25 | Pending |
| SLIDE-08 | Phase 25 | Pending |
| SLIDE-09 | Phase 25 | Pending |
| SLIDE-10 | Phase 25 | Pending |
| SLIDE-11 | Phase 25 | Pending |
| SLIDE-12 | Phase 25 | Pending |
| SLIDE-13 | Phase 25 | Pending |
| NAV-01 | Phase 25 | Pending |
| NAV-02 | Phase 25 | Pending |
| NAV-03 | Phase 25 | Pending |
| NAV-04 | Phase 25 | Pending |
| PDF-01 | Phase 26 | Pending |
| PDF-02 | Phase 26 | Pending |
| PDF-03 | Phase 26 | Pending |
| DEPLOY-01 | Phase 26 | Pending |

**Coverage:**
- v1.5 requirements: 24 total
- Mapped to phases: 24
- Unmapped: 0

---
*Requirements defined: 2026-02-17*
*Last updated: 2026-02-17 after roadmap creation*
