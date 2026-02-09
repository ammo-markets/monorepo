// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./AmmoManager.sol";
import "./CaliberMarket.sol";

/// @notice Deploys and registers per-caliber CaliberMarket + AmmoToken pairs.
/// @dev Only callable by the AmmoManager owner. Each caliber gets its own
///      isolated market contract and token.
contract AmmoFactory {
    AmmoManager public immutable manager;
    address public immutable usdc;
    uint8 public immutable usdcDecimals;

    struct CaliberInfo {
        address market;
        address token;
    }

    mapping(bytes32 => CaliberInfo) public calibers;
    bytes32[] public caliberIds;

    error NotOwner();
    error CaliberExists();
    error ZeroAddress();

    event CaliberCreated(bytes32 indexed caliberId, address indexed market, address indexed token);

    modifier onlyOwner() {
        if (!manager.isOwner(msg.sender)) revert NotOwner();
        _;
    }

    constructor(address manager_, address usdc_, uint8 usdcDecimals_) {
        if (manager_ == address(0) || usdc_ == address(0)) revert ZeroAddress();
        manager = AmmoManager(manager_);
        usdc = usdc_;
        usdcDecimals = usdcDecimals_;
    }

    /// @notice Deploy a new caliber market + token pair.
    /// @return market The deployed CaliberMarket address.
    /// @return token  The deployed AmmoToken address (created by the market).
    function createCaliber(
        bytes32 caliberId,
        string calldata name,
        string calldata symbol,
        address oracle,
        uint256 mintFeeBps,
        uint256 redeemFeeBps,
        uint256 minMintRounds
    ) external onlyOwner returns (address market, address token) {
        if (calibers[caliberId].market != address(0)) revert CaliberExists();
        if (oracle == address(0)) revert ZeroAddress();

        CaliberMarket marketContract = new CaliberMarket(
            address(manager), usdc, usdcDecimals, oracle, caliberId, name, symbol, mintFeeBps, redeemFeeBps, minMintRounds
        );

        market = address(marketContract);
        token = address(marketContract.token());

        calibers[caliberId] = CaliberInfo({market: market, token: token});
        caliberIds.push(caliberId);

        emit CaliberCreated(caliberId, market, token);
    }

    /// @notice Number of calibers registered.
    function getCaliberCount() external view returns (uint256) {
        return caliberIds.length;
    }
}
