# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-16)

**Core value:** Anyone worldwide can get price exposure to U.S. ammunition by minting ammo tokens with USDC, while only verified U.S. residents in allowed states can redeem for physical delivery.
**Current focus:** Phase 23 - Landing Page Cleanup

## Current Position

Milestone: v1.4 UI/UX Polish & Accessibility
Phase: 23 of 23 (Landing Page Cleanup)
Plan: 2 of 2 in current phase
Status: Executing
Last activity: 2026-02-16 - Completed quick task 2: Add Get Test USDC faucet button

Progress: [##########] 100% (12/12 v1.4 plans)

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

## Accumulated Context

### Decisions

All decisions logged in PROJECT.md Key Decisions table.

- [18-01] Kept @custom-variant dark line (15 shadcn components use dark: prefixes)
- [18-01] Upgraded --text-muted to #8585a0 and --muted-foreground to oklch(0.63) for WCAG AA
- [18-02] KycBadge NONE/default uses CSS variables; semantic green/yellow/red preserved as Tailwind
- [18-02] Primary action buttons use --brass bg with --bg-primary text for contrast
- [19-02] Used aria-current="page" on active nav links per WAI-ARIA spec
- [19-02] Changed time-range-selector from role="group" to role="tablist" for semantic correctness
- [19-02] Added aria-labels to wallet button states for mobile accessibility (text hidden via sm:inline)
- [Phase 19-01]: Mapped 6 new Tailwind colors from CSS variables (border-hover, border-active, border-default, text-primary, text-secondary, text-muted)
- [Phase 19-01]: Used className template literals with ternary for conditional hover states (active vs inactive)
- [Phase 19-01]: Applied global focus-visible outline to raw interactive elements for keyboard a11y
- [20-01] Used AVALANCHE_FUJI.blockExplorers.default for explorer URL (testnet-appropriate)
- [20-01] AlertDialog confirmation pattern for destructive wallet actions
- [20-02] Used BarChart3 icon for Market nav item (charts-appropriate)
- [20-02] Dynamic grid-cols-5/6 for mobile tabs based on keeper status
- [20-02] Admin mobile nav uses collapsible dropdown rather than sheet/drawer for simplicity
- [21-01] Used borderLeft muted color for price disclaimer to differentiate from processing time warning
- [21-01] Badge text "Soon" instead of full "Coming Soon" to keep tab compact
- [21-02] KYC gate as banner above Step 0 (not separate step) to avoid renumbering
- [21-02] PENDING users allowed past Step 0 (they hit Step 2 KYC check)
- [21-02] Profile page invalidates both kyc and profile queries on KYC submit
- [22-01] Used reasonCode=1 default for on-chain refundMint/cancelRedeem (ABI requires uint8 param)
- [22-01] Pending stat cards use Link component for client-side navigation to order tables
- [22-02] Added status/updatedAt to order type interfaces for all-status display
- [22-02] Actions column only shows buttons for PENDING orders; empty for other statuses
- [23-01] Used totalVolumeRounds instead of totalVolumeUsdc (Order model lacks usdcAmount field)
- [23-01] formatCount helper with + suffix for social proof stats (1.2K+, 10K+)
- [23-02] Pure structural refactor of swap-widget -- no behavior/style/logic changes

### Pending Todos

None.

### Blockers/Concerns

None.

### Quick Tasks Completed

| #   | Description                                                             | Date       | Commit  | Directory                                                                                         |
| --- | ----------------------------------------------------------------------- | ---------- | ------- | ------------------------------------------------------------------------------------------------- |
| 1   | Refactor manual fetch mutations to use TanStack Query useMutation hooks | 2026-02-15 | 94bf174 | [1-refactor-manual-fetch-mutations-to-use-t](./quick/1-refactor-manual-fetch-mutations-to-use-t/) |
| 2   | Add Get Test USDC faucet button to dashboard for Fuji testnet           | 2026-02-16 | 91292a6 | [2-add-get-test-usdc-faucet-button-to-ui-fo](./quick/2-add-get-test-usdc-faucet-button-to-ui-fo/) |

## Session Continuity

Last session: 2026-02-16
Stopped at: Completed quick task 2 (USDC faucet button)
Resume file: None
