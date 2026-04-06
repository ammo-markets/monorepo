// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "./IERC20.sol";

/// @notice Minimal Trader Joe Liquidity Book Router interface for tax token auto-swaps.
/// @dev Only includes the functions needed by AmmoToken._sellTaxes().
///      Full interface: https://github.com/traderjoe-xyz/joe-v2/blob/main/src/interfaces/ILBRouter.sol
interface ILBRouter {
    enum Version {
        V1,
        V2,
        V2_1,
        V2_2
    }

    struct Path {
        uint256[] pairBinSteps;
        Version[] versions;
        IERC20[] tokenPath;
    }

    /// @notice Swap exact tokens for native AVAX, unwrapping WAVAX automatically.
    /// @param amountIn The amount of tokens to swap.
    /// @param amountOutMinNATIVE The minimum amount of native AVAX to receive.
    /// @param path The swap path (bin steps, versions, token addresses).
    /// @param to The recipient of the native AVAX.
    /// @param deadline The deadline for the swap.
    /// @return amountOut The amount of native AVAX received.
    function swapExactTokensForNATIVE(
        uint256 amountIn,
        uint256 amountOutMinNATIVE,
        Path memory path,
        address payable to,
        uint256 deadline
    ) external returns (uint256 amountOut);
}
