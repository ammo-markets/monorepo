// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./IPriceOracle.sol";

/// @notice Deployable price oracle for testnet calibers with a settable price.
contract MockPriceOracle is IPriceOracle {
    uint256 public price;

    constructor(uint256 price_) {
        price = price_;
    }

    function setPrice(uint256 price_) external {
        price = price_;
    }

    function getPrice() external view override returns (uint256) {
        return price;
    }
}
