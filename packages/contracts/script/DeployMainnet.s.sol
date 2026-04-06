// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/PriceOracle.sol";
import "../src/AmmoManager.sol";
import "../src/AmmoFactory.sol";

/// @notice Deploy script for the full Ammo Exchange protocol on Avalanche mainnet.
/// @dev Uses real USDT on Avalanche C-Chain. Role addresses are read from
///      environment variables instead of defaulting to the deployer.
///
///      Required env vars:
///        FEE_RECIPIENT  — address that receives mint/redeem fees
///        TREASURY       — address that receives USDT from mints
///        GUARDIAN       — address that can pause markets
contract DeployMainnet is Script {
    /// @dev Native USDT on Avalanche C-Chain (6 decimals).
    address constant USDT = 0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7;
    uint8 constant USDT_DECIMALS = 6;

    /// @dev WAVAX on Avalanche mainnet.
    address constant WAVAX = 0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7;
    /// @dev Trader Joe LBRouter V2.2 on Avalanche mainnet.
    address constant LB_ROUTER = 0x18556DA13313f3532c54711497A8FedAC273220E;

    AmmoManager public manager;
    PriceOracle public oracle;
    AmmoFactory public factory;

    struct CaliberDeployment {
        address market;
        address token;
    }

    CaliberDeployment public deployed9mmPractice;
    CaliberDeployment public deployed9mmSelfDefense;
    CaliberDeployment public deployed556SelfDefense;
    CaliberDeployment public deployed556NatoPractice;

    function run() external {
        address feeRecipient = vm.envAddress("FEE_RECIPIENT");
        address treasury = vm.envAddress("TREASURY");
        address guardian = vm.envAddress("GUARDIAN");

        vm.startBroadcast();

        // 1. Deploy AmmoManager (owner + initial keeper = deployer)
        manager = new AmmoManager(feeRecipient, WAVAX);
        manager.setTreasury(treasury);
        manager.setGuardian(guardian);
        manager.setDexRouter(LB_ROUTER);

        // 2. Deploy PriceOracle
        oracle = new PriceOracle(address(manager));

        // 3. Deploy AmmoFactory pointing to real USDT
        factory = new AmmoFactory(address(manager), USDT, USDT_DECIMALS, address(oracle));

        // 4. Wire oracle ↔ factory (enables auto-registration of markets)
        oracle.setFactory(address(factory));

        // 5. Create 4 calibers (factory auto-registers each with oracle)
        _deploy9mmPractice();
        _deploy9mmSelfDefense();
        _deploy556SelfDefense();
        _deploy556NatoPractice();

        // 6. Set initial prices via batch update
        _setInitialPrices();

        vm.stopBroadcast();

        _logAddresses();
    }

    function _deploy9mmPractice() internal {
        (address market, address token) = factory.createCaliber(
            bytes32("9MM_PRACTICE"), "Ammo Exchange 9mm Practice", "9MM-P", 150, 150, 50
        );
        deployed9mmPractice = CaliberDeployment(market, token);
    }

    function _deploy9mmSelfDefense() internal {
        (address market, address token) = factory.createCaliber(
            bytes32("9MM_SELF_DEFENSE"), "Ammo Exchange 9mm Self Defense", "9MM-SD", 150, 150, 50
        );
        deployed9mmSelfDefense = CaliberDeployment(market, token);
    }

    function _deploy556SelfDefense() internal {
        (address market, address token) = factory.createCaliber(
            bytes32("556_SELF_DEFENSE"), "Ammo Exchange 5.56 Self Defense", "556-SD", 150, 150, 50
        );
        deployed556SelfDefense = CaliberDeployment(market, token);
    }

    function _deploy556NatoPractice() internal {
        (address market, address token) = factory.createCaliber(
            bytes32("556_NATO_PRACTICE"), "Ammo Exchange 5.56 NATO Practice", "556-P", 150, 150, 50
        );
        deployed556NatoPractice = CaliberDeployment(market, token);
    }

    function _setInitialPrices() internal {
        address[] memory markets = new address[](4);
        uint256[] memory prices = new uint256[](4);

        markets[0] = deployed9mmPractice.market;
        markets[1] = deployed9mmSelfDefense.market;
        markets[2] = deployed556SelfDefense.market;
        markets[3] = deployed556NatoPractice.market;

        prices[0] = 21e16;  // $0.21
        prices[1] = 45e16;  // $0.45
        prices[2] = 55e16;  // $0.55
        prices[3] = 40e16;  // $0.40

        oracle.setBatchPrices(markets, prices);
    }

    function _logAddresses() internal view {
        console.log("=== Mainnet Deployed Addresses ===");
        console.log("USDT (existing):", USDT);
        console.log("AmmoManager:", address(manager));
        console.log("PriceOracle:", address(oracle));
        console.log("AmmoFactory:", address(factory));
        console.log("--- 9MM_PRACTICE ---");
        console.log("Market:", deployed9mmPractice.market);
        console.log("Token:", deployed9mmPractice.token);
        console.log("--- 9MM_SELF_DEFENSE ---");
        console.log("Market:", deployed9mmSelfDefense.market);
        console.log("Token:", deployed9mmSelfDefense.token);
        console.log("--- 556_SELF_DEFENSE ---");
        console.log("Market:", deployed556SelfDefense.market);
        console.log("Token:", deployed556SelfDefense.token);
        console.log("--- 556_NATO_PRACTICE ---");
        console.log("Market:", deployed556NatoPractice.market);
        console.log("Token:", deployed556NatoPractice.token);
    }
}
