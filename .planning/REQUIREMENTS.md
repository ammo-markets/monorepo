# Requirements: Ammo Exchange

**Defined:** 2026-02-21
**Core Value:** Anyone worldwide can get price exposure to U.S. ammunition by minting ammo tokens with USDC, while only verified U.S. residents in allowed states can redeem for physical delivery.

## v1.6 Requirements

Requirements for Audit Remediation milestone. Each maps to roadmap phases.

### Data Correctness

- [ ] **DATA-01**: Worker indexes orders with composite uniqueness (txHash + logIndex), so multiple events in one transaction each create distinct order records
- [ ] **DATA-02**: Order schema stores separate `usdcAmount` and `tokenAmount` fields so mint and redeem amounts are unambiguous
- [ ] **DATA-03**: Worker handlers populate both amount fields correctly (USDC-wei from MintStarted, token-wei from RedeemRequested)
- [ ] **DATA-04**: All APIs and UI components render amounts using the correct field for context (USDC for cost, token for rounds)
- [ ] **DATA-05**: Activity API returns `updatedAt` timestamp so activity feed sorts by most recent state change
- [ ] **DATA-06**: Redeem flow persists shipping address to database via the existing shipping API before advancing to confirmation step

### Security Hardening

- [ ] **SEC-01**: KYC GET endpoint excludes gov ID number from API response (returns masked or status-only)
- [ ] **SEC-02**: KYC mutation hook throws on non-2xx responses so error boundaries and toast messages activate
- [ ] **SEC-03**: Rate limiter extracts client IP from trusted proxy chain only (not raw x-forwarded-for)
- [ ] **SEC-04**: State code input is uppercased and validated against known US state codes server-side before restricted-state comparison
- [ ] **SEC-05**: SIWE verification enforces expected domain, URI, and chain ID policy (not just nonce)

### Architecture Integrity

- [ ] **ARCH-01**: Stats and supply APIs format on-chain BigInt values as strings (no Number conversion that loses precision)
- [ ] **ARCH-02**: Caliber registry is sourced from config or factory events so newly deployed markets are automatically indexed and surfaced
- [ ] **ARCH-03**: Worker stats backfill detects and fills gaps in activity history instead of skipping when any rows exist

### Contract Hardening

- [ ] **CNTR-01**: CaliberMarket rejects startMint/startRedeem calls with deadlines in the past
- [ ] **CNTR-02**: CaliberMarket finalizeMint enforces price sanity bounds on keeper-supplied actualPriceX18 (e.g., within ±50% of last known price or configurable range)

### Test Coverage

- [ ] **TEST-01**: Worker event handlers have automated tests verifying idempotent replay (same event processed twice produces one order)
- [ ] **TEST-02**: Worker event handlers have automated tests verifying composite uniqueness (two events in one tx produce two orders)
- [ ] **TEST-03**: API auth tests verify unauthenticated requests are rejected, non-keeper requests to admin routes return 404
- [ ] **TEST-04**: API compliance tests verify restricted-state rejection, state normalization, KYC response masking
- [ ] **TEST-05**: E2E flow tests cover mint initiation, redeem initiation, and keeper finalization happy paths

## Future Requirements

### Monitoring & Observability

- **MON-01**: Structured logging with correlation IDs across worker and API
- **MON-02**: Health check endpoints for worker and API
- **MON-03**: Alerting on worker lag (BlockCursor falling behind chain head)

### Production Deployment

- **PROD-01**: Mainnet deployment with real USDC and verified contracts
- **PROD-02**: Redis-backed rate limiter for multi-instance deployment
- **PROD-03**: Real KYC provider integration (Persona or Jumio)

## Out of Scope

| Feature | Reason |
|---------|--------|
| Multi-chain indexing | Finding 1 notes future incompatibility; composite key fixes it but multi-chain support is out of scope for v1.6 |
| Real KYC provider | Auto-approve on testnet is sufficient; gov ID masking addresses the data leak |
| Mainnet deployment | Fuji is the target environment for this remediation cycle |
| Batch keeper operations | Single order finalization sufficient for testnet volume |
| WebSocket event streaming | Polling indexer is validated and reliable |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| DATA-01 | — | Pending |
| DATA-02 | — | Pending |
| DATA-03 | — | Pending |
| DATA-04 | — | Pending |
| DATA-05 | — | Pending |
| DATA-06 | — | Pending |
| SEC-01 | — | Pending |
| SEC-02 | — | Pending |
| SEC-03 | — | Pending |
| SEC-04 | — | Pending |
| SEC-05 | — | Pending |
| ARCH-01 | — | Pending |
| ARCH-02 | — | Pending |
| ARCH-03 | — | Pending |
| CNTR-01 | — | Pending |
| CNTR-02 | — | Pending |
| TEST-01 | — | Pending |
| TEST-02 | — | Pending |
| TEST-03 | — | Pending |
| TEST-04 | — | Pending |
| TEST-05 | — | Pending |

**Coverage:**
- v1.6 requirements: 21 total
- Mapped to phases: 0
- Unmapped: 21 ⚠️

---
*Requirements defined: 2026-02-21*
*Last updated: 2026-02-21 after initial definition*
