# Requirements: Ammo Exchange

**Defined:** 2026-02-15
**Core Value:** Anyone worldwide can get price exposure to U.S. ammunition by minting ammo tokens with USDC, while only verified U.S. residents in allowed states can redeem for physical delivery.

## v1.3 Requirements

Requirements for UX Restructure & Data Enrichment milestone. Each maps to roadmap phases.

### Landing Page

- [x] **LAND-01**: Visitor sees hero section with protocol tagline and "Launch App" CTA
- [x] **LAND-02**: Visitor sees how-it-works section explaining mint/trade/redeem in 3-4 visual steps
- [x] **LAND-03**: Visitor sees caliber showcase displaying all 4 calibers with specs and current prices
- [x] **LAND-04**: Visitor sees FAQ section answering common questions about the protocol

### App Shell

- [x] **SHELL-01**: Next.js route groups split landing (public) and app (wallet-connected) with distinct layouts
- [x] **SHELL-02**: App has 4-tab navigation: Dashboard, Trade, Portfolio, Profile with active state indicators
- [x] **SHELL-03**: App routes redirect to landing page if wallet is not connected
- [x] **SHELL-04**: Navigation is responsive -- sidebar on desktop, bottom tabs on mobile

### Dashboard

- [x] **DASH-01**: User sees token balances for all calibers with USD value on dashboard
- [x] **DASH-02**: User sees last 5 orders with status, amount, and timestamp on dashboard
- [x] **DASH-03**: User can initiate Mint or Redeem from dashboard quick action buttons
- [x] **DASH-04**: User sees a banner alerting them to pending orders that need attention

### Trade

- [x] **TRADE-01**: User can select caliber with inline specs (grain, type, min order) and current price
- [x] **TRADE-02**: User can switch between Mint and Redeem via tabs on a unified Trade page
- [x] **TRADE-03**: User can access swap widget for token trading on the Trade page
- [x] **TRADE-04**: User sees order summary with fees, amounts, and total before confirming

### Database

- [x] **DB-01**: ProtocolStats table stores aggregate metrics (total minted/redeemed per caliber, user count, volume)
- [x] **DB-02**: ActivityLog table stores human-readable transaction history with descriptions and status changes
- [x] **DB-03**: UserPreference table stores favorite calibers, display settings, and notification preferences
- [x] **DB-04**: Worker job periodically computes and caches protocol stats from chain and DB data

## Future Requirements

Deferred to future release. Tracked but not in current roadmap.

### Market Data

- **MKT-01**: Price history stored for all calibers (7d, 30d, 90d)
- **MKT-02**: Price charts on caliber detail and trade pages
- **MKT-03**: 24h price change indicators on dashboard and trade page

### Notifications

- **NOTF-01**: User receives in-app notifications for order status changes
- **NOTF-02**: User can configure notification preferences (email, in-app)

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature                          | Reason                                                                 |
| -------------------------------- | ---------------------------------------------------------------------- |
| Price history charts             | Requires oracle price feed infrastructure -- defer to future milestone |
| Real-time WebSocket updates      | Polling sufficient for testnet, real-time premature                    |
| Dark mode / theming              | Nice to have but not core to UX restructure                            |
| Social features                  | Not relevant to DeFi protocol UX                                       |
| Mobile app                       | Web-first, responsive design covers mobile browsers                    |
| Separate landing site deployment | Same Next.js app with route groups is simpler                          |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase    | Status   |
| ----------- | -------- | -------- |
| LAND-01     | Phase 16 | Complete |
| LAND-02     | Phase 16 | Complete |
| LAND-03     | Phase 16 | Complete |
| LAND-04     | Phase 16 | Complete |
| SHELL-01    | Phase 13 | Complete |
| SHELL-02    | Phase 13 | Complete |
| SHELL-03    | Phase 13 | Complete |
| SHELL-04    | Phase 13 | Complete |
| DASH-01     | Phase 14 | Complete |
| DASH-02     | Phase 14 | Complete |
| DASH-03     | Phase 14 | Complete |
| DASH-04     | Phase 14 | Complete |
| TRADE-01    | Phase 15 | Complete |
| TRADE-02    | Phase 15 | Complete |
| TRADE-03    | Phase 15 | Complete |
| TRADE-04    | Phase 15 | Complete |
| DB-01       | Phase 12 | Complete |
| DB-02       | Phase 12 | Complete |
| DB-03       | Phase 12 | Complete |
| DB-04       | Phase 12 | Complete |

**Coverage:**

- v1.3 requirements: 20 total
- Mapped to phases: 20
- Unmapped: 0

---

_Requirements defined: 2026-02-15_
_Last updated: 2026-02-16 — all v1.3 requirements complete_
