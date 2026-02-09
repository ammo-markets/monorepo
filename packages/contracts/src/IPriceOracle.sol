// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @notice Oracle interface for ammo round pricing.
/// @dev Implementations must return the price of one round denominated in USDC,
///      scaled to 18 decimals (1e18 = 1 USDC per round).
interface IPriceOracle {
    /// @notice Returns the current price of one round in USDC (1e18 scale).
    function getPrice() external view returns (uint256 priceX18);
}
