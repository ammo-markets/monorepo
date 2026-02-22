# Requirements: Ammo Exchange

**Defined:** 2026-02-22
**Core Value:** Anyone worldwide can get price exposure to U.S. ammunition by minting ammo tokens with USDC, while only verified U.S. residents in allowed states can redeem for physical delivery.

## v1.7 Requirements

Requirements for Contract Rollback milestone. Removes oracle sanity check from finalizeMint and rolls back to pre-30-01 deployed contracts.

### Contract

- [ ] **CNTR-01**: CaliberMarket.sol reverted to pre-30-01 state (no DeadlineInPast error, no oracle price query in finalizeMint, no maxPriceDeviationBps state variable, no setMaxPriceDeviation function, no PriceTooLow/PriceTooHigh errors)
- [ ] **CNTR-02**: Foundry tests updated to remove tests for DeadlineInPast, PriceTooLow, PriceTooHigh, and setMaxPriceDeviation
- [ ] **CNTR-03**: CaliberMarket ABI regenerated from reverted contract source and exported to packages/contracts/src/abis/

### Config

- [ ] **CONF-01**: Fuji contract addresses in shared config rolled back to old deployment (manager, factory, usdc, 4 markets, 4 tokens — 15 addresses total)
- [ ] **CONF-02**: Fuji deployment block reverted to 51699730

### Frontend

- [ ] **FEND-01**: DeadlineInPast, PriceTooLow, PriceTooHigh removed from CONTRACT_ERROR_MESSAGES in apps/web/lib/errors.ts

### Database

- [ ] **DATA-01**: Testnet order data from new deployment block range (52030756+) cleaned up if any exists

## Future Requirements

None — this is a focused rollback milestone.

## Out of Scope

| Feature | Reason |
|---------|--------|
| Contract redeployment | Rolling back to existing old deployment — no new deploy needed |
| Oracle removal from startMint | Oracle at startMint provides baseline price for slippage calc — useful and correct |
| Worker code changes | Phase 30-02 improvements (gap backfill, config-driven calibers) are contract-independent |
| New contract features | This milestone only removes incorrect guards |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| CNTR-01 | Phase 32 | Pending |
| CNTR-02 | Phase 32 | Pending |
| CNTR-03 | Phase 32 | Pending |
| CONF-01 | Phase 32 | Pending |
| CONF-02 | Phase 32 | Pending |
| FEND-01 | Phase 32 | Pending |
| DATA-01 | Phase 32 | Pending |

**Coverage:**
- v1.7 requirements: 7 total
- Mapped to phases: 7
- Unmapped: 0 ✓

---
*Requirements defined: 2026-02-22*
*Last updated: 2026-02-22 after initial definition*
