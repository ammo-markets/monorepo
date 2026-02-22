# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-22)

**Core value:** Anyone worldwide can get price exposure to U.S. ammunition by minting ammo tokens with USDC, while only verified U.S. residents in allowed states can redeem for physical delivery.
**Current focus:** v1.7 Contract Rollback -- Phase 32

## Current Position

Milestone: v1.7 Contract Rollback
Phase: 32 of 32 (Contract Rollback & Cleanup)
Plan: 1 of 1 in current phase
Status: Phase complete
Last activity: 2026-02-22 -- Completed 32-01 contract rollback

Progress: [██████████] 100% (v1.7)

## Performance Metrics

**v1.0 Velocity:**

- Total plans completed: 12
- Average duration: ~9 min
- Total execution time: ~2 hours

**v1.1 Velocity:**

- Total plans completed: 2
- Average duration: ~1.5 min
- Total execution time: ~3 min

**v1.2 Velocity:**

- Total plans completed: 10
- Average duration: ~3 min
- Total execution time: ~30 min

**v1.3 Velocity:**

- Total plans completed: 8
- Average duration: ~2.6 min
- Total execution time: ~21 min

**v1.4 Velocity:**

- Total plans completed: 12
- Average duration: ~2 min (estimated)
- Total execution time: ~24 min (estimated)

**v1.5 Velocity:**

- Total plans completed: 3
- Average duration: ~2 min
- Total execution time: ~6 min

**v1.6 Velocity:**

- Total plans completed: 8
- Total execution time: ~16 min (estimated)

## Accumulated Context

### Decisions

All decisions logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- [v1.7] Oracle sanity check in finalizeMint is incorrect for pre-PMF flow -- user's slippage guard (minTokensOut) is sufficient
- [v1.7] Roll back to old Fuji addresses (pre-30-01) instead of redeploying -- zero deployment needed
- [v1.7] Old contracts at block 51699730 include all audit fixes (63714d1) except 30-01 additions
- [v1.7] DeadlineInPast check not critical -- frontend can validate deadline client-side
- [v1.7] Phase 30-02 worker improvements (gap backfill, config-driven calibers) are contract-independent -- KEEP
- [v1.7] Oracle sanity check removed from finalizeMint -- user slippage guard sufficient for pre-PMF
- [v1.7] Rolled back to old Fuji deployment (block 51699730) instead of redeploying

### Pending Todos

None.

### Blockers/Concerns

None.

### Quick Tasks Completed

| #   | Description                                                                         | Date       | Commit  | Directory                                                                                         |
| --- | ----------------------------------------------------------------------------------- | ---------- | ------- | ------------------------------------------------------------------------------------------------- |
| 1   | Refactor manual fetch mutations to use TanStack Query useMutation hooks             | 2026-02-15 | 94bf174 | [1-refactor-manual-fetch-mutations-to-use-t](./quick/1-refactor-manual-fetch-mutations-to-use-t/) |
| 2   | Add Get Test USDC faucet button to dashboard for Fuji testnet                       | 2026-02-16 | 91292a6 | [2-add-get-test-usdc-faucet-button-to-ui-fo](./quick/2-add-get-test-usdc-faucet-button-to-ui-fo/) |
| 3   | Fix wallet connection UX -- connector selection dialog instead of Phantom auto-open | 2026-02-21 | ef192cd | [3-fix-wallet-connection-ux-switch-to-fuji-](./quick/3-fix-wallet-connection-ux-switch-to-fuji-/) |

## Session Continuity

Last session: 2026-02-22
Stopped at: Completed 32-01-PLAN.md (Contract Rollback)
Resume file: None
