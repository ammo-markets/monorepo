# Requirements: Ammo Exchange

**Defined:** 2026-02-11
**Core Value:** Anyone worldwide can get price exposure to U.S. ammunition by minting ammo tokens with USDC, while only verified U.S. residents in allowed states can redeem for physical delivery.

## v1.1 Requirements

Requirements for v1.1 End-to-End Flow Fix. Each maps to roadmap phases.

### User Registration

- [ ] **REG-01**: User record is auto-created in database when wallet connects for the first time
- [ ] **REG-02**: User can see their wallet address reflected in API responses after connecting

### Event Indexing

- [ ] **IDX-01**: Deployment start block (51699730) is stored in shared config
- [ ] **IDX-02**: Worker uses deployment block as floor — if block cursor is below deployment block, start from deployment block
- [ ] **IDX-03**: Worker logs progress during backfill (blocks scanned, events found)

### End-to-End Verification

- [ ] **E2E-01**: User can connect wallet, mint tokens, and see the pending order in their portfolio
- [ ] **E2E-02**: Admin can finalize a mint order and user sees status update to completed

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
| New smart contracts or ABI changes | Contracts are deployed and working — this is app-layer only |
| New UI pages or features | Focus on fixing existing flows, not adding new ones |
| Batch operations or automated keeper | Single order finalization sufficient for testnet |
| Mobile app | Web only for now |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| REG-01 | — | Pending |
| REG-02 | — | Pending |
| IDX-01 | — | Pending |
| IDX-02 | — | Pending |
| IDX-03 | — | Pending |
| E2E-01 | — | Pending |
| E2E-02 | — | Pending |

**Coverage:**
- v1.1 requirements: 7 total
- Mapped to phases: 0
- Unmapped: 7 ⚠️

---
*Requirements defined: 2026-02-11*
*Last updated: 2026-02-11 after initial definition*
