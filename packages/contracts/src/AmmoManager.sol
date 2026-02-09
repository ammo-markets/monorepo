// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @notice Global ops/admin and role registry for the Ammo Exchange protocol.
/// @dev All CaliberMarket instances reference this contract for access control.
///      Owner should be a multisig in production.
contract AmmoManager {
    address public owner;
    address public pendingOwner;
    address public guardian;
    address public feeRecipient;
    address public treasury;

    mapping(address => bool) public keepers;

    error NotOwner();
    error NotPendingOwner();
    error ZeroAddress();

    event OwnershipTransferStarted(address indexed currentOwner, address indexed newOwner);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    event GuardianUpdated(address indexed oldGuardian, address indexed newGuardian);
    event FeeRecipientUpdated(address indexed oldRecipient, address indexed newRecipient);
    event KeeperUpdated(address indexed keeper, bool allowed);
    event TreasuryUpdated(address indexed oldTreasury, address indexed newTreasury);

    modifier onlyOwner() {
        _checkOwner();
        _;
    }

    constructor(address feeRecipient_) {
        if (feeRecipient_ == address(0)) revert ZeroAddress();
        owner = msg.sender;
        feeRecipient = feeRecipient_;
        keepers[msg.sender] = true;
        emit KeeperUpdated(msg.sender, true);
    }

    // ── Ownership (2-step) ──────────────────────────

    function transferOwnership(address newOwner) external onlyOwner {
        if (newOwner == address(0)) revert ZeroAddress();
        pendingOwner = newOwner;
        emit OwnershipTransferStarted(owner, newOwner);
    }

    function acceptOwnership() external {
        if (msg.sender != pendingOwner) revert NotPendingOwner();
        address oldOwner = owner;
        owner = msg.sender;
        pendingOwner = address(0);
        emit OwnershipTransferred(oldOwner, msg.sender);
    }

    // ── Role management ─────────────────────────────

    function setGuardian(address guardian_) external onlyOwner {
        address old = guardian;
        guardian = guardian_;
        emit GuardianUpdated(old, guardian_);
    }

    function setKeeper(address keeper, bool allowed) external onlyOwner {
        if (keeper == address(0)) revert ZeroAddress();
        keepers[keeper] = allowed;
        emit KeeperUpdated(keeper, allowed);
    }

    // ── Global config ───────────────────────────────

    function setFeeRecipient(address newRecipient) external onlyOwner {
        if (newRecipient == address(0)) revert ZeroAddress();
        address old = feeRecipient;
        feeRecipient = newRecipient;
        emit FeeRecipientUpdated(old, newRecipient);
    }

    function setTreasury(address newTreasury) external onlyOwner {
        if (newTreasury == address(0)) revert ZeroAddress();
        address old = treasury;
        treasury = newTreasury;
        emit TreasuryUpdated(old, newTreasury);
    }

    // ── Internal access-control helpers ──────────────

    function _checkOwner() internal view {
        if (msg.sender != owner) revert NotOwner();
    }

    // ── View helpers (called by CaliberMarket) ──────

    function isKeeper(address account) external view returns (bool) {
        return keepers[account];
    }

    function isOwner(address account) external view returns (bool) {
        return account == owner;
    }
}
