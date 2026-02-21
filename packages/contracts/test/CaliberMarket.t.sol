// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/AmmoManager.sol";
import "../src/CaliberMarket.sol";
import "../src/AmmoToken.sol";
import "./MockPriceOracle.sol";
import "./MockERC20.sol";

contract CaliberMarketTest is Test {
    AmmoManager manager;
    CaliberMarket market;
    AmmoToken ammoToken;
    MockERC20 usdc;
    MockPriceOracle oracle;

    address user = address(0xBEEF);
    address keeper = address(0xCA11);
    address feeRecipient = address(0xFEE1);
    address guardian = address(0x911);
    address treasury = address(0x73EA5);

    bytes32 constant CALIBER_9MM = bytes32("9MM");
    uint256 constant ORACLE_PRICE = 21e16; // $0.21 per round

    function setUp() public {
        usdc = new MockERC20("USD Coin", "USDC", 6);
        oracle = new MockPriceOracle(ORACLE_PRICE);

        manager = new AmmoManager(feeRecipient);
        manager.setKeeper(keeper, true);
        manager.setGuardian(guardian);
        manager.setTreasury(treasury);

        market = new CaliberMarket(
            address(manager), address(usdc), 6, address(oracle), CALIBER_9MM, "Ammo 9MM", "MO9MM", 150, 150, 50
        );

        ammoToken = market.token();

        usdc.mint(user, 1_000e6);
    }

    // ── startMint ───────────────────────────────────

    function testStartMintCreatesOrder() public {
        vm.prank(user);
        usdc.approve(address(market), 100e6);

        vm.prank(user);
        uint256 orderId = market.startMint(100e6, 500, 0); // 5% slippage

        assertEq(usdc.balanceOf(user), 900e6);
        assertEq(usdc.balanceOf(address(market)), 100e6);

        (
            address orderUser,
            uint256 usdcAmt,
            uint256 minOut,
            uint256 reqPrice,
            uint256 feeBps,
            uint256 minMintAtStart,
            uint64 deadline,
            uint64 created,
            uint64 finalized,
            CaliberMarket.MintStatus status
        ) = market.mintOrders(orderId);

        assertEq(orderUser, user);
        assertEq(usdcAmt, 100e6);
        assertEq(reqPrice, ORACLE_PRICE);
        assertEq(feeBps, 150);
        assertEq(minMintAtStart, 50);
        assertEq(deadline, 0);
        assertTrue(created > 0);
        assertEq(finalized, 0);
        assertEq(uint256(status), uint256(CaliberMarket.MintStatus.Started));

        // Verify minTokensOut is computed correctly:
        // fee = 100e6 * 150 / 10_000 = 1_500_000
        // netUsdc = 98_500_000
        // expectedTokens = 98_500_000 * 1e12 * 1e18 / 21e16
        // minOut = expectedTokens * (10_000 - 500) / 10_000 = expectedTokens * 95%
        uint256 expectedTokens = (uint256(98_500_000) * 1e12 * 1e18) / ORACLE_PRICE;
        uint256 expectedMinOut = (expectedTokens * 9500) / 10_000;
        assertEq(minOut, expectedMinOut);
    }

    function testStartMintSnapshotsOraclePrice() public {
        _startMint(user, 100e6, 500, 0);

        (,,, uint256 reqPrice,,,,,,) = market.mintOrders(1);
        assertEq(reqPrice, ORACLE_PRICE);

        // Changing oracle after startMint doesn't affect stored price
        oracle.setPrice(50e16);
        (,,, uint256 reqPriceAfter,,,,,,) = market.mintOrders(1);
        assertEq(reqPriceAfter, ORACLE_PRICE);
    }

    function testStartMintRejectsInvalidSlippageBps() public {
        vm.prank(user);
        usdc.approve(address(market), 100e6);

        vm.prank(user);
        vm.expectRevert(CaliberMarket.InvalidBps.selector);
        market.startMint(100e6, 10_001, 0);
    }

    // ── finalizeMint ────────────────────────────────

    function testFinalizeMintUsesActualPrice() public {
        _startMint(user, 100e6, 1000, 0); // 10% slippage

        vm.prank(keeper);
        market.finalizeMint(1, ORACLE_PRICE);

        // fee = 100e6 * 150 / 10_000 = 1_500_000
        // netUsdc = 98_500_000
        // tokenAmount = 98_500_000 * 1e12 * 1e18 / 21e16
        uint256 expectedTokens = (uint256(98_500_000) * 1e12 * 1e18) / ORACLE_PRICE;
        assertEq(ammoToken.balanceOf(user), expectedTokens);
        assertEq(usdc.balanceOf(feeRecipient), 1_500_000);
    }

    function testFinalizeMintRespectsDeadline() public {
        vm.prank(user);
        usdc.approve(address(market), 100e6);

        vm.prank(user);
        market.startMint(100e6, 1000, uint64(block.timestamp + 60));

        vm.warp(block.timestamp + 120);

        vm.prank(keeper);
        vm.expectRevert(CaliberMarket.DeadlineExpired.selector);
        market.finalizeMint(1, ORACLE_PRICE);
    }

    function testFinalizeMintRespectsSlippage() public {
        // 0 bps slippage = minTokensOut == expectedTokens at oracle price
        _startMint(user, 100e6, 0, 0);

        // Finalize at a higher price → fewer tokens → should revert
        vm.prank(keeper);
        vm.expectRevert(CaliberMarket.Slippage.selector);
        market.finalizeMint(1, 25e16); // $0.25 vs oracle $0.21
    }

    function testSlippageRevertsOnPriceIncrease() public {
        // 10% slippage tolerance, oracle at $0.21
        _startMint(user, 100e6, 1000, 0);

        // $0.25 is ~19% above $0.21 — exceeds 10% tolerance
        vm.prank(keeper);
        vm.expectRevert(CaliberMarket.Slippage.selector);
        market.finalizeMint(1, 25e16);
    }

    function testSlippageAllowsWithinTolerance() public {
        // 10% slippage tolerance, oracle at $0.21
        _startMint(user, 100e6, 1000, 0);

        // $0.22 is ~4.8% above $0.21 — within 10% tolerance
        vm.prank(keeper);
        market.finalizeMint(1, 22e16);

        uint256 expectedTokens = (uint256(98_500_000) * 1e12 * 1e18) / 22e16;
        assertEq(ammoToken.balanceOf(user), expectedTokens);
    }

    function testFinalizeMintRespectsMinMintRounds() public {
        oracle.setPrice(100e18); // $100 per round
        _startMint(user, 100e6, 10_000, 0); // 100% slippage (won't revert on slippage)

        vm.prank(keeper);
        vm.expectRevert(CaliberMarket.MinMintNotMet.selector);
        market.finalizeMint(1, 100e18);
    }

    function testFinalizeMintOnlyKeeper() public {
        _startMint(user, 100e6, 1000, 0);

        vm.prank(user);
        vm.expectRevert(CaliberMarket.NotKeeper.selector);
        market.finalizeMint(1, ORACLE_PRICE);
    }

    function testFinalizeMintRejectsZeroPrice() public {
        _startMint(user, 100e6, 1000, 0);

        vm.prank(keeper);
        vm.expectRevert(CaliberMarket.InvalidPrice.selector);
        market.finalizeMint(1, 0);
    }

    // ── refundMint ──────────────────────────────────

    function testRefundMintReturnsUsdc() public {
        _startMint(user, 100e6, 1000, 0);

        vm.prank(keeper);
        market.refundMint(1, 1);

        assertEq(usdc.balanceOf(user), 1_000e6);

        (,,,,,,,,, CaliberMarket.MintStatus status) = market.mintOrders(1);
        assertEq(uint256(status), uint256(CaliberMarket.MintStatus.Refunded));
    }

    // ── startRedeem + finalizeRedeem ────────────────

    function testRedeemFlowBurnsAndFees() public {
        _mintTokensToUser(user);
        uint256 userBalance = ammoToken.balanceOf(user);
        assertTrue(userBalance > 100e18);

        vm.prank(user);
        ammoToken.approve(address(market), 100e18);

        vm.prank(user);
        uint256 orderId = market.startRedeem(100e18, 0);

        assertEq(ammoToken.balanceOf(address(market)), 100e18);

        vm.prank(keeper);
        market.finalizeRedeem(orderId);

        // fee = 100e18 * 150 / 10_000 = 1.5e18
        // netTokens = 98.5e18 → burned
        assertEq(ammoToken.balanceOf(address(market)), 0);
        assertEq(ammoToken.balanceOf(feeRecipient), 1.5e18);
    }

    // ── cancelRedeem ────────────────────────────────

    function testCancelRedeemUnlocksTokens() public {
        _mintTokensToUser(user);

        vm.prank(user);
        ammoToken.approve(address(market), 100e18);

        vm.prank(user);
        uint256 orderId = market.startRedeem(100e18, 0);

        uint256 balBefore = ammoToken.balanceOf(user);

        vm.prank(keeper);
        market.cancelRedeem(orderId, 2);

        assertEq(ammoToken.balanceOf(user), balBefore + 100e18);
        assertEq(ammoToken.balanceOf(address(market)), 0);
    }

    // ── Pause ───────────────────────────────────────

    function testPauseBlocksUserFlows() public {
        market.pause();

        vm.prank(user);
        usdc.approve(address(market), 100e6);

        vm.prank(user);
        vm.expectRevert(CaliberMarket.MarketPaused.selector);
        market.startMint(100e6, 500, 0);
    }

    function testGuardianCanPause() public {
        vm.prank(guardian);
        market.pause();
        assertTrue(market.paused());
    }

    function testGuardianCannotUnpause() public {
        market.pause();

        vm.prank(guardian);
        vm.expectRevert(CaliberMarket.NotOwner.selector);
        market.unpause();
    }

    // ── Admin ───────────────────────────────────────

    function testSetMintFee() public {
        market.setMintFee(300);
        assertEq(market.mintFeeBps(), 300);
    }

    function testSetRedeemFee() public {
        market.setRedeemFee(300);
        assertEq(market.redeemFeeBps(), 300);
    }

    function testSetMinMint() public {
        market.setMinMint(100);
        assertEq(market.minMintRounds(), 100);
    }

    // ── State-machine integrity ─────────────────

    function testCannotFinalizeMintTwice() public {
        _startMint(user, 100e6, 1000, 0);

        vm.prank(keeper);
        market.finalizeMint(1, ORACLE_PRICE);

        vm.prank(keeper);
        vm.expectRevert(CaliberMarket.InvalidStatus.selector);
        market.finalizeMint(1, ORACLE_PRICE);
    }

    function testCannotFinalizeMintAfterRefund() public {
        _startMint(user, 100e6, 1000, 0);

        vm.prank(keeper);
        market.refundMint(1, 1);

        vm.prank(keeper);
        vm.expectRevert(CaliberMarket.InvalidStatus.selector);
        market.finalizeMint(1, ORACLE_PRICE);
    }

    function testCannotRefundMintAfterFinalize() public {
        _startMint(user, 100e6, 1000, 0);

        vm.prank(keeper);
        market.finalizeMint(1, ORACLE_PRICE);

        vm.prank(keeper);
        vm.expectRevert(CaliberMarket.InvalidStatus.selector);
        market.refundMint(1, 1);
    }

    function testCannotFinalizeRedeemTwice() public {
        _mintTokensToUser(user);

        vm.prank(user);
        ammoToken.approve(address(market), 100e18);
        vm.prank(user);
        uint256 orderId = market.startRedeem(100e18, 0);

        vm.prank(keeper);
        market.finalizeRedeem(orderId);

        vm.prank(keeper);
        vm.expectRevert(CaliberMarket.InvalidStatus.selector);
        market.finalizeRedeem(orderId);
    }

    function testCannotCancelRedeemAfterFinalize() public {
        _mintTokensToUser(user);

        vm.prank(user);
        ammoToken.approve(address(market), 100e18);
        vm.prank(user);
        uint256 orderId = market.startRedeem(100e18, 0);

        vm.prank(keeper);
        market.finalizeRedeem(orderId);

        vm.prank(keeper);
        vm.expectRevert(CaliberMarket.InvalidStatus.selector);
        market.cancelRedeem(orderId, 1);
    }

    // ── Access control parity ─────────────────────

    function testRefundMintOnlyKeeper() public {
        _startMint(user, 100e6, 1000, 0);

        vm.prank(user);
        vm.expectRevert(CaliberMarket.NotKeeper.selector);
        market.refundMint(1, 1);
    }

    function testFinalizeRedeemOnlyKeeper() public {
        _mintTokensToUser(user);

        vm.prank(user);
        ammoToken.approve(address(market), 100e18);
        vm.prank(user);
        uint256 orderId = market.startRedeem(100e18, 0);

        vm.prank(user);
        vm.expectRevert(CaliberMarket.NotKeeper.selector);
        market.finalizeRedeem(orderId);
    }

    function testCancelRedeemOnlyKeeper() public {
        _mintTokensToUser(user);

        vm.prank(user);
        ammoToken.approve(address(market), 100e18);
        vm.prank(user);
        uint256 orderId = market.startRedeem(100e18, 0);

        vm.prank(user);
        vm.expectRevert(CaliberMarket.NotKeeper.selector);
        market.cancelRedeem(orderId, 1);
    }

    // ── Pause parity ──────────────────────────────

    function testPauseBlocksStartRedeem() public {
        _mintTokensToUser(user);
        market.pause();

        vm.prank(user);
        ammoToken.approve(address(market), 100e18);

        vm.prank(user);
        vm.expectRevert(CaliberMarket.MarketPaused.selector);
        market.startRedeem(100e18, 0);
    }

    // ── Redeem deadline ───────────────────────────

    function testFinalizeRedeemRespectsDeadline() public {
        _mintTokensToUser(user);

        vm.prank(user);
        ammoToken.approve(address(market), 100e18);
        vm.prank(user);
        uint256 orderId = market.startRedeem(100e18, uint64(block.timestamp + 60));

        vm.warp(block.timestamp + 120);

        vm.prank(keeper);
        vm.expectRevert(CaliberMarket.DeadlineExpired.selector);
        market.finalizeRedeem(orderId);
    }

    // ═══════════════════════════════════════════════
    // ── Finding 1: USDC treasury forwarding ───────
    // ═══════════════════════════════════════════════

    function testFinalizeMintForwardsNetUsdcToTreasury() public {
        _startMint(user, 100e6, 1000, 0);

        vm.prank(keeper);
        market.finalizeMint(1, ORACLE_PRICE);

        // fee = 100e6 * 150 / 10_000 = 1_500_000
        // netUsdc = 98_500_000
        assertEq(usdc.balanceOf(treasury), 98_500_000);
        assertEq(usdc.balanceOf(address(market)), 0);
    }

    function testFinalizeMintRevertsWhenTreasuryNotSet() public {
        // Deploy fresh manager without treasury set
        AmmoManager freshManager = new AmmoManager(feeRecipient);
        freshManager.setKeeper(keeper, true);
        // treasury is address(0) by default — NOT set

        CaliberMarket freshMarket = new CaliberMarket(
            address(freshManager), address(usdc), 6, address(oracle), CALIBER_9MM, "Ammo 9MM", "MO9MM", 150, 150, 50
        );

        usdc.mint(user, 100e6);
        vm.prank(user);
        usdc.approve(address(freshMarket), 100e6);
        vm.prank(user);
        freshMarket.startMint(100e6, 1000, 0);

        vm.prank(keeper);
        vm.expectRevert(CaliberMarket.TreasuryNotSet.selector);
        freshMarket.finalizeMint(1, ORACLE_PRICE);
    }

    function testFinalizeMintZeroFeeAllUsdcGoesToTreasury() public {
        // Deploy market with 0% mint fee
        CaliberMarket zeroFeeMarket = new CaliberMarket(
            address(manager), address(usdc), 6, address(oracle), CALIBER_9MM, "Ammo 9MM Zero", "MO9Z", 0, 150, 50
        );

        usdc.mint(user, 100e6);
        vm.prank(user);
        usdc.approve(address(zeroFeeMarket), 100e6);
        vm.prank(user);
        zeroFeeMarket.startMint(100e6, 1000, 0);

        vm.prank(keeper);
        zeroFeeMarket.finalizeMint(1, ORACLE_PRICE);

        // 0% fee → all 100e6 goes to treasury
        assertEq(usdc.balanceOf(treasury), 100e6);
        assertEq(usdc.balanceOf(feeRecipient), 0);
        assertEq(usdc.balanceOf(address(zeroFeeMarket)), 0);
    }

    // ═══════════════════════════════════════════════
    // ── Finding 2: Fee snapshot ───────────────────
    // ═══════════════════════════════════════════════

    function testFinalizeMintUsesSnapshotFee() public {
        _startMint(user, 100e6, 1000, 0); // fee snapshot = 150 bps

        // Admin changes fee after order creation
        market.setMintFee(500); // 5%

        vm.prank(keeper);
        market.finalizeMint(1, ORACLE_PRICE);

        // Should use 150 bps (snapshot), NOT 500 bps
        // fee = 100e6 * 150 / 10_000 = 1_500_000
        assertEq(usdc.balanceOf(feeRecipient), 1_500_000);
        assertEq(usdc.balanceOf(treasury), 98_500_000);
    }

    function testFinalizeRedeemUsesSnapshotFee() public {
        _mintTokensToUser(user);

        vm.prank(user);
        ammoToken.approve(address(market), 100e18);
        vm.prank(user);
        uint256 orderId = market.startRedeem(100e18, 0); // fee snapshot = 150 bps

        // Admin changes redeem fee after order creation
        market.setRedeemFee(500); // 5%

        vm.prank(keeper);
        market.finalizeRedeem(orderId);

        // Should use 150 bps (snapshot), NOT 500 bps
        // fee = 100e18 * 150 / 10_000 = 1.5e18
        assertEq(ammoToken.balanceOf(feeRecipient), 1.5e18);
    }

    function testMintOrderStoresFeeBps() public {
        _startMint(user, 100e6, 500, 0);

        (,,,, uint256 feeBps,,,,, ) = market.mintOrders(1);
        assertEq(feeBps, 150);
    }

    function testRedeemOrderStoresFeeBps() public {
        _mintTokensToUser(user);

        vm.prank(user);
        ammoToken.approve(address(market), 100e18);
        vm.prank(user);
        market.startRedeem(100e18, 0);

        (,, uint256 feeBps,,,,) = market.redeemOrders(2);
        assertEq(feeBps, 150);
    }

    // ═══════════════════════════════════════════════
    // ── Finding 3: minMintRounds snapshot ─────────
    // ═══════════════════════════════════════════════

    function testFinalizeMintUsesSnapshotMinMintRounds() public {
        // minMintRounds is 50 at order creation
        _startMint(user, 100e6, 1000, 0);

        // Admin increases minMintRounds after order creation
        market.setMinMint(1_000_000); // impossibly high

        // Finalize should use snapshot value (50), not current (1_000_000)
        vm.prank(keeper);
        market.finalizeMint(1, ORACLE_PRICE); // should succeed
    }

    // ═══════════════════════════════════════════════
    // ── Pause: irreversible blocked, unwind allowed
    // ═══════════════════════════════════════════════

    function testPauseBlocksFinalizeMint() public {
        _startMint(user, 100e6, 1000, 0);
        market.pause();

        vm.prank(keeper);
        vm.expectRevert(CaliberMarket.MarketPaused.selector);
        market.finalizeMint(1, ORACLE_PRICE);
    }

    function testPauseBlocksFinalizeRedeem() public {
        _mintTokensToUser(user);

        vm.prank(user);
        ammoToken.approve(address(market), 100e18);
        vm.prank(user);
        uint256 orderId = market.startRedeem(100e18, 0);

        market.pause();

        vm.prank(keeper);
        vm.expectRevert(CaliberMarket.MarketPaused.selector);
        market.finalizeRedeem(orderId);
    }

    function testPauseAllowsRefundMint() public {
        _startMint(user, 100e6, 1000, 0);
        market.pause();

        vm.prank(keeper);
        market.refundMint(1, 1);

        assertEq(usdc.balanceOf(user), 1_000e6);
    }

    function testPauseAllowsCancelRedeem() public {
        _mintTokensToUser(user);
        uint256 balBefore = ammoToken.balanceOf(user);

        vm.prank(user);
        ammoToken.approve(address(market), 100e18);
        vm.prank(user);
        uint256 orderId = market.startRedeem(100e18, 0);

        market.pause();

        vm.prank(keeper);
        market.cancelRedeem(orderId, 1);

        assertEq(ammoToken.balanceOf(user), balBefore);
    }

    // ═══════════════════════════════════════════════
    // ── CNTR-01: Deadline validation at initiation ─
    // ═══════════════════════════════════════════════

    function testStartMintRejectsDeadlineInPast() public {
        vm.warp(1000);

        vm.prank(user);
        usdc.approve(address(market), 100e6);

        vm.prank(user);
        vm.expectRevert(CaliberMarket.DeadlineInPast.selector);
        market.startMint(100e6, 500, uint64(500));
    }

    function testStartMintAllowsZeroDeadline() public {
        vm.prank(user);
        usdc.approve(address(market), 100e6);

        vm.prank(user);
        uint256 orderId = market.startMint(100e6, 500, 0);
        assertEq(orderId, 1);
    }

    function testStartMintAllowsFutureDeadline() public {
        vm.prank(user);
        usdc.approve(address(market), 100e6);

        vm.prank(user);
        uint256 orderId = market.startMint(100e6, 500, uint64(block.timestamp + 60));
        assertEq(orderId, 1);
    }

    function testStartRedeemRejectsDeadlineInPast() public {
        _mintTokensToUser(user);
        uint256 redeemAmount = 100e18;

        vm.warp(1000);

        vm.prank(user);
        ammoToken.approve(address(market), redeemAmount);

        vm.prank(user);
        vm.expectRevert(CaliberMarket.DeadlineInPast.selector);
        market.startRedeem(redeemAmount, uint64(500));
    }

    function testStartRedeemAllowsZeroDeadline() public {
        _mintTokensToUser(user);

        vm.prank(user);
        ammoToken.approve(address(market), 100e18);

        vm.prank(user);
        uint256 orderId = market.startRedeem(100e18, 0);
        assertTrue(orderId > 0);
    }

    // ═══════════════════════════════════════════════
    // ── CNTR-02: Price sanity bounds ───────────────
    // ═══════════════════════════════════════════════

    function testFinalizeMintRejectsPriceTooLow() public {
        _startMint(user, 100e6, 10_000, 0); // 100% slippage so slippage check won't interfere

        // Oracle at 21e16, floor = 21e16 * 5000 / 10000 = 10.5e16
        // 10e16 is below floor
        vm.prank(keeper);
        vm.expectRevert(CaliberMarket.PriceTooLow.selector);
        market.finalizeMint(1, 10e16);
    }

    function testFinalizeMintRejectsPriceTooHigh() public {
        _startMint(user, 100e6, 10_000, 0); // 100% slippage

        // Oracle at 21e16, ceiling = 21e16 * 15000 / 10000 = 31.5e16
        // 50e16 is above ceiling
        vm.prank(keeper);
        vm.expectRevert(CaliberMarket.PriceTooHigh.selector);
        market.finalizeMint(1, 50e16);
    }

    function testFinalizeMintAllowsPriceWithinBounds() public {
        _startMint(user, 100e6, 10_000, 0); // 100% slippage

        // Oracle at 21e16, ceiling = 31.5e16
        // 30e16 is within bounds
        vm.prank(keeper);
        market.finalizeMint(1, 30e16);

        uint256 expectedTokens = (uint256(98_500_000) * 1e12 * 1e18) / 30e16;
        assertEq(ammoToken.balanceOf(user), expectedTokens);
    }

    function testSetMaxPriceDeviation() public {
        // Tighten deviation to 10%
        market.setMaxPriceDeviation(1000);
        assertEq(market.maxPriceDeviationBps(), 1000);

        _startMint(user, 100e6, 10_000, 0); // 100% slippage

        // Oracle at 21e16, ceiling with 10% = 21e16 * 11000 / 10000 = 23.1e16
        // 25e16 (~19% above oracle) exceeds 10% ceiling
        vm.prank(keeper);
        vm.expectRevert(CaliberMarket.PriceTooHigh.selector);
        market.finalizeMint(1, 25e16);
    }

    // ===============================================
    // -- TEST-05: E2E Happy Path Flows
    // ===============================================

    function testE2EMintInitiationHappyPath() public {
        // User starts with 1000 USDC
        assertEq(usdc.balanceOf(user), 1_000e6);

        // User approves market for 200 USDC
        vm.prank(user);
        usdc.approve(address(market), 200e6);

        // User calls startMint(200e6, 500, 0) -- 5% slippage, no deadline
        vm.prank(user);
        uint256 orderId = market.startMint(200e6, 500, 0);

        // Assert: user USDC balance decreased by 200e6
        assertEq(usdc.balanceOf(user), 800e6);

        // Assert: market USDC balance is 200e6
        assertEq(usdc.balanceOf(address(market)), 200e6);

        // Assert: mint order status is Started
        (
            address orderUser,
            uint256 usdcAmt,
            ,
            uint256 reqPrice,
            ,
            ,
            ,
            ,
            ,
            CaliberMarket.MintStatus status
        ) = market.mintOrders(orderId);

        assertEq(uint256(status), uint256(CaliberMarket.MintStatus.Started));

        // Assert: order stores correct usdcAmount, user address, requestPrice
        assertEq(orderUser, user);
        assertEq(usdcAmt, 200e6);
        assertEq(reqPrice, ORACLE_PRICE);
    }

    function testE2ERedeemInitiationHappyPath() public {
        // Mint tokens to user first (using _mintTokensToUser helper)
        _mintTokensToUser(user);
        uint256 userBalanceBefore = ammoToken.balanceOf(user);
        assertTrue(userBalanceBefore > 0);

        // User approves market for 200e18 tokens
        uint256 redeemAmount = 200e18;
        vm.prank(user);
        ammoToken.approve(address(market), redeemAmount);

        // User calls startRedeem(200e18, 0) -- no deadline
        vm.prank(user);
        uint256 orderId = market.startRedeem(redeemAmount, 0);

        // Assert: tokens transferred from user to market
        assertEq(ammoToken.balanceOf(user), userBalanceBefore - redeemAmount);
        assertEq(ammoToken.balanceOf(address(market)), redeemAmount);

        // Assert: redeem order status is Requested
        (
            address orderUser,
            uint256 tokenAmount,
            ,
            ,
            ,
            ,
            CaliberMarket.RedeemStatus status
        ) = market.redeemOrders(orderId);

        assertEq(uint256(status), uint256(CaliberMarket.RedeemStatus.Requested));

        // Assert: order stores correct tokenAmount and user address
        assertEq(orderUser, user);
        assertEq(tokenAmount, redeemAmount);
    }

    function testE2EKeeperFinalizationHappyPath() public {
        // Create a mint order end-to-end
        vm.prank(user);
        usdc.approve(address(market), 200e6);
        vm.prank(user);
        uint256 orderId = market.startMint(200e6, 1000, 0); // 10% slippage

        // Finalize the mint order
        vm.prank(keeper);
        market.finalizeMint(orderId, ORACLE_PRICE);

        // Assert: user received minted tokens (balance > 0)
        assertTrue(ammoToken.balanceOf(user) > 0);

        // Assert: fee recipient received fee USDC
        // fee = 200e6 * 150 / 10_000 = 3_000_000
        assertEq(usdc.balanceOf(feeRecipient), 3_000_000);

        // Assert: treasury received net USDC
        // netUsdc = 200e6 - 3_000_000 = 197_000_000
        assertEq(usdc.balanceOf(treasury), 197_000_000);

        // Assert: market USDC balance is 0 (all distributed)
        assertEq(usdc.balanceOf(address(market)), 0);

        // Assert: mint order status is Finalized
        (,,,,,,,,, CaliberMarket.MintStatus status) = market.mintOrders(orderId);
        assertEq(uint256(status), uint256(CaliberMarket.MintStatus.Finalized));
    }

    // ── Helpers ─────────────────────────────────────

    function _startMint(address who, uint256 usdcAmount, uint256 slippageBps, uint64 deadline) internal {
        vm.prank(who);
        usdc.approve(address(market), usdcAmount);
        vm.prank(who);
        market.startMint(usdcAmount, slippageBps, deadline);
    }

    function _mintTokensToUser(address who) internal {
        _startMint(who, 100e6, 1000, 0); // 10% slippage
        vm.prank(keeper);
        market.finalizeMint(1, ORACLE_PRICE);
    }
}
