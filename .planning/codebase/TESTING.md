# Testing Patterns

**Analysis Date:** 2026-02-10

## Test Framework

**Runner:**
- Foundry (forge) for Solidity contracts
- Config: `packages/contracts/foundry.toml`
- No TypeScript test framework configured for `apps/web` or `apps/worker`

**Assertion Library:**
- Foundry's built-in assertions: `assertTrue()`, `assertEq()`, `assertFalse()`
- Test framework: Forge standard library via `forge-std/Test.sol`

**Run Commands:**
```bash
pnpm contracts:test              # Run all Foundry tests
pnpm contracts:build             # Compile and build contracts
# No TypeScript test commands configured for web/worker
```

## Test File Organization

**Location:**
- Solidity tests co-located in `packages/contracts/test/` directory
- Separate from source which lives in `packages/contracts/src/`
- TypeScript/Web: No test files detected — testing infrastructure not set up

**Naming:**
- Solidity test contracts use `.t.sol` suffix: `AmmoFactory.t.sol`, `CaliberMarket.t.sol`, `AmmoManager.t.sol`
- Test contract names match source contracts with "Test" suffix: `AmmoFactoryTest is Test`
- Mock contracts use "Mock" prefix: `MockPriceOracle.sol`, `MockERC20.sol`

**Structure:**
```
packages/contracts/
├── src/                    # Source contracts
│   ├── AmmoManager.sol
│   ├── AmmoFactory.sol
│   ├── CaliberMarket.sol
│   ├── AmmoToken.sol
│   ├── IPriceOracle.sol
│   └── interfaces/
├── test/                   # Test contracts
│   ├── AmmoFactory.t.sol
│   ├── CaliberMarket.t.sol
│   ├── AmmoManager.t.sol
│   ├── MockPriceOracle.sol
│   └── MockERC20.sol
└── lib/
    └── forge-std/          # Foundry standard library
```

## Test Structure

**Suite Organization:**

```solidity
contract CaliberMarketTest is Test {
    // State variables for test environment
    AmmoManager manager;
    CaliberMarket market;
    AmmoToken ammoToken;
    MockERC20 usdc;
    MockPriceOracle oracle;

    // Test addresses
    address user = address(0xBEEF);
    address keeper = address(0xCA11);
    address feeRecipient = address(0xFEE1);
    address guardian = address(0x911);
    address treasury = address(0x73EA5);

    // Constants
    bytes32 constant CALIBER_9MM = bytes32("9MM");
    uint256 constant ORACLE_PRICE = 21e16; // $0.21 per round

    // Setup called before each test
    function setUp() public {
        usdc = new MockERC20("USD Coin", "USDC", 6);
        oracle = new MockPriceOracle(ORACLE_PRICE);
        manager = new AmmoManager(feeRecipient);
        manager.setKeeper(keeper, true);
        manager.setGuardian(guardian);
        manager.setTreasury(treasury);
        market = new CaliberMarket(...);
        ammoToken = market.token();
        usdc.mint(user, 1_000e6);
    }

    // Tests grouped with section headers
    // ── startMint ───────────────────────────────────
    function testStartMintCreatesOrder() public { ... }
    function testStartMintSnapshotsOraclePrice() public { ... }
}
```

**Patterns:**
- Setup phase: `function setUp() public` initializes all contracts and test state
- Teardown phase: Not explicitly used — Foundry resets state between tests
- Assertion pattern: Direct contract state assertions: `assertEq(usdc.balanceOf(user), 900e6)`

## Mocking

**Framework:** Foundry's test utilities (`forge-std/Test.sol`)

**Patterns:**

```solidity
// Mock ERC20 with variable decimals
contract MockERC20 {
    function mint(address to, uint256 amount) external {
        totalSupply += amount;
        balanceOf[to] += amount;
        emit Transfer(address(0), to, amount);
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }
}

// Mock price oracle with settable price
contract MockPriceOracle is IPriceOracle {
    uint256 public price;

    function setPrice(uint256 price_) external {
        price = price_;
    }

    function getPrice() external view override returns (uint256) {
        return price;
    }
}

// Using mocks in tests
function testStartMintSnapshotsOraclePrice() public {
    _startMint(user, 100e6, 500, 0);
    oracle.setPrice(50e16);  // Change mock oracle price
    (,,, uint256 reqPriceAfter,,,,,,) = market.mintOrders(1);
    assertEq(reqPriceAfter, ORACLE_PRICE);  // Verify snapshot unchanged
}
```

**What to Mock:**
- External contract dependencies (ERC20, oracle, manager)
- Use minimal mock implementations that satisfy interface contracts
- Mocks should be deterministic and settable

**What NOT to Mock:**
- Core contract logic under test
- Don't mock the actual CaliberMarket — test it directly
- Don't mock internal functions — test through public interface

## Fixtures and Factories

**Test Data:**

```solidity
// Hardcoded test addresses for consistency
address user = address(0xBEEF);
address keeper = address(0xCA11);
address feeRecipient = address(0xFEE1);

// Constants for test calibers
bytes32 constant CALIBER_9MM = bytes32("9MM");
bytes32 constant CALIBER_556 = bytes32("556NATO");
uint256 constant ORACLE_PRICE = 21e16; // $0.21 per round

// Setup creates standard test environment
function setUp() public {
    usdc = new MockERC20("USD Coin", "USDC", 6);
    manager = new AmmoManager(feeRecipient);
    factory = new AmmoFactory(address(manager), address(usdc), 6);
    oracle = new MockPriceOracle(21e16);
}

// Helper functions for repeated actions
function _startMint(address user, uint256 amount, uint256 slippage, uint256 deadline) internal returns (uint256) {
    vm.prank(user);
    usdc.approve(address(market), amount);
    vm.prank(user);
    return market.startMint(amount, slippage, deadline);
}
```

**Location:**
- Fixtures defined at contract level in each test file: `packages/contracts/test/AmmoFactory.t.sol`
- No separate fixtures directory — co-located with tests

## Coverage

**Requirements:** Not enforced — no coverage config detected

**View Coverage:**
```bash
forge coverage  # Generates coverage report (requires Forge)
```

## Test Types

**Unit Tests:**
- Scope: Single contract function behavior
- Approach: Test each function independently with isolated state
- Examples: `testCreateCaliber()` tests factory creation in isolation
- Assertions check internal state: `assertEq(factory.getCaliberCount(), 1)`

**Integration Tests:**
- Scope: Multi-contract interactions
- Approach: Test workflows across CaliberMarket, AmmoManager, ERC20
- Examples: `testStartMintCreatesOrder()` tests user → market → token flow
- Setup involves multiple contracts: manager, market, token, oracle, USDC

**E2E Tests:**
- Framework: Not used
- Scope: Would test full mint/redeem cycles end-to-end on testnet/mainnet
- Current: Integration tests serve as pseudo-E2E for local testing

## Common Patterns

**Async Testing:**
Not applicable — Solidity tests are synchronous. No async patterns found.

**Error Testing:**

```solidity
// Expect revert with specific error
function testOnlyOwnerCanCreateCaliber() public {
    vm.prank(alice);
    vm.expectRevert(AmmoFactory.NotOwner.selector);
    factory.createCaliber(CALIBER_9MM, "Ammo 9MM", "MO9MM", address(oracle), 150, 150, 50);
}

// Expect revert on zero address
function testCannotCreateWithZeroOracle() public {
    vm.expectRevert(AmmoFactory.ZeroAddress.selector);
    factory.createCaliber(CALIBER_9MM, "Ammo 9MM", "MO9MM", address(0), 150, 150, 50);
}

// Check state after successful operation
function testStartMintCreatesOrder() public {
    vm.prank(user);
    usdc.approve(address(market), 100e6);
    vm.prank(user);
    uint256 orderId = market.startMint(100e6, 500, 0);

    // Verify order created correctly
    (address orderUser, uint256 usdcAmt,,,,,,,,) = market.mintOrders(orderId);
    assertEq(orderUser, user);
    assertEq(usdcAmt, 100e6);
}
```

**Account Impersonation:**

```solidity
// Use vm.prank to call as different address
function testOnlyOwnerCanCreateCaliber() public {
    vm.prank(alice);  // Next call executed as alice
    vm.expectRevert(AmmoFactory.NotOwner.selector);
    factory.createCaliber(...);
}

// Use vm.prank for user interactions
vm.prank(user);
usdc.approve(address(market), 100e6);
vm.prank(user);
uint256 orderId = market.startMint(100e6, 500, 0);
```

**Computation Verification:**

```solidity
// Calculate expected values then verify
uint256 expectedTokens = (uint256(98_500_000) * 1e12 * 1e18) / ORACLE_PRICE;
uint256 expectedMinOut = (expectedTokens * 9500) / 10_000;
assertEq(minOut, expectedMinOut);

// Verify balances changed correctly
assertEq(usdc.balanceOf(user), 900e6);      // 1000 - 100 = 900
assertEq(usdc.balanceOf(address(market)), 100e6);
```

---

*Testing analysis: 2026-02-10*
