---
phase: 01-foundation
plan: 01
subsystem: contracts
tags: [solidity, foundry, fuji, avalanche, deployment, mock-usdc, price-oracle]

# Dependency graph
requires: []
provides:
  - MockUSDC ERC20 contract with public faucet for testnet
  - Deployable MockPriceOracle for testnet caliber pricing
  - DeployFuji.s.sol single-command deployment script
  - Makefile with dry-run and broadcast targets
  - All contracts deployed to Fuji testnet with verified addresses
affects: [01-02, shared-config, worker, web]

# Tech tracking
tech-stack:
  added: [forge-script, makefile]
  patterns: [single-script-deployment, mock-contracts-for-testnet, deployer-as-all-roles]

key-files:
  created:
    - packages/contracts/src/MockUSDC.sol
    - packages/contracts/src/MockPriceOracle.sol
    - packages/contracts/script/DeployFuji.s.sol
    - packages/contracts/Makefile
  modified:
    - packages/contracts/foundry.toml

key-decisions:
  - "Used hand-rolled ERC20 for MockUSDC (not OpenZeppelin) matching project convention"
  - "Set deployer as treasury, guardian, keeper, and feeRecipient for testnet simplicity"
  - "Used evm_version = cancun in foundry.toml for Avalanche C-Chain compatibility"
  - "Used avascan.info API for contract verification (routescan/snowtrace endpoint)"

patterns-established:
  - "Deploy scripts in packages/contracts/script/ using Foundry Script pattern"
  - "Makefile targets for dry-run (fuji_check) and broadcast (fuji_deploy)"
  - "Mock contracts in src/ for deployment, test mocks in test/ for unit tests"

# Metrics
duration: ~45min
completed: 2026-02-11
---

# Phase 1 Plan 1: Fuji Deployment Summary

**MockUSDC, MockPriceOracle, and full protocol deployment to Avalanche Fuji testnet with 4 caliber markets (9MM, 556, 22LR, 308)**

## Performance

- **Duration:** ~45 min (across 2 agent sessions + human deployment)
- **Started:** 2026-02-11T00:07:00Z
- **Completed:** 2026-02-11T00:49:07Z
- **Tasks:** 3 (2 auto + 1 human-action)
- **Files created/modified:** 5

## Accomplishments

- Created MockUSDC contract with 6-decimal ERC20 and public faucet capped at 10,000 USDC
- Created deployable MockPriceOracle in src/ (separate from test mock) implementing IPriceOracle
- Built DeployFuji.s.sol that deploys entire protocol in one script: MockUSDC, AmmoManager, AmmoFactory, 4 price oracles, and 4 caliber markets with tokens
- Updated foundry.toml with evm_version=cancun and etherscan verification config
- Created Makefile with fuji_check (dry-run) and fuji_deploy (broadcast+verify) targets
- Successfully deployed all contracts to Avalanche Fuji testnet

## Deployed Addresses (Fuji Testnet)

| Contract | Address |
|----------|---------|
| MockUSDC | `0x270D06E53f943C6Dd69a2e51FEB07c420B3Ab146` |
| AmmoManager | `0x5dB292eade6BEa9D710C54C5504d8400639dec25` |
| AmmoFactory | `0xA802FE22E85461131Ca94C8bB85C1a36815aDe8D` |
| 9MM Oracle | `0xFC234277eb25fd5dBc95Ab188D8E11E965075Bcd` |
| 9MM Market | `0x5aFFA4CfF4920627C2061D211C44B1100E3a8Fe1` |
| 9MM Token | `0x6a9753ffDbF5036991294Ce439a042dF834aCa62` |
| 556 Oracle | `0x19Bcf3176fb3472B0A222D57eaF8C6004D840b62` |
| 556 Market | `0xe082bDd7139eF03E8db1B9155f53aB60E5EF7e03` |
| 556 Token | `0x46951A49a4d73C70ba9A12bF82f4c4686a8b60E8` |
| 22LR Oracle | `0x425241B556E02aAfFA253451831791CCe4Bd0f1D` |
| 22LR Market | `0xF1B4a75C77b8a9bFB52F9B800C3f26547eDD442b` |
| 22LR Token | `0xFE10A09895Ab1AF20E5613c2e0715Aac56837ff5` |
| 308 Oracle | `0x757cA58216b4048C51e13dc0266831A6E85D068c` |
| 308 Market | `0x326b5AAc6C97918716264E307923c6D2c95cA440` |
| 308 Token | `0xa8685b36384b13d823bDeF75B96Ee83B6BF647A7` |

## Task Commits

Each task was committed atomically:

1. **Task 1: Create MockUSDC, deployable MockPriceOracle, and update foundry.toml** - `9b29af9` (feat)
2. **Task 2: Create DeployFuji.s.sol script and Makefile** - `99c5175` (feat)
3. **Task 3: Deploy contracts to Fuji testnet** - Human action (no commit -- deployment is on-chain)

## Files Created/Modified

- `packages/contracts/src/MockUSDC.sol` - ERC20 with 6 decimals and public faucet (10,000 USDC cap)
- `packages/contracts/src/MockPriceOracle.sol` - Deployable price oracle implementing IPriceOracle
- `packages/contracts/script/DeployFuji.s.sol` - Full protocol deployment script for Fuji
- `packages/contracts/Makefile` - Make targets for dry-run and broadcast deployment
- `packages/contracts/foundry.toml` - Added evm_version=cancun and etherscan verification config

## Decisions Made

- **Hand-rolled MockUSDC:** Kept consistent with project convention of not using OpenZeppelin, matching existing test/MockERC20.sol style
- **Deployer as all roles:** For testnet simplicity, the deployer wallet is set as treasury, guardian, keeper, and feeRecipient -- constructor handles keeper+feeRecipient, script explicitly sets treasury+guardian
- **evm_version cancun:** Avalanche C-Chain supports cancun opcodes; prevents breakage if solc upgrades
- **avascan.info API for verification:** Used routescan's avascan.info endpoint for Snowtrace contract verification

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Fixed stack-too-deep error in DeployFuji.s.sol**
- **Found during:** Task 2 (DeployFuji.s.sol creation)
- **Issue:** The deployment script had too many local variables in a single function scope, causing Solidity's "stack too deep" compilation error
- **Fix:** Restructured the script to use helper functions or scoped blocks to reduce stack depth
- **Files modified:** packages/contracts/script/DeployFuji.s.sol
- **Verification:** `forge build` compiled successfully after fix
- **Committed in:** `99c5175` (part of Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Necessary compiler fix for correctness. No scope creep.

## Issues Encountered

- Stack-too-deep error during Task 2 required restructuring DeployFuji.s.sol (resolved as deviation above)

## User Setup Required

The user manually deployed contracts to Fuji testnet using:
1. `.env` file with PRIVATE_KEY, SNOWTRACE_API_KEY, and FUJI_RPC_URL
2. `make fuji_deploy` from packages/contracts/

All deployed addresses are captured in the table above and ready for plan 01-02 (shared config).

## Next Phase Readiness

- All contracts deployed and live on Fuji testnet
- Deployed addresses ready to be entered into `packages/shared/src/constants/` in plan 01-02
- Contract ABIs available via `forge build` output for ABI export in plan 01-02

## Self-Check: PASSED

- All 5 source files verified present on disk
- Commits `9b29af9` and `99c5175` verified in git history
- SUMMARY.md created at `.planning/phases/01-foundation/01-01-SUMMARY.md`

---
*Phase: 01-foundation*
*Completed: 2026-02-11*
