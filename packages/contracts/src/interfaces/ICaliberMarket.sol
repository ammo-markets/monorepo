// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title ICaliberMarket
/// @notice Interface for the per-caliber mint/redeem market with 2-step keeper-finalized flows.
/// @dev Deployed by AmmoFactory. Each instance manages exactly one caliber.
interface ICaliberMarket {
    // ── Enums ────────────────────────────────────────

    enum MintStatus { None, Started, Finalized, Refunded }
    enum RedeemStatus { None, Requested, Approved, Finalized, Canceled }

    // ── Structs ──────────────────────────────────────

    struct MintOrder {
        address user;
        uint256 usdcAmount;
        uint256 minTokensOut;
        uint256 requestPrice;
        uint256 feeBps;
        uint256 minMintAtStart;
        uint64 deadline;
        uint64 createdAt;
        uint64 finalizedAt;
        MintStatus status;
    }

    struct RedeemOrder {
        address user;
        uint256 tokenAmount;
        uint256 feeBps;
        uint256 shippingCost;
        uint256 protocolFee;
        uint64 deadline;
        uint64 createdAt;
        uint64 finalizedAt;
        bool paid;
        RedeemStatus status;
    }

    // ── Errors ───────────────────────────────────────

    error NotOwner();
    error NotKeeper();
    error MarketPaused();
    error ZeroAddress();
    error InvalidAmount();
    error InvalidBps();
    error InvalidPrice();
    error MinRedeemNotMet();
    error DeadlineExpired();
    error DeadlineNotSet();
    error InvalidStatus();
    error AlreadyPaid();
    error NotPaid();
    error Reentrancy();
    error TreasuryNotSet();

    // ── Events ───────────────────────────────────────

    event MintStarted(
        uint256 indexed orderId, address indexed user, uint256 usdcAmount,
        uint256 requestPrice, uint256 minTokensOut, uint64 deadline
    );
    event MintFinalized(uint256 indexed orderId, address indexed user, uint256 tokenAmount, uint256 priceUsed);
    event MintRefunded(uint256 indexed orderId, address indexed user, uint256 refundAmount, uint8 reasonCode);
    event RedeemRequested(uint256 indexed orderId, address indexed user, uint256 tokenAmount, uint64 deadline);
    event RedeemApproved(uint256 indexed orderId, address indexed user, uint256 shippingCost, uint256 protocolFee);
    event RedeemPaid(uint256 indexed orderId, address indexed user, uint256 shippingCost, uint256 protocolFee);
    event RedeemFinalized(uint256 indexed orderId, address indexed user, uint256 burnedTokens);
    event RedeemCanceled(uint256 indexed orderId, address indexed user, uint256 unlockedTokens, uint8 reasonCode);
    event MintFeeUpdated(uint256 oldBps, uint256 newBps);
    event RedeemFeeUpdated(uint256 oldBps, uint256 newBps);
    event MinRedeemUpdated(uint256 oldMin, uint256 newMin);
    event Paused(address indexed by);
    event Unpaused(address indexed by);

    // ── View functions ───────────────────────────────

    function manager() external view returns (address);
    function usdc() external view returns (address);
    function usdcDecimals() external view returns (uint8);
    function oracle() external view returns (address);
    function token() external view returns (address);
    function caliberId() external view returns (bytes32);
    function mintFeeBps() external view returns (uint256);
    function redeemFeeBps() external view returns (uint256);
    function minRedeemAmount() external view returns (uint256);
    function paused() external view returns (bool);
    function nextOrderId() external view returns (uint256);
    function mintOrders(uint256 orderId)
        external
        view
        returns (
            address user,
            uint256 usdcAmount,
            uint256 minTokensOut,
            uint256 requestPrice,
            uint256 feeBps,
            uint256 minMintAtStart,
            uint64 deadline,
            uint64 createdAt,
            uint64 finalizedAt,
            MintStatus status
        );
    function redeemOrders(uint256 orderId)
        external
        view
        returns (
            address user,
            uint256 tokenAmount,
            uint256 feeBps,
            uint256 shippingCost,
            uint256 protocolFee,
            uint64 deadline,
            uint64 createdAt,
            uint64 finalizedAt,
            bool paid,
            RedeemStatus status
        );
    // ── User functions ───────────────────────────────

    function startMint(uint256 usdcAmount, uint256 maxSlippageBps, uint64 deadline) external returns (uint256 orderId);
    function startRedeem(uint256 tokenAmount, uint64 deadline) external returns (uint256 orderId);

    // ── Keeper functions ─────────────────────────────

    function finalizeMint(uint256 orderId, uint256 actualPriceX18) external;
    function refundMint(uint256 orderId, uint8 reasonCode) external;
    function approveRedeem(uint256 orderId, uint256 shippingCost) external;
    function payRedeem(uint256 orderId) external;
    function finalizeRedeem(uint256 orderId) external;
    function cancelRedeem(uint256 orderId, uint8 reasonCode) external;

    // ── Admin functions ──────────────────────────────

    function setMintFee(uint256 bps) external;
    function setRedeemFee(uint256 bps) external;
    function setMinRedeem(uint256 newMin) external;
    function pause() external;
    function unpause() external;
}
