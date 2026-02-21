# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-21)

**Core value:** Anyone worldwide can get price exposure to U.S. ammunition by minting ammo tokens with USDC, while only verified U.S. residents in allowed states can redeem for physical delivery.
**Current focus:** Phase 29 - Security Hardening (v1.6 Audit Remediation)

## Current Position

Milestone: v1.6 Audit Remediation
Phase: 29 of 31 (Security Hardening)
Plan: 01 of 01 (Phase 29) -- PHASE COMPLETE
Status: Phase 29 Complete
Last activity: 2026-02-21 — Completed 29-01 (Security Hardening)

Progress: [█████░░░░░] 50% (v1.6)

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

## Accumulated Context

### Decisions

All decisions logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- [v1.6] Composite uniqueness (txHash + logIndex) replaces txHash-only order dedup
- [v1.6] Separate usdcAmount/tokenAmount fields replace single ambiguous amount column
- [v1.6] Contract changes (CNTR-01, CNTR-02) require Fuji redeployment in Phase 30
- [v1.6] Tests (Phase 31) come last since they exercise code from all prior phases
- [27-01] Used prisma migrate diff + deploy workflow for non-interactive migration
- [27-01] Wiped 7 testnet orders for clean schema migration
- [27-02] Self-healing finalization creates with tokenAmount only (usdcAmount unavailable from finalization args)
- [27-02] ActivityLog amount uses coalesce: usdcAmount ?? tokenAmount ?? "0"
- [28-01] Use BigInt() constructor (not n suffix) for ES2017 target compatibility
- [28-01] Activity updatedAt aliases createdAt (ActivityLog creation IS state change time)
- [28-01] totalSupply returned as integer string via BigInt division, not formatUnits
- [28-02] Activity feed amount is type-aware: MINT divides by 1e6 (USDC-wei), REDEEM divides by 1e18 (token-wei)
- [28-02] Shipping persistence uses PATCH /api/users/profile defaultShipping fields (no orderId at step 1)
- [28-02] Portfolio/dashboard display USDC for MINT, rounds for REDEEM (not raw coalesced value)
- [29-01] VALID_US_STATE_CODES typed as Set<string> for Zod transform compatibility
- [29-01] SIWE chainId checked post-verify (siwe library verify() does not accept chainId option)

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

Last session: 2026-02-21
Stopped at: Completed 29-01-PLAN.md (Security Hardening) -- Phase 29 complete
Resume file: None
