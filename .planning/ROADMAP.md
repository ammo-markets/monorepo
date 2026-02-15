# Roadmap: Ammo Exchange

## Milestones

- ✅ **v1.0 Fuji Testnet Integration** -- Phases 1-6 (shipped 2026-02-11)
- ✅ **v1.1 End-to-End Flow Fix** -- Phase 7 (shipped 2026-02-15)
- **v1.2 Production Hardening** -- Phases 9-11 (in progress)

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

### v1.2 Production Hardening

**Milestone Goal:** Fix all security, stability, and code quality gaps identified in senior developer review -- make the protocol deployable to production.

- [ ] **Phase 9: Authentication and API Hardening** -- SIWE auth on all routes, admin authorization, rate limiting, CORS, and registration race fix
- [ ] **Phase 10: Worker Hardening** -- Complete event coverage, retry logic, reorg protection, startup validation, graceful shutdown
- [ ] **Phase 11: Frontend Data Layer and Quality** -- TanStack Query migration, error boundaries, cache invalidation, type safety fixes

## Phase Details

### Phase 9: Authentication and API Hardening
**Goal**: Every API request is authenticated and authorized -- no route trusts client-supplied data without server-side verification
**Depends on**: Phase 7 (v1.1 complete -- user registration exists)
**Requirements**: AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05, API-01, API-02, ERR-02
**Success Criteria** (what must be TRUE):
  1. User signs a SIWE message on first visit and subsequent API calls include a verified session
  2. Unauthenticated requests to any user-facing API route return 401 (not silently proceed with a fake address)
  3. Non-keeper wallet calling admin API routes gets 403 (not just a UI redirect)
  4. Rapid wallet connect/disconnect cycles do not create duplicate user records or crash the registration flow
  5. API requests from unknown origins are rejected, and repeated requests from the same client are rate-limited
**Plans**: TBD

Plans:
- [ ] 09-01: SIWE authentication infrastructure (session creation, middleware, cookie/token management)
- [ ] 09-02: Route protection and API hardening (apply auth to all routes, admin authz, KYC gate, shipping ownership, rate limiting, CORS)

### Phase 10: Worker Hardening
**Goal**: The event indexer handles every contract event reliably, recovers from RPC failures, and shuts down cleanly
**Depends on**: Nothing (independent app, can run in parallel with Phase 9)
**Requirements**: WRKR-01, WRKR-02, WRKR-03, WRKR-04, WRKR-05, WRKR-06, WRKR-07
**Success Criteria** (what must be TRUE):
  1. MintRefunded, RedeemCanceled, Paused, Unpaused, and fee update events are indexed and reflected in the database
  2. Worker retries RPC calls on transient failures (network timeout, 429) with exponential backoff instead of crashing
  3. Worker re-processes events within a confirmation window so shallow reorgs do not cause missed or phantom events
  4. Worker refuses to start if required environment variables are missing (fails fast with clear error message)
  5. Worker drains in-flight polling cycle on SIGTERM before exiting
**Plans**: TBD

Plans:
- [ ] 10-01: Complete event coverage (MintRefunded, RedeemCanceled, Paused, Unpaused, fee updates)
- [ ] 10-02: RPC resilience and operational hardening (retry logic, reorg protection, env validation, graceful shutdown)

### Phase 11: Frontend Data Layer and Quality
**Goal**: Every frontend component fetches data through TanStack Query with proper error handling, and all type safety issues are resolved
**Depends on**: Phase 9 (auth middleware changes how API calls are made -- requests need session tokens)
**Requirements**: DATA-01, DATA-02, DATA-03, DATA-04, ERR-01, QUAL-01, QUAL-02, QUAL-03, QUAL-04
**Success Criteria** (what must be TRUE):
  1. No component uses raw useEffect+fetch -- all data loading goes through TanStack Query hooks with loading/error states
  2. Admin finalize actions (mint, redeem) trigger cache invalidation so order tables update without manual refresh
  3. React Error Boundaries catch component crashes and show fallback UI instead of white-screening the entire app
  4. Zero `as any` casts remain in the codebase, transaction hooks use `enabled` flags, and fee constants come from the shared package
**Plans**: TBD

Plans:
- [ ] 11-01: TanStack Query migration and QueryClient configuration (replace all useEffect+fetch, configure retry/refetch, wire cache invalidation)
- [ ] 11-02: Error boundaries and code quality fixes (React Error Boundaries, remove as any, enabled flags, shared fee constants, remove unused imports)

## Progress

**Execution Order:** Phase 9 then Phase 10 then Phase 11. (Phase 10 could run in parallel with Phase 9 since it targets a separate app, but sequential is simpler for solo dev.)

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|---------------|--------|-----------|
| 1. Foundation | v1.0 | 2/2 | Complete | 2026-02-11 |
| 2. Event Indexer | v1.0 | 2/2 | Complete | 2026-02-11 |
| 3. Wallet and API Layer | v1.0 | 2/2 | Complete | 2026-02-11 |
| 4. Mint and Redeem Flows | v1.0 | 2/2 | Complete | 2026-02-11 |
| 5. Portfolio and Data Integration | v1.0 | 2/2 | Complete | 2026-02-11 |
| 6. Admin Dashboard | v1.0 | 2/2 | Complete | 2026-02-11 |
| 7. Registration and Indexing Fixes | v1.1 | 2/2 | Complete | 2026-02-15 |
| 9. Authentication and API Hardening | v1.2 | 0/2 | Not started | - |
| 10. Worker Hardening | v1.2 | 0/2 | Not started | - |
| 11. Frontend Data Layer and Quality | v1.2 | 0/2 | Not started | - |

---
*Roadmap created: 2026-02-10*
*Last updated: 2026-02-15 (v1.2 Production Hardening roadmap created)*
