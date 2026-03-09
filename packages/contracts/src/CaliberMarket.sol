// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./AmmoToken.sol";
import "./AmmoManager.sol";
import "./IPriceOracle.sol";

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}

/// @notice Per-caliber market with 1-step instant mint and multi-step keeper-finalized redeem.
/// @dev Deployed by AmmoFactory. Each instance manages exactly one caliber.
///      Mint reads price from a shared PriceOracle; redeem requires keeper approval,
///      user payment (shipping + protocol fee in USDT), then keeper finalization.
contract CaliberMarket {
    enum RedeemStatus { None, Requested, Approved, Finalized, Canceled }

    struct RedeemOrder {
        address user;
        uint256 tokenAmount;
        uint256 feeBps;
        uint256 shippingCost;   
        uint256 protocolFee;    
        uint64 deadline;
        uint64 createdAt;
        uint64 finalizedAt;
        bool paid;              // Whether user has paid shipping + protocol fee
        RedeemStatus status;
    }

    error NotOwner();
    error NotKeeper();
    error NotOrderUser();
    error MarketPaused();
    error ZeroAddress();
    error InvalidAmount();
    error InvalidBps();
    error InvalidPrice();
    error MinRedeemNotMet();
    error StalePrice();
    error NoTokensMinted();
    error DeadlineExpired();
    error DeadlineNotSet();
    error InvalidStatus();
    error AlreadyPaid();
    error NotPaid();
    error Reentrancy();
    error TreasuryNotSet();

    event Minted(
        address indexed user, bytes32 indexed caliberId,
        uint256 usdcAmount, uint256 tokenAmount,
        uint256 priceUsed, uint256 refundAmount
    );
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

    uint256 public constant MAX_STALENESS = 6 hours;

    AmmoManager public immutable manager;
    IERC20 public immutable usdc;
    uint8 public immutable usdcDecimals;
    IPriceOracle public immutable oracle;
    AmmoToken public immutable token;
    bytes32 public immutable caliberId;

    uint256 public mintFeeBps;
    uint256 public redeemFeeBps;
    uint256 public minRedeemAmount;
    bool public paused;
    uint256 public nextOrderId = 1;
    uint256 private _locked;

    mapping(uint256 => RedeemOrder) public redeemOrders;

    modifier onlyOwner() {
        _checkOwner();
        _;
    }

    modifier onlyKeeper() {
        _checkKeeper();
        _;
    }

    modifier whenNotPaused() {
        if (paused) revert MarketPaused();
        _;
    }

    modifier nonReentrant() {
        if (_locked == 1) revert Reentrancy();
        _locked = 1;
        _;
        _locked = 0;
    }

    constructor(
        address manager_,
        address usdc_,
        uint8 usdcDecimals_,
        address oracle_,
        bytes32 caliberId_,
        string memory tokenName_,
        string memory tokenSymbol_,
        uint256 mintFeeBps_,
        uint256 redeemFeeBps_,
        uint256 minRedeemAmount_
    ) {
        if (manager_ == address(0) || usdc_ == address(0) || oracle_ == address(0)) revert ZeroAddress();
        if (usdcDecimals_ > 18) revert InvalidAmount();
        if (mintFeeBps_ > 10_000 || redeemFeeBps_ > 10_000) revert InvalidBps();

        manager = AmmoManager(manager_);
        usdc = IERC20(usdc_);
        usdcDecimals = usdcDecimals_;
        oracle = IPriceOracle(oracle_);
        caliberId = caliberId_;
        mintFeeBps = mintFeeBps_;
        redeemFeeBps = redeemFeeBps_;
        minRedeemAmount = minRedeemAmount_;

        token = new AmmoToken(tokenName_, tokenSymbol_, address(this));
    }

    // ── User functions ──────────────────────────────

    /// @notice Mint ammo tokens in a single step using the oracle price.
    /// @param usdcAmount Total USDC to spend (fee is deducted from this).
    function mint(uint256 usdcAmount) external whenNotPaused nonReentrant {
        if (usdcAmount == 0) revert InvalidAmount();

        address treasury = manager.treasury();
        if (treasury == address(0)) revert TreasuryNotSet();

        (uint256 price, uint256 updatedAt) = oracle.getPriceData();
        if (price == 0) revert InvalidPrice();
        if (block.timestamp - updatedAt > MAX_STALENESS) revert StalePrice();

        uint256 feeAmount = (usdcAmount * mintFeeBps) / 10_000;
        uint256 netUsdc = usdcAmount - feeAmount;
        uint256 scale = 10 ** (18 - usdcDecimals);

        // Round DOWN to whole tokens
        uint256 tokenAmount = (netUsdc * scale * 1e18) / price;
        if (tokenAmount == 0) revert NoTokensMinted();

        // Back-calculate exact USDC consumed for whole tokens
        uint256 actualUsdc = (tokenAmount * price) / (scale * 1e18);
        uint256 refund = netUsdc - actualUsdc;

        // Transfer USDC from user
        _safeTransferFrom(usdc, msg.sender, address(this), usdcAmount);

        // Distribute USDC
        if (feeAmount > 0) {
            _safeTransfer(usdc, manager.feeRecipient(), feeAmount);
        }
        _safeTransfer(usdc, treasury, actualUsdc);
        if (refund > 0) {
            _safeTransfer(usdc, msg.sender, refund);
        }

        // Mint tokens
        token.mint(msg.sender, tokenAmount);

        emit Minted(msg.sender, caliberId, usdcAmount, tokenAmount, price, refund);
    }

    function startRedeem(uint256 tokenAmount, uint64 deadline)
        external
        whenNotPaused
        nonReentrant
        returns (uint256 orderId)
    {
        if (tokenAmount == 0) revert InvalidAmount();
        if (tokenAmount < minRedeemAmount) revert MinRedeemNotMet();

        // Snapshot the redeem fee when the user starts the order so pricing
        // cannot drift while waiting for keeper approval.
        (uint256 price, uint256 updatedAt) = oracle.getPriceData();
        if (price == 0) revert InvalidPrice();
        if (block.timestamp - updatedAt > MAX_STALENESS) revert StalePrice();

        uint256 scale = 10 ** (18 - usdcDecimals);
        uint256 usdtValue = (tokenAmount * price) / (scale * 1e18);
        uint256 protocolFee = (usdtValue * redeemFeeBps) / 10_000;
        token.transferFrom(msg.sender, address(this), tokenAmount);

        orderId = nextOrderId++;
        redeemOrders[orderId] = RedeemOrder({
            user: msg.sender,
            tokenAmount: tokenAmount,
            feeBps: redeemFeeBps,
            shippingCost: 0,
            protocolFee: protocolFee,
            deadline: deadline,
            createdAt: uint64(block.timestamp),
            finalizedAt: 0,
            paid: false,
            status: RedeemStatus.Requested
        });

        emit RedeemRequested(orderId, msg.sender, tokenAmount, deadline);
    }

    // ── Keeper functions ────────────────────────────

    /// @notice Keeper approves a redeem order after verifying the shipping address.
    /// @param orderId The redeem order ID.
    /// @param shippingCost USDT amount the user must pay for shipping (in USDT decimals).
    /// @dev Protocol fee is snapshotted when the user starts the redeem.
    function approveRedeem(uint256 orderId, uint256 shippingCost) external onlyKeeper whenNotPaused {
        RedeemOrder storage order = redeemOrders[orderId];
        if (order.status != RedeemStatus.Requested) revert InvalidStatus();
        if (order.deadline != 0 && block.timestamp > order.deadline) revert DeadlineExpired();

        order.shippingCost = shippingCost;
        order.status = RedeemStatus.Approved;

        emit RedeemApproved(orderId, order.user, shippingCost, order.protocolFee);
    }

    // ── User payment function ────────────────────────

    /// @notice User pays shipping + protocol fee in USDT to complete the redeem.
    /// @param orderId The redeem order ID.
    /// @dev USDT is passed through: shipping → treasury, protocol fee → feeRecipient.
    function payRedeem(uint256 orderId) external whenNotPaused nonReentrant {
        RedeemOrder storage order = redeemOrders[orderId];
        if (order.status != RedeemStatus.Approved) revert InvalidStatus();
        if (msg.sender != order.user) revert NotOrderUser();
        if (order.paid) revert AlreadyPaid();
        if (order.deadline != 0 && block.timestamp > order.deadline) revert DeadlineExpired();

        address treasury = manager.treasury();
        if (treasury == address(0)) revert TreasuryNotSet();

        uint256 totalPayment = order.shippingCost + order.protocolFee;

        // Transfer total USDT from user to this contract first
        if (totalPayment > 0) {
            _safeTransferFrom(usdc, msg.sender, address(this), totalPayment);
        }

        // Distribute: shipping → treasury, protocol fee → feeRecipient
        if (order.shippingCost > 0) {
            _safeTransfer(usdc, treasury, order.shippingCost);
        }
        if (order.protocolFee > 0) {
            _safeTransfer(usdc, manager.feeRecipient(), order.protocolFee);
        }

        order.paid = true;

        emit RedeemPaid(orderId, order.user, order.shippingCost, order.protocolFee);
    }

    // ── Keeper finalization ──────────────────────────

    /// @notice Keeper finalizes the redeem after user has paid and items are shipped.
    /// @param orderId The redeem order ID.
    /// @dev Burns all locked tokens. No token fee — fees are paid in USDT.
    function finalizeRedeem(uint256 orderId) external onlyKeeper whenNotPaused {
        RedeemOrder storage order = redeemOrders[orderId];
        if (order.status != RedeemStatus.Approved) revert InvalidStatus();
        if (!order.paid) revert NotPaid();

        order.status = RedeemStatus.Finalized;
        order.finalizedAt = uint64(block.timestamp);

        // Burn all locked tokens — no token fee, fees were paid in USDT
        token.burn(address(this), order.tokenAmount);

        emit RedeemFinalized(orderId, order.user, order.tokenAmount);
    }

    /// @notice Cancel a redeem order. Keeper can cancel from Requested or Approved.
    ///         User can self-rescue from Requested or Approved, after deadline.
    ///         Cannot cancel after user has paid.
    function cancelRedeem(uint256 orderId, uint8 reasonCode) external {
        RedeemOrder storage order = redeemOrders[orderId];
        if (order.status != RedeemStatus.Requested && order.status != RedeemStatus.Approved) revert InvalidStatus();

        // Keeper can cancel from Requested or Approved (but not after paid)
        if (manager.isKeeper(msg.sender)) {
            if (order.paid) revert AlreadyPaid();
        } else {
            // User can self-rescue from any unpaid active state after deadline.
            if (msg.sender != order.user) revert NotKeeper();
            if (order.paid) revert AlreadyPaid();
            if (order.deadline == 0) revert DeadlineNotSet();
            if (block.timestamp <= order.deadline) revert DeadlineExpired();
        }

        order.status = RedeemStatus.Canceled;
        order.finalizedAt = uint64(block.timestamp);

        token.transfer(order.user, order.tokenAmount);

        emit RedeemCanceled(orderId, order.user, order.tokenAmount, reasonCode);
    }

    // ── Admin functions ─────────────────────────────

    function setMintFee(uint256 bps) external onlyOwner {
        if (bps > 10_000) revert InvalidBps();
        uint256 old = mintFeeBps;
        mintFeeBps = bps;
        emit MintFeeUpdated(old, bps);
    }

    function setRedeemFee(uint256 bps) external onlyOwner {
        if (bps > 10_000) revert InvalidBps();
        uint256 old = redeemFeeBps;
        redeemFeeBps = bps;
        emit RedeemFeeUpdated(old, bps);
    }

    function setMinRedeem(uint256 newMin) external onlyOwner {
        uint256 old = minRedeemAmount;
        minRedeemAmount = newMin;
        emit MinRedeemUpdated(old, newMin);
    }

    function pause() external {
        if (!manager.isOwner(msg.sender) && msg.sender != manager.guardian()) revert NotOwner();
        paused = true;
        emit Paused(msg.sender);
    }

    function unpause() external onlyOwner {
        paused = false;
        emit Unpaused(msg.sender);
    }

    // ── Internal access-control helpers ──────────────

    function _checkOwner() internal view {
        if (!manager.isOwner(msg.sender)) revert NotOwner();
    }

    function _checkKeeper() internal view {
        if (!manager.isKeeper(msg.sender)) revert NotKeeper();
    }

    // ── Internal safe-transfer helpers ──────────────

    function _safeTransfer(IERC20 tok, address to, uint256 amount) internal {
        (bool success, bytes memory data) =
            address(tok).call(abi.encodeWithSelector(IERC20.transfer.selector, to, amount));
        if (!success || (data.length != 0 && !abi.decode(data, (bool)))) revert InvalidAmount();
    }

    function _safeTransferFrom(IERC20 tok, address from, address to, uint256 amount) internal {
        (bool success, bytes memory data) =
            address(tok).call(abi.encodeWithSelector(IERC20.transferFrom.selector, from, to, amount));
        if (!success || (data.length != 0 && !abi.decode(data, (bool)))) revert InvalidAmount();
    }
}
