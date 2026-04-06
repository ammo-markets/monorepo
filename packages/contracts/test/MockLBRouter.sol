// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ILBRouter} from "../src/interfaces/ILBRouter.sol";
import {IERC20} from "../src/interfaces/IERC20.sol";

/// @notice Mock Trader Joe LBRouter for testing AmmoToken tax auto-swaps.
/// @dev Simulates swapExactTokensForNATIVE: pulls tokens via transferFrom, sends AVAX to recipient.
///      Must be funded with AVAX via vm.deal() in tests.
contract MockLBRouter {
    uint256 public lastAmountIn;
    address public lastRecipient;
    uint256 public callCount;

    bool public shouldRevert;

    /// @notice Set to true to make swaps revert (for testing failure handling).
    function setShouldRevert(bool revert_) external {
        shouldRevert = revert_;
    }

    function swapExactTokensForNATIVE(
        uint256 amountIn,
        uint256, /* amountOutMinNATIVE */
        ILBRouter.Path memory path,
        address payable to,
        uint256 /* deadline */
    ) external returns (uint256 amountOut) {
        if (shouldRevert) revert("MockLBRouter: forced revert");

        // Pull tokens from sender (the AmmoToken contract)
        address tokenIn = address(path.tokenPath[0]);
        IERC20(tokenIn).transferFrom(msg.sender, address(this), amountIn);

        // Simulate AVAX output (1:1000 ratio for simplicity — 1000 tokens = 1 AVAX)
        amountOut = amountIn / 1000;
        if (amountOut == 0) amountOut = 1; // minimum 1 wei

        // Send AVAX to recipient
        (bool success,) = to.call{value: amountOut}("");
        require(success, "MockLBRouter: AVAX transfer failed");

        lastAmountIn = amountIn;
        lastRecipient = to;
        callCount++;
    }

    receive() external payable {}
}
