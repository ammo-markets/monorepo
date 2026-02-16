# Phase 1: Foundation - Research

**Researched:** 2026-02-10
**Domain:** Foundry deployment scripting, Avalanche Fuji verification, Prisma schema migration, Mock contract design
**Confidence:** HIGH

## Summary

Phase 1 deploys all smart contracts to Avalanche Fuji testnet and migrates the database schema to support order tracking with on-chain linkage. The existing codebase has all four contracts (AmmoManager, AmmoFactory, CaliberMarket, AmmoToken) already written and tested. The deployment script needs to orchestrate: mock USDC deployment, MockPriceOracle deployment (required by CaliberMarket constructor), AmmoManager deployment, AmmoFactory deployment, and 4 caliber creations via the factory. Role setup (keeper, treasury, feeRecipient, guardian) must happen in the same script since the user decided on a single wallet for all testnet roles.

The database schema changes are additive: add `onChainOrderId` to the Order model, create a `BlockCursor` table, rename Prisma Caliber enum values, and add indexes. Prisma 7.3.0 is already installed with `prisma.config.ts` configured for the monorepo.

**Primary recommendation:** Use `String` for `onChainOrderId` (avoids BigInt JSON serialization pain with Next.js, simple `bigint.toString()` conversion from viem). Deploy MockPriceOracle to `src/` (not `test/`) since it must be deployed on-chain. Use `--verifier-url "https://api.avascan.info/v2/network/testnet/evm/43113/etherscan"` for Fuji verification.

<user_constraints>

## User Constraints (from CONTEXT.md)

### Locked Decisions

#### Deployment strategy

- Single deploy script (DeployFuji.s.sol) that deploys everything in sequence: mock USDC -> AmmoManager -> AmmoFactory -> create all 4 calibers
- Auto-verify all contracts on Snowtrace using forge's --verify flag during deployment
- Update packages/shared/src/config/index.ts directly with deployed Fuji addresses after deployment
- Full config restructure: per-caliber objects `{ market, token }` plus global `{ manager, factory, usdc }`
- Makefile with `fuji_check` (dry run) and `fuji_deploy` (broadcast + verify) targets, following the pattern from user's Sepolia example
- Researcher must investigate: Foundry verification setup for Avalanche Fuji (Snowtrace API key, --verifier and --verifier-url flags, chain ID config in foundry.toml)
- Required .env additions: `PRIVATE_KEY`, `SNOWTRACE_API_KEY`

#### Mock USDC design

- Public faucet function -- anyone can mint test USDC (no access restriction)
- Reasonable per-call cap (e.g., 10,000 USDC) to prevent accidental huge mints
- Exactly 6 decimals to match CaliberMarket's immutable usdcDecimals constructor parameter
- Deployed in the same DeployFuji.s.sol script -- mock USDC address used as constructor arg for CaliberMarkets

#### Keeper/role setup

- Single wallet for testnet: deployer = owner = keeper = treasury = fee recipient = guardian
- Deploy script handles all role setup in the same run: calls setKeeper(), setTreasury(), setFeeRecipient(), sets guardian
- No separate setup scripts -- everything configured during deployment

#### Schema changes

- Add onChainOrderId to Order model (type: Claude's discretion -- String or BigInt, whichever works best with viem/Prisma)
- BlockCursor table: one row per contract address (4 CaliberMarket rows). Worker polls all events for that contract at once.
- Rename Prisma Caliber enum values to match shared types: use values that map cleanly to "9MM", "556", "22LR", "308"
- Add indexes now for known query patterns: walletAddress, status, onChainOrderId on Order; contractAddress on BlockCursor
- Run prisma migrate to Neon as part of this phase

### Claude's Discretion

- onChainOrderId type (String vs BigInt) -- pick what works best with viem BigInt and Prisma serialization
- Exact Makefile flag syntax for Avalanche Fuji verification
- Mock USDC exact faucet cap amount
- Deploy script internal ordering and error handling
- Foundry.toml EVM version and optimizer settings for Fuji
  </user_constraints>

## Standard Stack

### Core

| Library         | Version              | Purpose                                             | Why Standard                                          |
| --------------- | -------------------- | --------------------------------------------------- | ----------------------------------------------------- |
| Foundry (forge) | 1.5.1-stable         | Solidity compilation, testing, deployment scripting | Already installed, used for existing contract tests   |
| forge-std       | (bundled with forge) | Script.sol base contract for deployment scripts     | Standard Foundry deployment approach, already in lib/ |
| Prisma          | 7.3.0                | Database ORM and migration tool                     | Already installed with prisma.config.ts configured    |
| Solidity        | 0.8.24               | Smart contract language                             | Already configured in foundry.toml                    |

### Supporting

| Library              | Version   | Purpose                                      | When to Use                                            |
| -------------------- | --------- | -------------------------------------------- | ------------------------------------------------------ |
| forge-std/Script.sol | (bundled) | vm.startBroadcast/stopBroadcast, console.log | Base contract for DeployFuji.s.sol                     |
| tsx                  | 4.19.2    | TypeScript execution for export-abis.ts      | Already in devDependencies of @ammo-exchange/contracts |

### Alternatives Considered

Not applicable -- all tools are locked decisions from the user. No alternatives to evaluate.

**Installation:**
No new packages needed. All dependencies are already installed.

## Architecture Patterns

### Recommended Project Structure

```
packages/contracts/
  src/
    AmmoManager.sol          # existing
    AmmoFactory.sol          # existing
    CaliberMarket.sol        # existing
    AmmoToken.sol            # existing
    IPriceOracle.sol         # existing
    MockUSDC.sol             # NEW - deployable mock USDC with faucet
    MockPriceOracle.sol      # NEW - moved from test/ to src/ for on-chain deployment
    interfaces/              # existing
    abis/                    # existing (generated)
  test/
    MockERC20.sol            # keep existing (used by tests)
    MockPriceOracle.sol      # keep existing (used by tests) OR remove and import from src/
  script/
    DeployFuji.s.sol         # NEW - single deployment script
  Makefile                   # NEW - fuji_check and fuji_deploy targets

packages/shared/src/config/
  index.ts                   # MODIFIED - restructured with per-caliber addresses

packages/db/prisma/
  schema.prisma              # MODIFIED - onChainOrderId, BlockCursor, enum rename, indexes
```

### Pattern 1: Foundry Deployment Script

**What:** A Solidity script that uses `vm.startBroadcast()`/`vm.stopBroadcast()` to deploy contracts sequentially, with `console.log` for address output.

**When to use:** Any multi-contract deployment where order matters (factory pattern, role assignments after deploy).

**Example:**

```solidity
// Source: Foundry docs (https://getfoundry.sh/guides/scripting-with-solidity/)
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/MockUSDC.sol";
import "../src/MockPriceOracle.sol";
import "../src/AmmoManager.sol";
import "../src/AmmoFactory.sol";

contract DeployFuji is Script {
    function run() external {
        vm.startBroadcast();

        // 1. Deploy mock USDC
        MockUSDC usdc = new MockUSDC();

        // 2. Deploy AmmoManager (msg.sender = feeRecipient)
        AmmoManager manager = new AmmoManager(msg.sender);

        // 3. Configure roles (all = deployer for testnet)
        manager.setTreasury(msg.sender);
        manager.setGuardian(msg.sender);
        // setKeeper(msg.sender) already done in constructor

        // 4. Deploy AmmoFactory
        AmmoFactory factory = new AmmoFactory(
            address(manager), address(usdc), 6
        );

        // 5. Deploy MockPriceOracles and create calibers
        MockPriceOracle oracle9mm = new MockPriceOracle(21e16);
        factory.createCaliber(
            bytes32("9MM"), "Ammo 9MM", "MO9MM",
            address(oracle9mm), 150, 150, 50
        );
        // ... repeat for 556, 22LR, 308

        vm.stopBroadcast();

        // Log deployed addresses
        console.log("MockUSDC:", address(usdc));
        console.log("AmmoManager:", address(manager));
        // ...
    }
}
```

### Pattern 2: Forge Script Execution with Verification

**What:** Makefile targets for dry-run simulation and broadcast+verify deployment.

**When to use:** Every deployment to a live network.

**Example:**

```makefile
# Source: User's Sepolia example + Avalanche docs
-include .env

fuji_check:
	@forge clean
	@forge script script/DeployFuji.s.sol:DeployFuji \
		--rpc-url $(FUJI_RPC_URL) \
		--private-key $(PRIVATE_KEY) -vv

fuji_deploy:
	@forge clean
	@forge script script/DeployFuji.s.sol:DeployFuji \
		--rpc-url $(FUJI_RPC_URL) \
		--private-key $(PRIVATE_KEY) \
		--broadcast --verify --slow \
		--verifier-url "https://api.avascan.info/v2/network/testnet/evm/43113/etherscan" \
		--etherscan-api-key $(SNOWTRACE_API_KEY) -vv
```

### Pattern 3: BlockCursor Table for Event Polling

**What:** A database table that stores the last processed block number per contract address, enabling the worker to resume from where it left off.

**When to use:** Polling-based event listener architecture (as decided by user).

**Example:**

```prisma
model BlockCursor {
  id              String   @id @default(cuid())
  contractAddress String   @unique
  chainId         Int
  lastBlock       BigInt   @default(0)
  updatedAt       DateTime @updatedAt

  @@index([contractAddress])
}
```

### Anti-Patterns to Avoid

- **Deploying without --slow on Fuji:** Forge batches transactions by default. Without `--slow`, subsequent transactions may fail if they depend on prior deployments being confirmed. Always use `--slow` for multi-contract deployment scripts on live networks.
- **Using BigInt in Prisma for API-facing fields:** Prisma BigInt causes `"Do not know how to serialize a BigInt"` errors when returned from Next.js API routes or server actions. Use String for fields that will be serialized to JSON.
- **Keeping MockUSDC/MockPriceOracle only in test/:** `forge script` can import from test/ but these contracts need to be deployed on-chain. Move to src/ for clarity and to ensure they are compiled as part of the main build.
- **Hardcoding addresses in deploy script:** Use `console.log` to output addresses after deployment, then manually update shared config. Do NOT try to auto-write config from Solidity.

## Don't Hand-Roll

| Problem                  | Don't Build            | Use Instead                                                     | Why                                                           |
| ------------------------ | ---------------------- | --------------------------------------------------------------- | ------------------------------------------------------------- |
| ERC20 safe transfer      | Manual low-level calls | Existing `_safeTransfer` / `_safeTransferFrom` in CaliberMarket | Already battle-tested in the codebase                         |
| Deployment orchestration | Manual cast calls      | forge script with Script.sol                                    | Atomic simulation, broadcast, and verification in one command |
| Database migrations      | Raw SQL                | Prisma Migrate                                                  | Schema drift detection, migration history, rollback support   |
| ABI export               | Manual copy-paste      | Existing export-abis.ts script                                  | Already generates typed ABI exports with `as const`           |

**Key insight:** The existing codebase already has the right tooling. Phase 1 is about using it to deploy and configure, not building new infrastructure.

## Common Pitfalls

### Pitfall 1: MockPriceOracle is missing from deploy dependencies

**What goes wrong:** The deploy script calls `factory.createCaliber(...)` which requires an `oracle` address as a constructor parameter for each CaliberMarket. Without deploying a MockPriceOracle first, the script reverts.
**Why it happens:** The user's deployment decisions mention mock USDC but not mock oracle. It is an implicit dependency from the CaliberMarket constructor: `constructor(..., address oracle_, ...)`.
**How to avoid:** Deploy one MockPriceOracle per caliber (or one shared oracle with per-caliber price updates) BEFORE calling `factory.createCaliber()`.
**Warning signs:** `ZeroAddress()` revert during deployment simulation (fuji_check).

### Pitfall 2: Snowtrace/Routescan verification URL confusion

**What goes wrong:** Verification silently fails or returns errors because the wrong API endpoint is used. There are multiple competing endpoints: `api.snowtrace.io`, `api-testnet.snowtrace.io`, `api.avascan.info/v2/...`, `api.routescan.io/v2/...`.
**Why it happens:** Snowtrace migrated to Routescan infrastructure. Old documentation references deprecated URLs.
**How to avoid:** Use `https://api.avascan.info/v2/network/testnet/evm/43113/etherscan` for Fuji testnet. This is the URL shown in official Avalanche documentation examples.
**Warning signs:** "NOTOK" response during verification, "Contract source code not verified" on explorer.

### Pitfall 3: forge script --verify silently skips without API key

**What goes wrong:** The `--verify` flag is present but no `--etherscan-api-key` is provided. Forge silently skips verification instead of failing.
**Why it happens:** forge script does not error when verification credentials are missing (documented in foundry-rs/foundry#6368).
**How to avoid:** Always pass `--etherscan-api-key $(SNOWTRACE_API_KEY)` explicitly. Validate the env var is set before running.
**Warning signs:** No verification output in forge logs despite `--verify` flag.

### Pitfall 4: Prisma Caliber enum rename is a breaking migration

**What goes wrong:** Renaming enum values (NINE_MM -> 9MM) in PostgreSQL is a schema-breaking change. Prisma may try to drop and recreate the enum, which fails if data exists.
**Why it happens:** PostgreSQL enum types don't support simple renames easily. Prisma Migrate generates SQL that may be destructive.
**How to avoid:** Since this is the first deployment to Neon (no existing data), the migration will be clean. If data existed, you'd need `--create-only` and manual SQL editing. For this phase, run `prisma migrate dev` to create and apply in one step.
**Warning signs:** Migration SQL showing `DROP TYPE` followed by `CREATE TYPE`.

### Pitfall 5: Prisma enum values cannot contain hyphens or start with numbers

**What goes wrong:** Prisma enum values must be valid identifiers. Values like `9MM` or `22LR` are not valid Prisma identifiers because they start with digits.
**Why it happens:** Prisma generates TypeScript types from enum values, and TypeScript identifiers cannot start with numbers.
**How to avoid:** Use Prisma's `@map` directive to map friendly Prisma identifiers to database values: `_9MM @map("9MM")` or use string-safe names like `NINE_MM` and map at the application layer. Alternatively, keep the existing enum names (NINE_MM, FIVE_FIVE_SIX, etc.) and create a mapping function in the shared package.
**Warning signs:** Prisma schema validation error during `prisma generate`.

### Pitfall 6: EVM version mismatch on Avalanche

**What goes wrong:** Contract deployment fails with opcode errors because the compiler targets an EVM version not supported by Avalanche C-Chain.
**Why it happens:** Solidity 0.8.30+ defaults to Pectra, which uses opcodes not yet supported on Avalanche. While this project uses 0.8.24 (defaults to Cancun, which IS supported), adding explicit `evm_version = "cancun"` prevents breakage if solc is ever upgraded.
**How to avoid:** Add `evm_version = "cancun"` to `[profile.default]` in foundry.toml. This is already compatible with solc 0.8.24.
**Warning signs:** "invalid opcode" errors during deployment.

### Pitfall 7: AmmoManager constructor auto-sets deployer as keeper

**What goes wrong:** Developers add an unnecessary `manager.setKeeper(msg.sender, true)` call in the deploy script, not realizing the constructor already does this.
**Why it happens:** The AmmoManager constructor includes `keepers[msg.sender] = true` (line 37 of AmmoManager.sol).
**How to avoid:** Review the constructor before writing role-setup code. Only call setTreasury(), setGuardian(), and setFeeRecipient() (feeRecipient is also set in constructor, but can be updated if needed). The deployer is already a keeper.
**Warning signs:** Redundant KeeperUpdated event in transaction logs.

## Code Examples

### MockUSDC with Faucet Cap

```solidity
// Source: Custom design based on existing MockERC20 in test/ + user decisions
pragma solidity ^0.8.24;

contract MockUSDC {
    string public constant name = "Mock USDC";
    string public constant symbol = "USDC";
    uint8 public constant decimals = 6;
    uint256 public constant FAUCET_CAP = 10_000e6; // 10,000 USDC per call

    uint256 public totalSupply;
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    event Transfer(address indexed from, address indexed to, uint256 amount);
    event Approval(address indexed owner, address indexed spender, uint256 amount);

    error ExceedsFaucetCap();

    /// @notice Public faucet - anyone can mint up to FAUCET_CAP per call
    function faucet(uint256 amount) external {
        if (amount > FAUCET_CAP) revert ExceedsFaucetCap();
        totalSupply += amount;
        balanceOf[msg.sender] += amount;
        emit Transfer(address(0), msg.sender, amount);
    }

    function approve(address spender, uint256 amount) external returns (bool) { /* ... */ }
    function transfer(address to, uint256 amount) external returns (bool) { /* ... */ }
    function transferFrom(address from, address to, uint256 amount) external returns (bool) { /* ... */ }
}
```

### Config Restructure Pattern

```typescript
// Source: User's specific config structure from CONTEXT.md
// packages/shared/src/config/index.ts

export const CONTRACT_ADDRESSES = {
  fuji: {
    manager: "0x..." as `0x${string}`,
    factory: "0x..." as `0x${string}`,
    usdc: "0x..." as `0x${string}`,
    calibers: {
      "9MM": {
        market: "0x..." as `0x${string}`,
        token: "0x..." as `0x${string}`,
      },
      "556": {
        market: "0x..." as `0x${string}`,
        token: "0x..." as `0x${string}`,
      },
      "22LR": {
        market: "0x..." as `0x${string}`,
        token: "0x..." as `0x${string}`,
      },
      "308": {
        market: "0x..." as `0x${string}`,
        token: "0x..." as `0x${string}`,
      },
    },
  },
} as const;
```

### Prisma Schema Changes

```prisma
// Source: Existing schema.prisma + user decisions

// Caliber enum: keep Prisma-safe identifiers, map in application layer
enum Caliber {
  NINE_MM         // maps to shared "9MM"
  FIVE_FIVE_SIX   // maps to shared "556"
  TWENTY_TWO_LR   // maps to shared "22LR"
  THREE_OH_EIGHT  // maps to shared "308"
}

model Order {
  id              String      @id @default(cuid())
  userId          String
  type            OrderType
  status          OrderStatus @default(PENDING)
  caliber         Caliber
  amount          BigInt
  onChainOrderId  String?     // nullable: set when on-chain tx confirmed
  txHash          String?     @unique
  chainId         Int
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt

  user            User             @relation(fields: [userId], references: [id])
  shippingAddress ShippingAddress?

  @@index([userId])
  @@index([txHash])
  @@index([status])
  @@index([onChainOrderId])
}

model BlockCursor {
  id              String   @id @default(cuid())
  contractAddress String   @unique
  chainId         Int
  lastBlock       BigInt   @default(0)
  updatedAt       DateTime @updatedAt

  @@index([contractAddress])
}
```

### Caliber Mapping Utility (shared package)

```typescript
// packages/shared/src/types/index.ts or constants/index.ts
// Maps Prisma enum to shared Caliber type and vice versa
import type { Caliber } from "../types/index";

export const PRISMA_TO_CALIBER = {
  NINE_MM: "9MM",
  FIVE_FIVE_SIX: "556",
  TWENTY_TWO_LR: "22LR",
  THREE_OH_EIGHT: "308",
} as const satisfies Record<string, Caliber>;

export const CALIBER_TO_PRISMA = {
  "9MM": "NINE_MM",
  "556": "FIVE_FIVE_SIX",
  "22LR": "TWENTY_TWO_LR",
  "308": "THREE_OH_EIGHT",
} as const;
```

### Deploy Script Caliber Data

```solidity
// Source: packages/shared/src/constants/index.ts caliber specs
// Caliber IDs, token names/symbols, oracle prices, fee/min config

// bytes32 caliber IDs (Solidity string-to-bytes32 encoding)
bytes32("9MM")   // 0x394d4d00...
bytes32("556")   // 0x353536...
bytes32("22LR")  // 0x32324c52...
bytes32("308")   // 0x333038...

// Token names and symbols
// 9MM  -> "Ammo 9MM",  "MO9MM"
// 556  -> "Ammo 556",  "MO556"
// 22LR -> "Ammo 22LR", "MO22LR"
// 308  -> "Ammo 308",  "MO308"

// Oracle prices (X18 format: price in USDC per round * 1e18)
// 9MM:  $0.21/rd  -> 21e16
// 556:  $0.45/rd  -> 45e16
// 22LR: $0.08/rd  -> 8e16
// 308:  $0.90/rd  -> 90e16

// Fee config (from CALIBER_SPECS + FEES constants)
// mintFeeBps:    150 (1.5%)
// redeemFeeBps:  150 (1.5%)
// minMintRounds: 50 (9MM, 556), 100 (22LR), 20 (308)
```

### foundry.toml Updates

```toml
# Source: Avalanche Builder Hub docs + existing foundry.toml
[profile.default]
src = "src"
test = "test"
script = "script"
out = "out"
libs = ["lib"]
solc = "0.8.24"
evm_version = "cancun"    # explicit; Avalanche C-Chain supports cancun
optimizer = true
optimizer_runs = 200

[rpc_endpoints]
avalanche = "${AVALANCHE_RPC_URL}"
fuji = "${FUJI_RPC_URL}"

[etherscan]
fuji = { key = "${SNOWTRACE_API_KEY}", url = "https://api.avascan.info/v2/network/testnet/evm/43113/etherscan", chain = 43113 }
avalanche = { key = "${SNOWTRACE_API_KEY}", url = "https://api.avascan.info/v2/network/mainnet/evm/43114/etherscan", chain = 43114 }
```

## Discretion Recommendations

### onChainOrderId Type: Use String

**Recommendation:** `String` (not `BigInt`)

**Rationale:**

1. **viem returns `bigint`** for uint256 event args -- conversion is trivial: `orderId.toString()`
2. **Prisma BigInt causes JSON serialization errors** in Next.js API routes and server actions (`"Do not know how to serialize a BigInt"`)
3. **The on-chain order ID is a sequential counter** (starts at 1, increments). It will never exceed JavaScript's safe integer limit in practice, but storing as String avoids type mismatch issues across the stack.
4. **String is nullable-friendly** -- new orders before on-chain confirmation can have `null`.
5. **Querying works fine** -- Prisma `where: { onChainOrderId: "42" }` is straightforward.

**Confidence:** HIGH -- verified via Prisma docs, multiple GitHub discussions about BigInt serialization pain.

### Mock USDC Faucet Cap: 10,000 USDC

**Recommendation:** `10_000e6` (10,000 USDC with 6 decimals)

**Rationale:** User suggested "e.g., 10,000 USDC" which is reasonable. Enough for substantial testing (hundreds of mint operations at typical prices) but prevents accidental huge mints. No rate limiting needed per user decision ("no access restriction").

**Confidence:** HIGH -- user gave this as the example value.

### Foundry.toml EVM Version: Add `evm_version = "cancun"`

**Recommendation:** Add explicit `evm_version = "cancun"` to foundry.toml.

**Rationale:** Solidity 0.8.24 already targets cancun by default, so this is a no-op for now. But it makes the config explicit and prevents breakage if solc is ever upgraded to 0.8.30+ (which defaults to Pectra, unsupported on Avalanche). Official Avalanche docs recommend this setting.

**Confidence:** HIGH -- verified via Avalanche Builder Hub documentation.

### Deploy Script Ordering

**Recommendation:**

1. Deploy MockUSDC
2. Deploy MockPriceOracle instances (one per caliber with appropriate prices)
3. Deploy AmmoManager (deployer as feeRecipient)
4. Call manager.setTreasury(deployer)
5. Call manager.setGuardian(deployer)
6. Deploy AmmoFactory(manager, usdc, 6)
7. Call factory.createCaliber() x4 (each with its own oracle)
8. console.log all addresses

**Note on keeper:** The AmmoManager constructor already sets `keepers[msg.sender] = true`, so no explicit `setKeeper()` call is needed for the deployer.

**Note on feeRecipient:** The AmmoManager constructor takes `feeRecipient_` as a constructor arg and sets it. If the deployer should be the feeRecipient (as decided), pass `msg.sender` to the constructor. No separate `setFeeRecipient()` call needed.

**Confidence:** HIGH -- verified by reading AmmoManager constructor code.

### Makefile Verification Flags

**Recommendation:**

```makefile
fuji_deploy:
	@forge clean
	@forge script script/DeployFuji.s.sol:DeployFuji \
		--rpc-url $(FUJI_RPC_URL) \
		--private-key $(PRIVATE_KEY) \
		--broadcast --verify --slow \
		--verifier-url "https://api.avascan.info/v2/network/testnet/evm/43113/etherscan" \
		--etherscan-api-key $(SNOWTRACE_API_KEY) -vv
```

**Key flags:**

- `--slow`: Forces sequential transaction confirmation. Critical for multi-contract deploys where later txs depend on earlier ones.
- `--verify`: Submits source code to verifier after each contract deploy.
- `--verifier-url`: Points to Routescan's Etherscan-compatible API for Fuji. This is the URL used in official Avalanche documentation.
- `--etherscan-api-key`: Required even though Routescan free tier works without a key at 2 req/s. Forge may silently skip verification without it. Use a Snowtrace API key.
- `-vv`: Verbose output (shows traces for debugging).

**Note:** The `[etherscan]` section in foundry.toml provides a fallback, but command-line flags override it. Both approaches are valid; the Makefile approach is more explicit.

**Confidence:** MEDIUM -- the verifier-url is from Avalanche official docs example. The `[etherscan]` config in foundry.toml is from Foundry docs but not Avalanche-specific. Cross-verified across multiple sources.

## State of the Art

| Old Approach                                   | Current Approach                                  | When Changed      | Impact                                                        |
| ---------------------------------------------- | ------------------------------------------------- | ----------------- | ------------------------------------------------------------- |
| Snowtrace API at `api.snowtrace.io`            | Routescan API at `api.avascan.info/v2/...`        | 2024              | Snowtrace migrated to Routescan. Old API URLs may not work    |
| `prisma migrate dev` with `schema.prisma` only | `prisma.config.ts` required in Prisma 7           | 2025 (Prisma 7)   | Already configured in this project                            |
| Foundry `forge create` for deployment          | `forge script` for complex multi-contract deploys | Stable since 2023 | Script approach enables atomic simulation, ordered deployment |

**Deprecated/outdated:**

- `api.snowtrace.io` and `api-testnet.snowtrace.io`: May still work but official Avalanche examples now use `api.avascan.info/v2/...` URLs
- Prisma `directUrl` in schema.prisma: In Prisma 7, use `prisma.config.ts` datasource instead

## Open Questions

1. **MockPriceOracle placement: src/ or script/?**
   - What we know: It must be deployed on-chain. `forge script` can import from `src/`, `test/`, and `script/`.
   - What's unclear: Convention for testnet-only helper contracts. Placing in `src/` means it gets compiled into production ABIs via export-abis.ts.
   - Recommendation: Place in `src/` for simplicity. The export-abis.ts script only exports contracts listed in its `CONTRACTS_TO_EXPORT` array, so MockUSDC and MockPriceOracle won't be exported unless explicitly added. Alternatively, place in `script/` to keep `src/` clean, but this is a minor organizational concern.

2. **Caliber enum rename vs. keep existing + mapping**
   - What we know: User wants enum values that "map cleanly to 9MM, 556, 22LR, 308". But Prisma identifiers cannot start with digits.
   - What's unclear: Whether user expects literal `9MM` in the enum (impossible in Prisma) or a clean mapping.
   - Recommendation: Keep existing enum names (NINE_MM, FIVE_FIVE_SIX, etc.) since they already exist and work. Add a bidirectional mapping utility in the shared package. This avoids a destructive migration while achieving clean type-safe conversion.

3. **Snowtrace API key acquisition**
   - What we know: Routescan free tier allows 2 req/s without API key. But forge may need an API key value to trigger verification.
   - What's unclear: Whether a placeholder string (e.g., "verifyContract") works with the Routescan free tier, or if a real key from routescan.io is required.
   - Recommendation: Register for a free Routescan API key at routescan.io. If unavailable, try `--etherscan-api-key "verifyContract"` as a placeholder. If verification fails, contracts can be verified post-deployment with `forge verify-contract`.

4. **Oracle prices for testnet calibers**
   - What we know: The test uses $0.21/rd for 9mm. Real-world approximate prices: 9mm ~$0.21, 5.56 ~$0.45, .22LR ~$0.08, .308 ~$0.90.
   - What's unclear: Whether exact prices matter for testnet or if round numbers are better.
   - Recommendation: Use approximate real-world prices for realistic testing. The MockPriceOracle has a `setPrice()` function so prices can be adjusted later.

## Sources

### Primary (HIGH confidence)

- Existing codebase: AmmoManager.sol, AmmoFactory.sol, CaliberMarket.sol, AmmoToken.sol, IPriceOracle.sol, MockPriceOracle.sol, MockERC20.sol -- read directly from repository
- Existing config: packages/shared/src/config/index.ts, packages/shared/src/constants/index.ts, packages/shared/src/types/index.ts
- Existing schema: packages/db/prisma/schema.prisma, packages/db/prisma.config.ts
- Existing foundry.toml: packages/contracts/foundry.toml
- forge --version: 1.5.1-stable (verified locally)
- prisma --version: 7.3.0 (verified locally)

### Secondary (MEDIUM confidence)

- [Avalanche Builder Hub - Foundry docs](https://build.avax.network/docs/dapps/toolchains/foundry) -- evm_version = "cancun" requirement, forge create examples
- [Foundry scripting guide](https://getfoundry.sh/guides/scripting-with-solidity/) -- vm.startBroadcast pattern, script execution phases
- [Avalanche docs - Foundry deployment](https://docs.avax.network/dapps/toolchains/foundry) -- verifier-url pattern: `https://api.avascan.info/v2/network/testnet/evm/43113/etherscan`
- [Prisma BigInt serialization docs](https://www.prisma.io/docs/orm/prisma-client/special-fields-and-types) -- BigInt JSON.stringify issues
- [Neon + Prisma migrations guide](https://neon.com/docs/guides/prisma-migrations) -- prisma migrate dev vs deploy
- [Prisma 7 upgrade guide](https://www.prisma.io/docs/orm/more/upgrade-guides/upgrading-versions/upgrading-to-prisma-7) -- prisma.config.ts requirement

### Tertiary (LOW confidence)

- [Foundry GitHub issue #6368](https://github.com/foundry-rs/foundry/issues/6368) -- forge script --verify silently skips without API key
- [Foundry GitHub issue #8452](https://github.com/foundry-rs/foundry/issues/8452) -- --slow flag behavior
- Routescan free tier API key requirement -- conflicting information across sources, needs validation during deployment

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH -- all tools already installed and configured in the project
- Architecture: HIGH -- patterns verified against existing codebase code and official Foundry/Prisma docs
- Pitfalls: HIGH -- most pitfalls discovered by reading actual contract constructors and Prisma behavior
- Verification URLs: MEDIUM -- verified against Avalanche docs but not tested live

**Research date:** 2026-02-10
**Valid until:** 2026-03-10 (30 days -- stable stack, no fast-moving dependencies)
