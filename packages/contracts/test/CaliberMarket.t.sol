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

    bytes32 constant CALIBER_9MM = bytes32("9MM");
    uint256 constant ORACLE_PRICE = 21e16; // $0.21 per round

    function setUp() public {
        usdc = new MockERC20("USD Coin", "USDC", 6);
        oracle = new MockPriceOracle(ORACLE_PRICE);

        manager = new AmmoManager(feeRecipient);
        manager.setKeeper(keeper, true);
        manager.setGuardian(guardian);

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
            uint64 deadline,
            uint64 created,
            uint64 finalized,
            CaliberMarket.MintStatus status
        ) = market.mintOrders(orderId);

        assertEq(orderUser, user);
        assertEq(usdcAmt, 100e6);
        assertEq(reqPrice, ORACLE_PRICE);
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

        (,, , uint256 reqPrice,,,,) = market.mintOrders(1);
        assertEq(reqPrice, ORACLE_PRICE);

        // Changing oracle after startMint doesn't affect stored price
        oracle.setPrice(50e16);
        (,, , uint256 reqPriceAfter,,,,) = market.mintOrders(1);
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

        (,,,,,, , CaliberMarket.MintStatus status) = market.mintOrders(1);
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
