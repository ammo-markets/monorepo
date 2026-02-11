// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/MockUSDC.sol";
import "../src/MockPriceOracle.sol";
import "../src/AmmoManager.sol";
import "../src/AmmoFactory.sol";

/// @notice Single deploy script for the full Ammo Exchange protocol on Fuji testnet.
/// @dev Deploys MockUSDC, AmmoManager (with roles), AmmoFactory, 4 oracles, and 4 calibers.
///      All testnet roles (keeper, treasury, guardian, feeRecipient) are set to the deployer.
contract DeployFuji is Script {
    // Store deployed addresses at contract level to avoid stack-too-deep
    MockUSDC public usdc;
    AmmoManager public manager;
    AmmoFactory public factory;

    struct CaliberDeployment {
        address oracle;
        address market;
        address token;
    }

    CaliberDeployment public deployed9mm;
    CaliberDeployment public deployed556;
    CaliberDeployment public deployed22lr;
    CaliberDeployment public deployed308;

    function run() external {
        vm.startBroadcast();

        // 1. Deploy MockUSDC
        usdc = new MockUSDC();

        // 2. Deploy AmmoManager (constructor sets owner=msg.sender, keepers[msg.sender]=true, feeRecipient=msg.sender)
        manager = new AmmoManager(msg.sender);

        // 3. Set treasury and guardian to deployer (constructor leaves these as address(0))
        manager.setTreasury(msg.sender);
        manager.setGuardian(msg.sender);

        // 4. Deploy AmmoFactory
        factory = new AmmoFactory(address(manager), address(usdc), 6);

        // 5. Deploy oracles and create calibers
        _deploy9mm();
        _deploy556();
        _deploy22lr();
        _deploy308();

        vm.stopBroadcast();

        // Log all deployed addresses
        _logAddresses();
    }

    function _deploy9mm() internal {
        MockPriceOracle oracle = new MockPriceOracle(21e16); // $0.21/round
        (address market, address token) = factory.createCaliber(
            bytes32("9MM"), "Ammo 9MM", "MO9MM", address(oracle), 150, 150, 50
        );
        deployed9mm = CaliberDeployment(address(oracle), market, token);
    }

    function _deploy556() internal {
        MockPriceOracle oracle = new MockPriceOracle(45e16); // $0.45/round
        (address market, address token) = factory.createCaliber(
            bytes32("556"), "Ammo 556", "MO556", address(oracle), 150, 150, 50
        );
        deployed556 = CaliberDeployment(address(oracle), market, token);
    }

    function _deploy22lr() internal {
        MockPriceOracle oracle = new MockPriceOracle(8e16); // $0.08/round
        (address market, address token) = factory.createCaliber(
            bytes32("22LR"), "Ammo 22LR", "MO22LR", address(oracle), 150, 150, 100
        );
        deployed22lr = CaliberDeployment(address(oracle), market, token);
    }

    function _deploy308() internal {
        MockPriceOracle oracle = new MockPriceOracle(90e16); // $0.90/round
        (address market, address token) = factory.createCaliber(
            bytes32("308"), "Ammo 308", "MO308", address(oracle), 150, 150, 20
        );
        deployed308 = CaliberDeployment(address(oracle), market, token);
    }

    function _logAddresses() internal view {
        console.log("=== Deployed Addresses ===");
        console.log("MockUSDC:", address(usdc));
        console.log("AmmoManager:", address(manager));
        console.log("AmmoFactory:", address(factory));
        console.log("--- 9MM ---");
        console.log("Oracle:", deployed9mm.oracle);
        console.log("Market:", deployed9mm.market);
        console.log("Token:", deployed9mm.token);
        console.log("--- 556 ---");
        console.log("Oracle:", deployed556.oracle);
        console.log("Market:", deployed556.market);
        console.log("Token:", deployed556.token);
        console.log("--- 22LR ---");
        console.log("Oracle:", deployed22lr.oracle);
        console.log("Market:", deployed22lr.market);
        console.log("Token:", deployed22lr.token);
        console.log("--- 308 ---");
        console.log("Oracle:", deployed308.oracle);
        console.log("Market:", deployed308.market);
        console.log("Token:", deployed308.token);
    }
}
