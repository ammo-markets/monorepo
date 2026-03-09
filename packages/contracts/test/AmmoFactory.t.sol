// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/AmmoManager.sol";
import "../src/AmmoFactory.sol";
import "../src/PriceOracle.sol";
import "../src/CaliberMarket.sol";
import "./MockERC20.sol";

contract AmmoFactoryTest is Test {
    AmmoManager manager;
    AmmoFactory factory;
    PriceOracle oracle;
    MockERC20 usdc;

    address feeRecipient = address(0xFEE1);
    address alice = address(0xA11CE);

    bytes32 constant CALIBER_9MM = bytes32("9MM");
    bytes32 constant CALIBER_556 = bytes32("556NATO");

    function setUp() public {
        usdc = new MockERC20("USD Coin", "USDC", 6);
        manager = new AmmoManager(feeRecipient);
        oracle = new PriceOracle(address(manager));
        factory = new AmmoFactory(address(manager), address(usdc), 6, address(oracle));
        oracle.setFactory(address(factory));
    }

    // ── Create caliber ──────────────────────────────

    function testCreateCaliber() public {
        (address market, address token) = factory.createCaliber(CALIBER_9MM, "Ammo 9MM", "MO9MM");

        assertTrue(market != address(0));
        assertTrue(token != address(0));

        (address storedMarket, address storedToken) = factory.calibers(CALIBER_9MM);
        assertEq(storedMarket, market);
        assertEq(storedToken, token);
        assertEq(factory.getCaliberCount(), 1);

        // Verify market is wired correctly
        CaliberMarket cm = CaliberMarket(market);
        assertEq(address(cm.manager()), address(manager));
        assertEq(address(cm.oracle()), address(oracle));
        assertEq(cm.caliberId(), CALIBER_9MM);
        assertEq(cm.mintFeeBps(), factory.DEFAULT_MINT_FEE_BPS());
        assertEq(cm.redeemFeeBps(), factory.DEFAULT_REDEEM_FEE_BPS());
        assertEq(cm.minRedeemAmount(), factory.DEFAULT_MIN_REDEEM_AMOUNT());

        // Verify market is registered with oracle
        (,, bool registered) = oracle.markets(market);
        assertTrue(registered);
    }

    function testCreateMultipleCalibers() public {
        factory.createCaliber(CALIBER_9MM, "Ammo 9MM", "MO9MM");
        factory.createCaliber(CALIBER_556, "Ammo 5.56", "MO556");
        assertEq(factory.getCaliberCount(), 2);
    }

    function testCannotCreateDuplicateCaliber() public {
        factory.createCaliber(CALIBER_9MM, "Ammo 9MM", "MO9MM");

        vm.expectRevert(AmmoFactory.CaliberExists.selector);
        factory.createCaliber(CALIBER_9MM, "Ammo 9MM v2", "MO9V2");
    }

    function testOnlyOwnerCanCreateCaliber() public {
        vm.prank(alice);
        vm.expectRevert(AmmoFactory.NotOwner.selector);
        factory.createCaliber(CALIBER_9MM, "Ammo 9MM", "MO9MM");
    }
}
