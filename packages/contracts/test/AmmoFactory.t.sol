// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/AmmoManager.sol";
import "../src/AmmoFactory.sol";
import "../src/CaliberMarket.sol";
import "./MockPriceOracle.sol";
import "./MockERC20.sol";

contract AmmoFactoryTest is Test {
    AmmoManager manager;
    AmmoFactory factory;
    MockERC20 usdc;
    MockPriceOracle oracle;

    address feeRecipient = address(0xFEE1);
    address alice = address(0xA11CE);

    bytes32 constant CALIBER_9MM = bytes32("9MM");
    bytes32 constant CALIBER_556 = bytes32("556NATO");

    function setUp() public {
        usdc = new MockERC20("USD Coin", "USDC", 6);
        manager = new AmmoManager(feeRecipient);
        factory = new AmmoFactory(address(manager), address(usdc), 6);
        oracle = new MockPriceOracle(21e16); // $0.21
    }

    // ── Create caliber ──────────────────────────────

    function testCreateCaliber() public {
        (address market, address token) =
            factory.createCaliber(CALIBER_9MM, "Ammo 9MM", "MO9MM", address(oracle), 150, 150, 50);

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
        assertEq(cm.mintFeeBps(), 150);
        assertEq(cm.minMintRounds(), 50);
    }

    function testCreateMultipleCalibers() public {
        factory.createCaliber(CALIBER_9MM, "Ammo 9MM", "MO9MM", address(oracle), 150, 150, 50);
        factory.createCaliber(CALIBER_556, "Ammo 5.56", "MO556", address(oracle), 200, 200, 25);
        assertEq(factory.getCaliberCount(), 2);
    }

    function testCannotCreateDuplicateCaliber() public {
        factory.createCaliber(CALIBER_9MM, "Ammo 9MM", "MO9MM", address(oracle), 150, 150, 50);

        vm.expectRevert(AmmoFactory.CaliberExists.selector);
        factory.createCaliber(CALIBER_9MM, "Ammo 9MM v2", "MO9V2", address(oracle), 150, 150, 50);
    }

    function testOnlyOwnerCanCreateCaliber() public {
        vm.prank(alice);
        vm.expectRevert(AmmoFactory.NotOwner.selector);
        factory.createCaliber(CALIBER_9MM, "Ammo 9MM", "MO9MM", address(oracle), 150, 150, 50);
    }

    function testCannotCreateWithZeroOracle() public {
        vm.expectRevert(AmmoFactory.ZeroAddress.selector);
        factory.createCaliber(CALIBER_9MM, "Ammo 9MM", "MO9MM", address(0), 150, 150, 50);
    }
}
