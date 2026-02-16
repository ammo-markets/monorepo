# Phase 1: Foundation - Context

**Gathered:** 2026-02-10
**Status:** Ready for planning

<domain>
## Phase Boundary

Deploy all smart contracts (AmmoManager, AmmoFactory, CaliberMarket x 4, AmmoToken x 4, mock USDC) to Avalanche Fuji testnet. Update shared config with real deployed addresses. Migrate database schema to support order tracking with on-chain linkage and worker block cursors.

</domain>

<decisions>
## Implementation Decisions

### Deployment strategy

- Single deploy script (DeployFuji.s.sol) that deploys everything in sequence: mock USDC -> AmmoManager -> AmmoFactory -> create all 4 calibers
- Auto-verify all contracts on Snowtrace using forge's --verify flag during deployment
- Update packages/shared/src/config/index.ts directly with deployed Fuji addresses after deployment
- Full config restructure: per-caliber objects `{ market, token }` plus global `{ manager, factory, usdc }`
- Makefile with `fuji_check` (dry run) and `fuji_deploy` (broadcast + verify) targets, following the pattern from user's Sepolia example
- Researcher must investigate: Foundry verification setup for Avalanche Fuji (Snowtrace API key, --verifier and --verifier-url flags, chain ID config in foundry.toml)
- Required .env additions: `PRIVATE_KEY`, `SNOWTRACE_API_KEY`

### Mock USDC design

- Public faucet function — anyone can mint test USDC (no access restriction)
- Reasonable per-call cap (e.g., 10,000 USDC) to prevent accidental huge mints
- Exactly 6 decimals to match CaliberMarket's immutable usdcDecimals constructor parameter
- Deployed in the same DeployFuji.s.sol script — mock USDC address used as constructor arg for CaliberMarkets

### Keeper/role setup

- Single wallet for testnet: deployer = owner = keeper = treasury = fee recipient = guardian
- Deploy script handles all role setup in the same run: calls setKeeper(), setTreasury(), setFeeRecipient(), sets guardian
- No separate setup scripts — everything configured during deployment

### Schema changes

- Add onChainOrderId to Order model (type: Claude's discretion — String or BigInt, whichever works best with viem/Prisma)
- BlockCursor table: one row per contract address (4 CaliberMarket rows). Worker polls all events for that contract at once.
- Rename Prisma Caliber enum values to match shared types: use values that map cleanly to "9MM", "556", "22LR", "308"
- Add indexes now for known query patterns: walletAddress, status, onChainOrderId on Order; contractAddress on BlockCursor
- Run prisma migrate to Neon as part of this phase

### Claude's Discretion

- onChainOrderId type (String vs BigInt) — pick what works best with viem BigInt and Prisma serialization
- Exact Makefile flag syntax for Avalanche Fuji verification
- Mock USDC exact faucet cap amount
- Deploy script internal ordering and error handling
- Foundry.toml EVM version and optimizer settings for Fuji

### Research Overrides

The following decisions were revised during the research/planning phase based on findings from the actual codebase:

1. **Prisma enum naming (overrides "Rename Prisma Caliber enum values"):** Prisma enum identifiers cannot start with a digit, so values like "9MM" or "556" are invalid Prisma syntax. Keeping existing names (NINE_MM, FIVE_FIVE_SIX, TWENTY_TWO_LR, THREE_OH_EIGHT) with bidirectional mapping (PRISMA_TO_CALIBER / CALIBER_TO_PRISMA) in the shared package.

2. **Role setup (overrides "calls setKeeper(), setTreasury(), setFeeRecipient(), sets guardian"):** The AmmoManager constructor already executes `keepers[msg.sender] = true` and `feeRecipient = feeRecipient_` (constructor arg). Only `setTreasury()` and `setGuardian()` need explicit calls in the deploy script.

3. **MockPriceOracle (clarification):** The existing `test/MockPriceOracle.sol` is verified suitable for deployment — it has `constructor(uint256 price_)`, implements IPriceOracle with `getPrice()`, and has `setPrice()` for testnet adjustments. Copied to `src/` with adjusted import path; no modifications needed.

</decisions>

<specifics>
## Specific Ideas

- Makefile should follow this pattern (from user's existing project):

  ```
  fuji_check:
    @forge clean
    @forge script script/DeployFuji.s.sol:DeployFuji --rpc-url $(FUJI_RPC_URL) --private-key $(PRIVATE_KEY) -vv

  fuji_deploy:
    @forge clean
    @forge script script/DeployFuji.s.sol:DeployFuji --rpc-url $(FUJI_RPC_URL) --private-key $(PRIVATE_KEY) --broadcast --verify \
      --etherscan-api-key $(SNOWTRACE_API_KEY) -vv
  ```

- Config restructure should look like:
  ```typescript
  CONTRACT_ADDRESSES = {
    fuji: {
      manager: "0x...",
      factory: "0x...",
      usdc: "0x...",
      calibers: {
        "9MM": { market: "0x...", token: "0x..." },
        "556": { market: "0x...", token: "0x..." },
        "22LR": { market: "0x...", token: "0x..." },
        "308": { market: "0x...", token: "0x..." },
      },
    },
  };
  ```

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

_Phase: 01-foundation_
_Context gathered: 2026-02-10_
