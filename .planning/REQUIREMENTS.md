# Requirements: Ammo Exchange

**Defined:** 2026-02-16
**Core Value:** Anyone worldwide can get price exposure to U.S. ammunition by minting ammo tokens with USDC, while only verified U.S. residents in allowed states can redeem for physical delivery.

## v1.4 Requirements

Requirements for UI/UX Polish & Accessibility milestone. Each maps to roadmap phases.

### Wallet & Auth

- [ ] **WALL-01**: User sees a dropdown menu when clicking wallet button (copy address, view on explorer, disconnect)
- [ ] **WALL-02**: User must confirm before disconnecting wallet

### Accessibility

- [ ] **A11Y-01**: All interactive elements have focus-visible states (CSS, not inline JS)
- [ ] **A11Y-02**: All hover states use Tailwind hover: classes instead of onMouseEnter/onMouseLeave
- [ ] **A11Y-03**: Icon-only buttons have aria-label attributes
- [ ] **A11Y-04**: Color contrast meets WCAG AA (--text-muted upgraded to >=4.5:1 ratio)

### Theme & Design

- [ ] **THEME-01**: Single unified CSS variable system (consolidate shadcn + custom variables)
- [ ] **THEME-02**: Admin sidebar uses shared theme variables (not hardcoded Tailwind classes)
- [ ] **THEME-03**: Border radius uses consistent scale from CSS variables
- [ ] **THEME-04**: Dark-mode enforcement committed (remove unused theme toggle)

### Navigation

- [ ] **NAV-01**: Market page is accessible from main navigation
- [ ] **NAV-02**: Admin has responsive mobile navigation (hamburger or bottom tabs)
- [ ] **NAV-03**: Mobile bottom nav includes Admin link for keepers

### Mint Flow

- [ ] **MINT-01**: Processing time (24-48h) disclosed prominently before user starts mint
- [ ] **MINT-02**: Price disclaimer explains admin sets final price at fulfillment

### Redeem Flow

- [ ] **REDM-01**: KYC status checked at start of redeem flow (pre-check before Steps 0-1)
- [ ] **REDM-02**: User nudged to complete KYC before proceeding if not verified

### Admin

- [ ] **ADMN-01**: Admin can reject/refund a mint order (calls refundMint on contract)
- [ ] **ADMN-02**: Admin can cancel a redeem order (calls cancelRedeem on contract)
- [ ] **ADMN-03**: Admin dashboard shows pending order alerts and count badges
- [ ] **ADMN-04**: Admin dashboard has quick action buttons to jump to pending orders
- [ ] **ADMN-05**: Admin order tables have search, filter by caliber, and pagination
- [ ] **ADMN-06**: Admin can click an order to view full details (wallet, tx history, KYC, shipping, timeline)

### Profile

- [ ] **PROF-01**: User can complete KYC verification directly from profile page

### Trade

- [ ] **TRAD-01**: Swap tab clearly labeled "Coming Soon" with explanation
- [ ] **TRAD-02**: Swap widget refactored into smaller components (<300 lines each)

### Landing Page

- [ ] **LAND-01**: Trust strip text has adequate contrast (visible on dark background)
- [ ] **LAND-02**: Landing page shows social proof stats (total volume, users, rounds tokenized)

## Future Requirements

Deferred from UI/UX critique. Tracked but not in current roadmap.

### UX Enhancements

- **UX-01**: Landing page section reordering (Hero -> HowItWorks -> MarketTicker -> MarketCards)
- **UX-02**: Draft/pending order surfacing in portfolio with clear status distinction
- **UX-03**: Shipping time estimate shown earlier in redeem flow (before review step)

### Infrastructure

- **INFRA-01**: Email notification system for order status changes and shipping updates
- **INFRA-02**: User notification preferences configuration

## Out of Scope

| Feature                                     | Reason                                                        |
| ------------------------------------------- | ------------------------------------------------------------- |
| Light mode / theme toggle                   | Brand is dark-only, no user demand                            |
| Batch admin operations                      | Single order finalization sufficient for testnet volume       |
| Admin charts (mint/redeem volume over time) | Requires time-series data infrastructure, defer to production |
| Real-time order status push notifications   | WebSocket infrastructure not justified for testnet            |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase    | Status  |
| ----------- | -------- | ------- |
| THEME-01    | Phase 18 | Pending |
| THEME-02    | Phase 18 | Pending |
| THEME-03    | Phase 18 | Pending |
| THEME-04    | Phase 18 | Pending |
| A11Y-04     | Phase 18 | Pending |
| A11Y-01     | Phase 19 | Pending |
| A11Y-02     | Phase 19 | Pending |
| A11Y-03     | Phase 19 | Pending |
| WALL-01     | Phase 20 | Pending |
| WALL-02     | Phase 20 | Pending |
| NAV-01      | Phase 20 | Pending |
| NAV-02      | Phase 20 | Pending |
| NAV-03      | Phase 20 | Pending |
| MINT-01     | Phase 21 | Pending |
| MINT-02     | Phase 21 | Pending |
| REDM-01     | Phase 21 | Pending |
| REDM-02     | Phase 21 | Pending |
| PROF-01     | Phase 21 | Pending |
| TRAD-01     | Phase 21 | Pending |
| ADMN-01     | Phase 22 | Pending |
| ADMN-02     | Phase 22 | Pending |
| ADMN-03     | Phase 22 | Pending |
| ADMN-04     | Phase 22 | Pending |
| ADMN-05     | Phase 22 | Pending |
| ADMN-06     | Phase 22 | Pending |
| LAND-01     | Phase 23 | Pending |
| LAND-02     | Phase 23 | Pending |
| TRAD-02     | Phase 23 | Pending |

**Coverage:**

- v1.4 requirements: 28 total
- Mapped to phases: 28
- Unmapped: 0

---

_Requirements defined: 2026-02-16_
_Last updated: 2026-02-16 after roadmap creation_
