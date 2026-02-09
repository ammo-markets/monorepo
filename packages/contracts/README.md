# @ammo-exchange/contracts

Solidity smart contracts for the Ammo Exchange protocol. Built with [Foundry](https://book.getfoundry.sh/).

## Architecture

```
AmmoManager          ← Global role registry + config
  └─ AmmoFactory     ← Deploys per-caliber markets
       └─ CaliberMarket  ← Mint/redeem order book (2-step, keeper-finalized)
            └─ AmmoToken  ← ERC20 token (1:1 with market)
```

`IPriceOracle` — external oracle interface for round pricing.

## Contract Reference

### AmmoManager

Central admin contract. All markets read roles from here.

| Function | Description |
|---|---|
| `transferOwnership(address)` | Start 2-step ownership transfer |
| `acceptOwnership()` | Claim pending ownership |
| `setGuardian(address)` | Set emergency pause address |
| `setKeeper(address, bool)` | Grant or revoke keeper role |
| `setFeeRecipient(address)` | Set protocol fee destination |
| `setTreasury(address)` | Set procurement capital destination |
| `isKeeper(address) → bool` | Check keeper status |
| `isOwner(address) → bool` | Check owner status |

### AmmoFactory

Deploys and registers caliber markets.

| Function | Description |
|---|---|
| `createCaliber(...) → (address, address)` | Deploy new market + token pair |
| `calibers(bytes32) → (address, address)` | Look up market and token |
| `getCaliberCount() → uint256` | Number of registered calibers |

### CaliberMarket

Per-caliber order book with 2-step flows.

**User Functions**

| Function | Description |
|---|---|
| `startMint(uint256, uint256, uint64) → uint256` | Deposit USDC, create mint order |
| `startRedeem(uint256, uint64) → uint256` | Lock tokens, request redemption |

**Keeper Functions**

| Function | Description |
|---|---|
| `finalizeMint(uint256, uint256)` | Settle mint at actual price |
| `refundMint(uint256, uint8)` | Return USDC to user |
| `finalizeRedeem(uint256)` | Burn tokens, complete redeem |
| `cancelRedeem(uint256, uint8)` | Return tokens to user |

**Admin Functions**

| Function | Description |
|---|---|
| `setMintFee(uint256)` | Update mint fee (bps) |
| `setRedeemFee(uint256)` | Update redeem fee (bps) |
| `setMinMint(uint256)` | Update minimum mint rounds |
| `pause()` | Halt new orders and finalization |
| `unpause()` | Resume market operations |

### AmmoToken

Minimal ERC20. Only its parent market can mint/burn.

| Function | Description |
|---|---|
| `mint(address, uint256)` | Mint tokens (market only) |
| `burn(address, uint256)` | Burn tokens (market only) |
| `transfer(address, uint256)` | Standard ERC20 transfer |
| `approve(address, uint256)` | Standard ERC20 approve |
| `transferFrom(address, address, uint256)` | Standard ERC20 transferFrom |

### IPriceOracle

| Function | Description |
|---|---|
| `getPrice() → uint256` | Current round price (18 decimals) |

## Commands

```bash
forge build       # Compile contracts
forge test        # Run tests
forge fmt         # Format Solidity
```

Or from workspace root:

```bash
pnpm contracts:build
pnpm contracts:test
```
