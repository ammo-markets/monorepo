// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/AmmoManager.sol";
import "../src/AmmoToken.sol";
import "../src/CaliberMarket.sol";
import {ILBRouter} from "../src/interfaces/ILBRouter.sol";
import {IERC20} from "../src/interfaces/IERC20.sol";
import "./MockPriceOracle.sol";
import "./MockERC20.sol";

/// @dev Minimal LBFactory interface for creating pairs in fork tests.
interface ILBFactory {
    function createLBPair(IERC20 tokenX, IERC20 tokenY, uint24 activeId, uint16 binStep)
        external
        returns (address pair);
    function owner() external view returns (address);
    function setPresetOpenState(uint16 binStep, bool isOpen) external;
}

/// @dev Extended LBRouter interface for liquidity + buy swaps (test setup only).
interface ILBRouterFull is ILBRouter {
    struct LiquidityParameters {
        IERC20 tokenX;
        IERC20 tokenY;
        uint256 binStep;
        uint256 amountX;
        uint256 amountY;
        uint256 amountXMin;
        uint256 amountYMin;
        uint256 activeIdDesired;
        uint256 idSlippage;
        int256[] deltaIds;
        uint256[] distributionX;
        uint256[] distributionY;
        address to;
        address refundTo;
        uint256 deadline;
    }

    function addLiquidityNATIVE(LiquidityParameters calldata params)
        external
        payable
        returns (uint256, uint256, uint256, uint256, uint256[] memory, uint256[] memory);

    function swapExactNATIVEForTokens(uint256 amountOutMin, Path memory path, address to, uint256 deadline)
        external
        payable
        returns (uint256 amountOut);
}

/// @notice Fork test: validates AmmoToken tax swap against real Trader Joe V2.2 contracts.
/// @dev Uses public Avalanche RPC by default. Override with AVALANCHE_RPC_URL env var.
///      Run: forge test --match-contract AmmoTokenTaxForkTest -vvv
contract AmmoTokenTaxForkTest is Test {
    // Trader Joe V2.2 (same address on Fuji and mainnet via CREATE2)
    address constant LB_FACTORY = 0xb43120c4745967fa9b93E79C149E66B0f2D6Fe0c;
    address constant LB_ROUTER = 0x18556DA13313f3532c54711497A8FedAC273220E;
    // WAVAX mainnet — if testing Fuji, override in setUp
    address constant WAVAX_MAINNET = 0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7;
    address constant WAVAX_FUJI = 0xd00ae08403B9bbb9124bB305C09058E32C39A48c;

    uint16 constant BIN_STEP = 20;
    uint24 constant ACTIVE_ID = 8388608; // 1:1 price
    uint256 constant BUY_TAX = 300; // 3%
    uint256 constant SELL_TAX = 300; // 3%

    AmmoManager manager;
    CaliberMarket market;
    AmmoToken token;
    MockERC20 usdc;
    MockPriceOracle oracle;

    address wavax;
    address lbPair;
    address user = address(0xBEEF);
    address treasury = address(0x73EA5);
    address feeRecipient = address(0xFEE1);

    function setUp() public {
        // Fork Avalanche mainnet — use env override or public RPC
        string memory rpcUrl =
            vm.envOr("AVALANCHE_RPC_URL", string("https://api.avax.network/ext/bc/C/rpc"));
        vm.createSelectFork(rpcUrl);

        // Detect chain: check if WAVAX mainnet has code
        wavax = WAVAX_MAINNET;
        if (wavax.code.length == 0) {
            wavax = WAVAX_FUJI;
        }

        // Deploy protocol contracts
        usdc = new MockERC20("USD Coin", "USDC", 6);
        oracle = new MockPriceOracle(21e16); // $0.21 per round

        manager = new AmmoManager(feeRecipient, wavax);
        manager.setTreasury(treasury);
        manager.setDexRouter(LB_ROUTER);
        manager.setKeeper(address(this), true);

        market = new CaliberMarket(
            address(manager), address(usdc), 6, address(oracle), bytes32("9MM_TEST"), "Ammo 9MM", "9MM-T", 150, 150, 0
        );
        token = market.token();

        // Mint tokens to user via market
        usdc.mint(user, 10_000e6);
        vm.prank(user);
        usdc.approve(address(market), 10_000e6);
        vm.prank(user);
        market.mint(10_000e6);

        // Create LBPair on Trader Joe
        _createPairAndAddLiquidity();

        // Configure tax on the pair
        manager.setPoolTax(address(token), lbPair, BUY_TAX, SELL_TAX);
        manager.setSwapPath(address(token), BIN_STEP, ILBRouter.Version.V2_2);
        manager.setTaxSwapThreshold(address(token), 1e18);
    }

    // ═══════════════════════════════════════════════
    // ── Fork Tests: Sell Tax ──────────────────────
    // ═══════════════════════════════════════════════

    function testForkSellTaxCollected() public {
        uint256 sellAmount = 100e18;
        uint256 expectedTax = (sellAmount * SELL_TAX) / 10_000; // 3e18

        ILBRouter.Path memory path = _buildPath(address(token), wavax);

        vm.prank(user);
        token.approve(LB_ROUTER, type(uint256).max);

        // Step 1: Sell — tax should accumulate, NO auto-swap during DEX trade
        vm.prank(user);
        ILBRouterFull(LB_ROUTER).swapExactTokensForNATIVE(sellAmount, 0, path, payable(user), block.timestamp);

        uint256 taxBalance = token.balanceOf(address(token));
        assertApproxEqAbs(taxBalance, expectedTax, 1, "Sell tax collected on token contract");
        assertGt(taxBalance, 0, "Tax balance non-zero");

        // Step 2: Verify threshold was reached
        uint256 threshold = manager.taxSwapThresholds(address(token));
        assertTrue(taxBalance >= threshold, "Tax balance exceeds swap threshold");

        // Step 3: Verify NO swap happened during the sell itself
        assertEq(treasury.balance, 0, "Treasury should not have AVAX yet - no swap during sell");
    }

    function testForkSellTaxNoAutoSwapDuringSell() public{
        ILBRouter.Path memory path = _buildPath(address(token), wavax);

        vm.prank(user);
        token.approve(LB_ROUTER, type(uint256).max);

        // First sell: accumulate taxes above threshold
        vm.prank(user);
        ILBRouterFull(LB_ROUTER).swapExactTokensForNATIVE(100e18, 0, path, payable(user), block.timestamp);

        // Second sell: even though threshold is crossed, should NOT auto-swap
        uint256 treasuryBefore = treasury.balance;
        vm.prank(user);
        ILBRouterFull(LB_ROUTER).swapExactTokensForNATIVE(100e18, 0, path, payable(user), block.timestamp);

        assertEq(treasury.balance, treasuryBefore, "No auto-swap during second sell either");
        assertGt(token.balanceOf(address(token)), 0, "Taxes still accumulated on contract");
    }

    // ═══════════════════════════════════════════════
    // ── Fork Tests: Buy Tax ───────────────────────
    // ═══════════════════════════════════════════════

    function testForkBuyTaxCollected() public{
        uint256 buyAmount = 1 ether;
        uint256 userTokensBefore = token.balanceOf(user);

        ILBRouter.Path memory path = _buildPath(wavax, address(token));

        vm.deal(user, buyAmount);
        vm.prank(user);
        uint256 amountOut =
            ILBRouterFull(LB_ROUTER).swapExactNATIVEForTokens{value: buyAmount}(0, path, user, block.timestamp);

        uint256 actualReceived = token.balanceOf(user) - userTokensBefore;

        // User receives amountOut minus buy tax
        uint256 expectedTax = (amountOut * BUY_TAX) / 10_000;
        uint256 expectedReceived = amountOut - expectedTax;

        assertApproxEqAbs(actualReceived, expectedReceived, 1, "Buy tax should deduct 3%");
        assertGt(token.balanceOf(address(token)), 0, "Tax accumulated on contract");
    }

    function testForkBuyDoesNotRevertWhenThresholdCrossed() public{
        ILBRouter.Path memory sellPath = _buildPath(address(token), wavax);
        ILBRouter.Path memory buyPath = _buildPath(wavax, address(token));

        vm.prank(user);
        token.approve(LB_ROUTER, type(uint256).max);

        // Step 1: Sell to accumulate taxes above threshold
        vm.prank(user);
        ILBRouterFull(LB_ROUTER).swapExactTokensForNATIVE(200e18, 0, sellPath, payable(user), block.timestamp);

        uint256 taxBalance = token.balanceOf(address(token));
        uint256 threshold = manager.taxSwapThresholds(address(token));
        assertTrue(taxBalance >= threshold, "Tax above threshold before buy");

        // Step 2: Buy — must NOT revert (this is the reentrancy regression test)
        uint256 buyAmount = 0.5 ether;
        vm.deal(user, buyAmount);
        uint256 userTokensBefore = token.balanceOf(user);

        vm.prank(user);
        uint256 amountOut =
            ILBRouterFull(LB_ROUTER).swapExactNATIVEForTokens{value: buyAmount}(0, buyPath, user, block.timestamp);

        // Step 3: Verify buy succeeded and tax was taken
        uint256 actualReceived = token.balanceOf(user) - userTokensBefore;
        uint256 expectedTax = (amountOut * BUY_TAX) / 10_000;
        assertApproxEqAbs(actualReceived, amountOut - expectedTax, 1, "Buy tax applied correctly");

        // Step 4: Verify NO auto-swap happened during the buy
        assertEq(treasury.balance, 0, "No auto-swap during buy even though threshold crossed");
    }

    // ═══════════════════════════════════════════════
    // ── Fork Tests: Auto-Swap via Regular Transfer
    // ═══════════════════════════════════════════════

    function testForkAutoSwapOnRegularTransfer() public{
        ILBRouter.Path memory sellPath = _buildPath(address(token), wavax);

        vm.prank(user);
        token.approve(LB_ROUTER, type(uint256).max);

        // Step 1: Sell to accumulate taxes above threshold
        vm.prank(user);
        ILBRouterFull(LB_ROUTER).swapExactTokensForNATIVE(200e18, 0, sellPath, payable(user), block.timestamp);

        uint256 taxBalance = token.balanceOf(address(token));
        assertTrue(taxBalance >= manager.taxSwapThresholds(address(token)), "Threshold crossed");
        assertEq(treasury.balance, 0, "No AVAX yet");

        // Step 2: Regular user-to-user transfer triggers auto-swap
        uint256 treasuryBefore = treasury.balance;

        vm.prank(user);
        token.transfer(address(0xCAFE), 1e18);

        // Step 3: Verify treasury received real AVAX from Trader Joe
        assertGt(treasury.balance, treasuryBefore, "Treasury received AVAX from auto-swap");

        // Step 4: Verify tax balance drained from token contract
        assertEq(token.balanceOf(address(token)), 0, "Tax balance cleared after swap");
    }

    function testForkFullCycle_SellAccumulate_BuySafe_TransferFlush() public{
        ILBRouter.Path memory sellPath = _buildPath(address(token), wavax);
        ILBRouter.Path memory buyPath = _buildPath(wavax, address(token));

        vm.prank(user);
        token.approve(LB_ROUTER, type(uint256).max);

        // 1. Sell — accumulates tax, no swap
        vm.prank(user);
        ILBRouterFull(LB_ROUTER).swapExactTokensForNATIVE(200e18, 0, sellPath, payable(user), block.timestamp);

        uint256 taxAfterSell = token.balanceOf(address(token));
        assertGt(taxAfterSell, 0, "Tax accumulated from sell");
        assertEq(treasury.balance, 0, "No AVAX to treasury during sell");

        // 2. Buy — more tax accumulates, still no swap, no revert
        vm.deal(user, 1 ether);
        vm.prank(user);
        ILBRouterFull(LB_ROUTER).swapExactNATIVEForTokens{value: 1 ether}(0, buyPath, user, block.timestamp);

        uint256 taxAfterBuy = token.balanceOf(address(token));
        assertGt(taxAfterBuy, taxAfterSell, "Buy added more tax");
        assertEq(treasury.balance, 0, "Still no AVAX to treasury during buy");

        // 3. Regular transfer — flushes all accumulated taxes
        vm.prank(user);
        token.transfer(address(0xCAFE), 1e18);

        assertGt(treasury.balance, 0, "Treasury received AVAX after regular transfer");
        assertEq(token.balanceOf(address(token)), 0, "All taxes flushed");
    }

    // ═══════════════════════════════════════════════
    // ── Internal Helpers ──────────────────────────
    // ═══════════════════════════════════════════════

    function _createPairAndAddLiquidity() internal {
        ILBFactory factory = ILBFactory(LB_FACTORY);

        // Ensure binStep=20 preset is open (impersonate factory owner)
        address factoryOwner = factory.owner();
        vm.prank(factoryOwner);
        factory.setPresetOpenState(BIN_STEP, true);

        // Determine token ordering (LBPair requires tokenX < tokenY)
        IERC20 tokenX;
        IERC20 tokenY;
        if (address(token) < wavax) {
            tokenX = IERC20(address(token));
            tokenY = IERC20(wavax);
        } else {
            tokenX = IERC20(wavax);
            tokenY = IERC20(address(token));
        }

        // Create the pair
        lbPair = factory.createLBPair(tokenX, tokenY, ACTIVE_ID, BIN_STEP);
        assertTrue(lbPair != address(0), "LBPair should be created");

        // Prepare liquidity: spread across 5 bins with deep AVAX
        uint256 tokenAmount = 10_000e18;
        uint256 avaxAmount = 500 ether;

        // Mint tokens for liquidity
        usdc.mint(address(this), 50_000e6);
        usdc.approve(address(market), 50_000e6);
        market.mint(50_000e6);

        // Approve router to spend our tokens
        token.approve(LB_ROUTER, type(uint256).max);

        // 5 bins: 2 below active (WAVAX-heavy), active (mixed), 2 above (token-heavy)
        int256[] memory deltaIds = new int256[](5);
        deltaIds[0] = -2;
        deltaIds[1] = -1;
        deltaIds[2] = 0;
        deltaIds[3] = 1;
        deltaIds[4] = 2;

        // tokenX distribution: only in bins at/above active
        // tokenY distribution: only in bins at/below active
        uint256[] memory distributionX = new uint256[](5);
        uint256[] memory distributionY = new uint256[](5);

        if (address(token) < wavax) {
            // token is X (lower address), wavax is Y
            // X (token) goes in bins at/above active: bins 2,3,4
            distributionX[0] = 0;
            distributionX[1] = 0;
            distributionX[2] = 0.34e18;
            distributionX[3] = 0.33e18;
            distributionX[4] = 0.33e18;
            // Y (wavax) goes in bins at/below active: bins 0,1,2
            distributionY[0] = 0.33e18;
            distributionY[1] = 0.33e18;
            distributionY[2] = 0.34e18;
            distributionY[3] = 0;
            distributionY[4] = 0;
        } else {
            // wavax is X (lower address), token is Y
            // X (wavax) goes in bins at/above active: bins 2,3,4
            distributionX[0] = 0;
            distributionX[1] = 0;
            distributionX[2] = 0.34e18;
            distributionX[3] = 0.33e18;
            distributionX[4] = 0.33e18;
            // Y (token) goes in bins at/below active: bins 0,1,2
            distributionY[0] = 0.33e18;
            distributionY[1] = 0.33e18;
            distributionY[2] = 0.34e18;
            distributionY[3] = 0;
            distributionY[4] = 0;
        }

        uint256 amountX;
        uint256 amountY;
        if (address(token) < wavax) {
            amountX = tokenAmount;
            amountY = avaxAmount;
        } else {
            amountX = avaxAmount;
            amountY = tokenAmount;
        }

        ILBRouterFull.LiquidityParameters memory params = ILBRouterFull.LiquidityParameters({
            tokenX: tokenX,
            tokenY: tokenY,
            binStep: BIN_STEP,
            amountX: amountX,
            amountY: amountY,
            amountXMin: 0,
            amountYMin: 0,
            activeIdDesired: ACTIVE_ID,
            idSlippage: 5,
            deltaIds: deltaIds,
            distributionX: distributionX,
            distributionY: distributionY,
            to: address(this),
            refundTo: address(this),
            deadline: block.timestamp + 300
        });

        vm.deal(address(this), avaxAmount);
        ILBRouterFull(LB_ROUTER).addLiquidityNATIVE{value: avaxAmount}(params);
    }

    function _buildPath(address from, address to) internal pure returns (ILBRouter.Path memory) {
        uint256[] memory pairBinSteps = new uint256[](1);
        pairBinSteps[0] = BIN_STEP;

        ILBRouter.Version[] memory versions = new ILBRouter.Version[](1);
        versions[0] = ILBRouter.Version.V2_2;

        IERC20[] memory tokenPath = new IERC20[](2);
        tokenPath[0] = IERC20(from);
        tokenPath[1] = IERC20(to);

        return ILBRouter.Path({pairBinSteps: pairBinSteps, versions: versions, tokenPath: tokenPath});
    }

    // Required to receive AVAX
    receive() external payable {}
}
