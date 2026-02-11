# Roadmap: Ammo Exchange

## Milestones

- ✅ **v1.0 Fuji Testnet Integration** -- Phases 1-6 (shipped 2026-02-11)
- **v1.1 End-to-End Flow Fix** -- Phases 7-8 (in progress)

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

### v1.1 End-to-End Flow Fix

**Milestone Goal:** Fix critical gaps that prevent the v1.0 mint flow from working end-to-end -- user creation on wallet connect and worker event indexing from the correct starting block.

- [ ] **Phase 7: Registration and Indexing Fixes** -- Fix user auto-creation and worker start block so both subsystems function correctly
- [ ] **Phase 8: End-to-End Verification** -- Verify the complete mint-to-finalize flow works from a user's perspective

## Phase Details

### Phase 7: Registration and Indexing Fixes
**Goal**: Users get a database record on first wallet connect, and the worker indexes events starting from the deployment block instead of scanning 51M empty blocks
**Depends on**: Phase 6 (v1.0 complete)
**Requirements**: REG-01, REG-02, IDX-01, IDX-02, IDX-03
**Success Criteria** (what must be TRUE):
  1. User connects wallet for the first time and a database record is created without any prior on-chain activity
  2. User's wallet address appears in API responses immediately after connecting
  3. Deployment start block (51699730) is available in shared config package
  4. Worker starts scanning from deployment block when block cursor is below it, not from block 0
  5. Worker logs show scan progress (blocks scanned, events found) during backfill
**Plans**: TBD

Plans:
- [ ] 07-01: User auto-registration on wallet connect
- [ ] 07-02: Deployment block config and worker indexing fix

### Phase 8: End-to-End Verification
**Goal**: A user can perform a complete mint flow -- from wallet connect through token minting to admin finalization -- and see correct status at every step
**Depends on**: Phase 7
**Requirements**: E2E-01, E2E-02
**Success Criteria** (what must be TRUE):
  1. User connects wallet, initiates a mint, and sees the pending order appear in their portfolio
  2. Admin sees the mint order in the admin dashboard order queue after the worker indexes the event
  3. Admin finalizes the mint order and the user's portfolio shows the order status updated to completed
**Plans**: TBD

Plans:
- [ ] 08-01: End-to-end mint flow verification and fixes

## Progress

**Execution Order:** Phase 7 then Phase 8.

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|---------------|--------|-----------|
| 1. Foundation | v1.0 | 2/2 | Complete | 2026-02-11 |
| 2. Event Indexer | v1.0 | 2/2 | Complete | 2026-02-11 |
| 3. Wallet and API Layer | v1.0 | 2/2 | Complete | 2026-02-11 |
| 4. Mint and Redeem Flows | v1.0 | 2/2 | Complete | 2026-02-11 |
| 5. Portfolio and Data Integration | v1.0 | 2/2 | Complete | 2026-02-11 |
| 6. Admin Dashboard | v1.0 | 2/2 | Complete | 2026-02-11 |
| 7. Registration and Indexing Fixes | v1.1 | 0/2 | Not started | - |
| 8. End-to-End Verification | v1.1 | 0/1 | Not started | - |

---
*Roadmap created: 2026-02-10*
*Last updated: 2026-02-11 (v1.1 milestone roadmap added)*
