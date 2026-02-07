// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IAmmoToken {
    // ── Events ──────────────────────────────────
    event MintStarted(address indexed user, uint256 usdcAmount);
    event MintFinalized(address indexed user, uint256 tokenAmount);
    event RedeemStarted(address indexed user, uint256 tokenAmount);
    event RedeemFinalized(address indexed user, uint256 tokenAmount);
    event MintFeeUpdated(uint256 newFeeBps);
    event RedeemFeeUpdated(uint256 newFeeBps);

    // ── User-facing ─────────────────────────────
    function startMint(uint256 usdcAmount) external;
    function startRedeem(uint256 tokenAmount) external;

    // ── Keeper-only (authorized backend) ────────
    function finalizeMint(address user, uint256 tokenAmount) external;
    function finalizeRedeem(address user, uint256 tokenAmount) external;

    // ── Admin ───────────────────────────────────
    function setMintFee(uint256 bps) external;
    function setRedeemFee(uint256 bps) external;
    function pause() external;
    function unpause() external;
}
