// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./AmmoToken.sol";
import "./AmmoManager.sol";
import "./IPriceOracle.sol";

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}

/// @notice Per-caliber mint/redeem market with 2-step keeper-finalized flows.
/// @dev Deployed by AmmoFactory. Each instance manages exactly one caliber.
///      Oracle is queried at startMint for slippage baseline; keeper passes
///      actual purchase price at finalizeMint.
contract CaliberMarket {
    enum MintStatus { None, Started, Finalized, Refunded }
    enum RedeemStatus { None, Requested, Finalized, Canceled }

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
        uint64 deadline;
        uint64 createdAt;
        uint64 finalizedAt;
        RedeemStatus status;
    }

    error NotOwner();
    error NotKeeper();
    error MarketPaused();
    error ZeroAddress();
    error InvalidAmount();
    error InvalidBps();
    error InvalidPrice();
    error MinMintNotMet();
    error Slippage();
    error DeadlineExpired();
    error DeadlineInPast();
    error PriceTooLow();
    error PriceTooHigh();
    error InvalidStatus();
    error Reentrancy();
    error TreasuryNotSet();

    event MintStarted(
        uint256 indexed orderId, address indexed user, uint256 usdcAmount,
        uint256 requestPrice, uint256 minTokensOut, uint64 deadline
    );
    event MintFinalized(uint256 indexed orderId, address indexed user, uint256 tokenAmount, uint256 priceUsed);
    event MintRefunded(uint256 indexed orderId, address indexed user, uint256 refundAmount, uint8 reasonCode);
    event RedeemRequested(uint256 indexed orderId, address indexed user, uint256 tokenAmount, uint64 deadline);
    event RedeemFinalized(uint256 indexed orderId, address indexed user, uint256 burnedTokens, uint256 feeTokens);
    event RedeemCanceled(uint256 indexed orderId, address indexed user, uint256 unlockedTokens, uint8 reasonCode);
    event MintFeeUpdated(uint256 oldBps, uint256 newBps);
    event RedeemFeeUpdated(uint256 oldBps, uint256 newBps);
    event MinMintUpdated(uint256 oldMin, uint256 newMin);
    event Paused(address indexed by);
    event Unpaused(address indexed by);

    AmmoManager public immutable manager;
    IERC20 public immutable usdc;
    uint8 public immutable usdcDecimals;
    IPriceOracle public immutable oracle;
    AmmoToken public immutable token;
    bytes32 public immutable caliberId;

    uint256 public mintFeeBps;
    uint256 public redeemFeeBps;
    uint256 public minMintRounds;
    uint256 public maxPriceDeviationBps = 5000;
    bool public paused;
    uint256 public nextOrderId = 1;
    uint256 private _locked;

    mapping(uint256 => MintOrder) public mintOrders;
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
        uint256 minMintRounds_
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
        minMintRounds = minMintRounds_;

        token = new AmmoToken(tokenName_, tokenSymbol_, address(this));
    }

    // ── User functions ──────────────────────────────

    function startMint(uint256 usdcAmount, uint256 maxSlippageBps, uint64 deadline)
        external
        whenNotPaused
        nonReentrant
        returns (uint256 orderId)
    {
        if (usdcAmount == 0) revert InvalidAmount();
        if (maxSlippageBps > 10_000) revert InvalidBps();
        if (deadline != 0 && deadline <= uint64(block.timestamp)) revert DeadlineInPast();

        uint256 requestPrice = oracle.getPrice();
        if (requestPrice == 0) revert InvalidPrice();

        uint256 feeAmount = (usdcAmount * mintFeeBps) / 10_000;
        uint256 netUsdc = usdcAmount - feeAmount;
        uint256 scale = 10 ** (18 - usdcDecimals);
        uint256 expectedTokens = (netUsdc * scale * 1e18) / requestPrice;
        uint256 minTokensOut = (expectedTokens * (10_000 - maxSlippageBps)) / 10_000;

        _safeTransferFrom(usdc, msg.sender, address(this), usdcAmount);

        orderId = nextOrderId++;
        mintOrders[orderId] = MintOrder({
            user: msg.sender,
            usdcAmount: usdcAmount,
            minTokensOut: minTokensOut,
            requestPrice: requestPrice,
            feeBps: mintFeeBps,
            minMintAtStart: minMintRounds,
            deadline: deadline,
            createdAt: uint64(block.timestamp),
            finalizedAt: 0,
            status: MintStatus.Started
        });

        emit MintStarted(orderId, msg.sender, usdcAmount, requestPrice, minTokensOut, deadline);
    }

    function startRedeem(uint256 tokenAmount, uint64 deadline)
        external
        whenNotPaused
        nonReentrant
        returns (uint256 orderId)
    {
        if (tokenAmount == 0) revert InvalidAmount();
        if (deadline != 0 && deadline <= uint64(block.timestamp)) revert DeadlineInPast();
        token.transferFrom(msg.sender, address(this), tokenAmount);

        orderId = nextOrderId++;
        redeemOrders[orderId] = RedeemOrder({
            user: msg.sender,
            tokenAmount: tokenAmount,
            feeBps: redeemFeeBps,
            deadline: deadline,
            createdAt: uint64(block.timestamp),
            finalizedAt: 0,
            status: RedeemStatus.Requested
        });

        emit RedeemRequested(orderId, msg.sender, tokenAmount, deadline);
    }

    // ── Keeper functions ────────────────────────────

    function finalizeMint(uint256 orderId, uint256 actualPriceX18) external onlyKeeper whenNotPaused {
        if (actualPriceX18 == 0) revert InvalidPrice();

        uint256 oraclePrice = oracle.getPrice();
        if (oraclePrice > 0) {
            uint256 floor = (oraclePrice * (10_000 - maxPriceDeviationBps)) / 10_000;
            uint256 ceiling = (oraclePrice * (10_000 + maxPriceDeviationBps)) / 10_000;
            if (actualPriceX18 < floor) revert PriceTooLow();
            if (actualPriceX18 > ceiling) revert PriceTooHigh();
        }

        MintOrder storage order = mintOrders[orderId];
        if (order.status != MintStatus.Started) revert InvalidStatus();
        if (order.deadline != 0 && block.timestamp > order.deadline) revert DeadlineExpired();

        address treasury = manager.treasury();
        if (treasury == address(0)) revert TreasuryNotSet();

        uint256 feeAmount = (order.usdcAmount * order.feeBps) / 10_000;
        uint256 netUsdc = order.usdcAmount - feeAmount;
        uint256 scale = 10 ** (18 - usdcDecimals);
        uint256 tokenAmount = (netUsdc * scale * 1e18) / actualPriceX18;

        if (tokenAmount < order.minMintAtStart * 1e18) revert MinMintNotMet();
        if (tokenAmount < order.minTokensOut) revert Slippage();

        order.status = MintStatus.Finalized;
        order.finalizedAt = uint64(block.timestamp);

        if (feeAmount > 0) {
            _safeTransfer(usdc, manager.feeRecipient(), feeAmount);
        }
        _safeTransfer(usdc, treasury, netUsdc);
        token.mint(order.user, tokenAmount);

        emit MintFinalized(orderId, order.user, tokenAmount, actualPriceX18);
    }

    function refundMint(uint256 orderId, uint8 reasonCode) external onlyKeeper {
        MintOrder storage order = mintOrders[orderId];
        if (order.status != MintStatus.Started) revert InvalidStatus();

        order.status = MintStatus.Refunded;
        order.finalizedAt = uint64(block.timestamp);

        _safeTransfer(usdc, order.user, order.usdcAmount);

        emit MintRefunded(orderId, order.user, order.usdcAmount, reasonCode);
    }

    function finalizeRedeem(uint256 orderId) external onlyKeeper whenNotPaused {
        RedeemOrder storage order = redeemOrders[orderId];
        if (order.status != RedeemStatus.Requested) revert InvalidStatus();
        if (order.deadline != 0 && block.timestamp > order.deadline) revert DeadlineExpired();

        uint256 feeAmount = (order.tokenAmount * order.feeBps) / 10_000;
        uint256 netTokens = order.tokenAmount - feeAmount;

        order.status = RedeemStatus.Finalized;
        order.finalizedAt = uint64(block.timestamp);

        token.burn(address(this), netTokens);
        if (feeAmount > 0) {
            token.transfer(manager.feeRecipient(), feeAmount);
        }

        emit RedeemFinalized(orderId, order.user, netTokens, feeAmount);
    }

    function cancelRedeem(uint256 orderId, uint8 reasonCode) external onlyKeeper {
        RedeemOrder storage order = redeemOrders[orderId];
        if (order.status != RedeemStatus.Requested) revert InvalidStatus();

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

    function setMinMint(uint256 newMin) external onlyOwner {
        uint256 old = minMintRounds;
        minMintRounds = newMin;
        emit MinMintUpdated(old, newMin);
    }

    function setMaxPriceDeviation(uint256 bps) external onlyOwner {
        if (bps == 0 || bps > 10_000) revert InvalidBps();
        maxPriceDeviationBps = bps;
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
