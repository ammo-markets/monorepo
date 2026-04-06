// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {AmmoManager} from "./AmmoManager.sol";
import {ILBRouter} from "./interfaces/ILBRouter.sol";
import {IERC20} from "./interfaces/IERC20.sol";

/// @notice ERC20 token with fee-on-transfer tax for DEX trades.
/// @dev Mint/burn restricted to its CaliberMarket. Tax config is read from AmmoManager.
///      Accumulated taxes are auto-swapped to native AVAX via Trader Joe LBRouter.
contract AmmoToken {
    string public name;
    string public symbol;
    uint8 public constant decimals = 18;

    uint256 internal constant _BPS_DIVISOR = 10_000;

    uint256 public totalSupply;
    address public immutable market;
    AmmoManager public immutable manager;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    /// @dev Reentrancy guard for tax auto-swaps. When true, all tax logic is bypassed.
    bool private _inSwap;

    error NotMarket();
    error InsufficientBalance();
    error InsufficientAllowance();
    error ZeroAddress();

    event Transfer(address indexed from, address indexed to, uint256 amount);
    event Approval(address indexed owner, address indexed spender, uint256 amount);
    event TaxesSwapped(uint256 tokensSwapped, uint256 avaxReceived);

    modifier onlyMarket() {
        if (msg.sender != market) revert NotMarket();
        _;
    }

    constructor(string memory name_, string memory symbol_, address market_, address manager_) {
        if (market_ == address(0) || manager_ == address(0)) revert ZeroAddress();
        name = name_;
        symbol = symbol_;
        market = market_;
        manager = AmmoManager(manager_);
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function transfer(address to, uint256 amount) external returns (bool) {
        _transfer(msg.sender, to, amount);
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        uint256 allowed = allowance[from][msg.sender];
        if (allowed < amount) revert InsufficientAllowance();
        if (allowed != type(uint256).max) {
            allowance[from][msg.sender] = allowed - amount;
            emit Approval(from, msg.sender, allowance[from][msg.sender]);
        }
        _transfer(from, to, amount);
        return true;
    }

    function mint(address to, uint256 amount) external onlyMarket {
        if (to == address(0)) revert ZeroAddress();
        totalSupply += amount;
        balanceOf[to] += amount;
        emit Transfer(address(0), to, amount);
    }

    function burn(address from, uint256 amount) external onlyMarket {
        if (balanceOf[from] < amount) revert InsufficientBalance();
        balanceOf[from] -= amount;
        totalSupply -= amount;
        emit Transfer(from, address(0), amount);
    }

    // ── Internal ────────────────────────────────────

    function _transfer(address from, address to, uint256 amount) internal {
        if (to == address(0)) revert ZeroAddress();
        if (balanceOf[from] < amount) revert InsufficientBalance();

        uint256 taxAmount = 0;

        if (!_inSwap && !_isLocalExempt(from, to)) {
            taxAmount = _determineTax(from, to, amount);

            // Auto-swap only on non-DEX transfers to avoid reentering the router/pair
            // during a buy or sell. DEX trades just accumulate tax; the next regular
            // transfer that crosses threshold flushes it.
            if (taxAmount == 0 && _shouldSwap()) {
                _sellTaxes();
            }
        }

        uint256 receiveAmount = amount - taxAmount;
        balanceOf[from] -= amount;
        balanceOf[to] += receiveAmount;
        emit Transfer(from, to, receiveAmount);

        if (taxAmount > 0) {
            balanceOf[address(this)] += taxAmount;
            emit Transfer(from, address(this), taxAmount);
        }
    }

    /// @dev Calculate tax amount by reading rates from AmmoManager.
    function _determineTax(address from, address to, uint256 amount) internal view returns (uint256) {
        // Check protocol-wide exemptions
        if (manager.taxExempt(from) || manager.taxExempt(to)) return 0;

        // Buy: check if `from` is a taxed pool
        (uint256 buyBps,) = manager.tokenPoolTax(address(this), from);
        if (buyBps > 0) return (amount * buyBps) / _BPS_DIVISOR;

        // Sell: check if `to` is a taxed pool (only if not a buy)
        (, uint256 sellBps) = manager.tokenPoolTax(address(this), to);
        if (sellBps > 0) return (amount * sellBps) / _BPS_DIVISOR;

        return 0;
    }

    /// @dev Check token-local exemptions (no storage reads for cheapest checks).
    ///      - market: CaliberMarket mint/redeem/transfer operations
    ///      - address(this): tax swap transfers
    ///      - dexRouter: router pulling tokens during swap execution
    function _isLocalExempt(address from, address to) internal view returns (bool) {
        address router = manager.dexRouter();
        return from == market || to == market || from == address(this) || to == address(this) || from == router
            || to == router;
    }

    /// @dev Check if accumulated tax balance exceeds the auto-swap threshold.
    function _shouldSwap() internal view returns (bool) {
        uint256 threshold = manager.taxSwapThresholds(address(this));
        return threshold > 0 && balanceOf[address(this)] >= threshold;
    }

    /// @dev Swap accumulated tax tokens to native AVAX via Trader Joe LBRouter.
    ///      Sends AVAX directly to treasury. Failures are silently caught so user
    ///      trades are never blocked by swap issues.
    function _sellTaxes() internal {
        uint256 tokenBalance = balanceOf[address(this)];
        if (tokenBalance == 0) return;

        (address router, address wavax_, AmmoManager.SwapPath memory swapPath,, address treasury_) =
            manager.getSwapConfig(address(this));

        if (router == address(0) || treasury_ == address(0) || swapPath.binStep == 0) return;

        _inSwap = true;

        // Approve router to pull our tokens
        allowance[address(this)][router] = tokenBalance;

        // Build Trader Joe LB path: AmmoToken -> WAVAX
        uint256[] memory pairBinSteps = new uint256[](1);
        pairBinSteps[0] = swapPath.binStep;

        ILBRouter.Version[] memory versions = new ILBRouter.Version[](1);
        versions[0] = swapPath.version;

        IERC20[] memory tokenPath = new IERC20[](2);
        tokenPath[0] = IERC20(address(this));
        tokenPath[1] = IERC20(wavax_);

        ILBRouter.Path memory path =
            ILBRouter.Path({pairBinSteps: pairBinSteps, versions: versions, tokenPath: tokenPath});

        try ILBRouter(router)
            .swapExactTokensForNATIVE(
                tokenBalance,
                0, // amountOutMinNATIVE: no slippage protection for small tax swaps
                path,
                payable(treasury_),
                block.timestamp
            ) returns (
            uint256 avaxOut
        ) {
            emit TaxesSwapped(tokenBalance, avaxOut);
        } catch {
            // Swap failed — reset approval, taxes accumulate for next attempt
            allowance[address(this)][router] = 0;
        }

        _inSwap = false;
    }
}
