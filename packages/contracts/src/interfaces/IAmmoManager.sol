// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title IAmmoManager
/// @notice Interface for the global ops/admin and role registry.
/// @dev All CaliberMarket instances reference this contract for access control.
interface IAmmoManager {
    // ── Errors ───────────────────────────────────────

    error NotOwner();
    error NotPendingOwner();
    error ZeroAddress();

    // ── Events ───────────────────────────────────────

    event OwnershipTransferStarted(address indexed currentOwner, address indexed newOwner);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    event GuardianUpdated(address indexed oldGuardian, address indexed newGuardian);
    event FeeRecipientUpdated(address indexed oldRecipient, address indexed newRecipient);
    event KeeperUpdated(address indexed keeper, bool allowed);

    // ── View functions ───────────────────────────────

    function owner() external view returns (address);
    function pendingOwner() external view returns (address);
    function guardian() external view returns (address);
    function feeRecipient() external view returns (address);
    function keepers(address account) external view returns (bool);
    function isKeeper(address account) external view returns (bool);
    function isOwner(address account) external view returns (bool);

    // ── Ownership (2-step) ───────────────────────────

    function transferOwnership(address newOwner) external;
    function acceptOwnership() external;

    // ── Role management ──────────────────────────────

    function setGuardian(address guardian_) external;
    function setKeeper(address keeper, bool allowed) external;

    // ── Global config ────────────────────────────────

    function setFeeRecipient(address newRecipient) external;
}
