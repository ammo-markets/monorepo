# Requirements: Ammo Exchange

**Defined:** 2026-02-15
**Core Value:** Anyone worldwide can get price exposure to U.S. ammunition by minting ammo tokens with USDC, while only verified U.S. residents in allowed states can redeem for physical delivery.

## v1.2 Requirements

Requirements for v1.2 Production Hardening. Each maps to roadmap phases.

### Authentication & Authorization

- [ ] **AUTH-01**: User can authenticate via SIWE (Sign-In with Ethereum) to prove wallet ownership
- [ ] **AUTH-02**: All user-facing API routes verify SIWE session before processing requests
- [ ] **AUTH-03**: Admin API routes verify caller is a keeper wallet server-side
- [ ] **AUTH-04**: KYC auto-approve endpoint is gated behind testnet environment check
- [ ] **AUTH-05**: Shipping address endpoint verifies caller owns the order

### Worker Hardening

- [ ] **WRKR-01**: Worker handles MintRefunded and RedeemCanceled events
- [ ] **WRKR-02**: Worker handles Paused/Unpaused events
- [ ] **WRKR-03**: Worker handles fee update events
- [ ] **WRKR-04**: RPC calls retry with exponential backoff and circuit breaker
- [ ] **WRKR-05**: Worker has chain reorg protection (re-process confirmation window)
- [ ] **WRKR-06**: Worker validates environment variables at startup
- [ ] **WRKR-07**: Worker graceful shutdown drains in-flight work

### Frontend Data Layer

- [ ] **DATA-01**: All components use TanStack Query instead of useEffect+fetch
- [ ] **DATA-02**: Silent error swallowing replaced with proper error handling
- [ ] **DATA-03**: Admin mutations invalidate query caches
- [ ] **DATA-04**: QueryClient configured with retry and refetch tuning

### API Hardening

- [ ] **API-01**: Rate limiting middleware on API routes
- [ ] **API-02**: CORS headers configured for known origins

### Error Handling & Resilience

- [ ] **ERR-01**: React Error Boundaries on major feature sections
- [ ] **ERR-02**: Wallet registration race condition fixed

### Code Quality

- [ ] **QUAL-01**: Type safety fixed (remove as any casts)
- [ ] **QUAL-02**: Transaction hooks use idiomatic enabled flags
- [ ] **QUAL-03**: Fee constants from shared package instead of magic numbers
- [ ] **QUAL-04**: Remove unused React import

## v1.1 Requirements (Shipped)

### User Registration

- [x] **REG-01**: User record is auto-created in database when wallet connects for the first time
- [x] **REG-02**: User can see their wallet address reflected in API responses after connecting

### Event Indexing

- [x] **IDX-01**: Deployment start block (51699730) is stored in shared config
- [x] **IDX-02**: Worker uses deployment block as floor
- [x] **IDX-03**: Worker logs progress during backfill

## Future Requirements

Deferred to future milestones. Tracked but not in current roadmap.

### Production Readiness

- **PROD-01**: Real KYC provider integration (Persona, Jumio)
- **PROD-02**: Mainnet deployment
- **PROD-03**: Real Ammo Squared API integration
- **PROD-04**: Price oracle contract implementation

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| New smart contracts or ABI changes | Contracts are deployed and working -- app-layer only |
| New UI pages or features | Focus on hardening existing flows, not adding new ones |
| Real KYC provider | Auto-approve sufficient for testnet -- PROD-01 deferred |
| Mainnet deployment | Fix security first, deploy later |
| Structured logging (pino/winston) | console.log with better messages sufficient for now |
| Loading skeletons in admin tables | Nice-to-have, not a production blocker |
| Worker auto-finalization | Single order finalization sufficient for testnet |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUTH-01 | TBD | Pending |
| AUTH-02 | TBD | Pending |
| AUTH-03 | TBD | Pending |
| AUTH-04 | TBD | Pending |
| AUTH-05 | TBD | Pending |
| WRKR-01 | TBD | Pending |
| WRKR-02 | TBD | Pending |
| WRKR-03 | TBD | Pending |
| WRKR-04 | TBD | Pending |
| WRKR-05 | TBD | Pending |
| WRKR-06 | TBD | Pending |
| WRKR-07 | TBD | Pending |
| DATA-01 | TBD | Pending |
| DATA-02 | TBD | Pending |
| DATA-03 | TBD | Pending |
| DATA-04 | TBD | Pending |
| API-01 | TBD | Pending |
| API-02 | TBD | Pending |
| ERR-01 | TBD | Pending |
| ERR-02 | TBD | Pending |
| QUAL-01 | TBD | Pending |
| QUAL-02 | TBD | Pending |
| QUAL-03 | TBD | Pending |
| QUAL-04 | TBD | Pending |

**Coverage:**
- v1.2 requirements: 26 total
- Mapped to phases: 0
- Unmapped: 26 ⚠️

---
*Requirements defined: 2026-02-15*
*Last updated: 2026-02-15 after initial definition*
