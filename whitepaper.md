# Ammo Exchange: A Tokenized Ammunition Market Protocol

**Version 0.2 — Draft**
**March 2026**

---

## Abstract

Ammunition is an approximately **$8B** annual U.S. market (2024 estimate) with widespread civilian ownership, yet no efficient secondary market exists for trading it. Holders of physical ammunition cannot easily liquidate, trade, or gain price exposure without the friction of physical transfer. We propose Ammo Exchange, a protocol that mints blockchain tokens backed 1:1 by physical ammunition stored in insured, climate-controlled warehouses. Each token represents ownership of a specific caliber and **specification** of factory-new ammunition (brand class, load type, and case type). Tokens are tradeable on decentralized exchanges on Avalanche C-Chain, enabling price discovery, speculation, and liquidity for an asset class that has historically been largely illiquid. Holders may redeem tokens for physical delivery, subject to applicable laws and shipping constraints.

---

## 1. The Problem

### 1.1 An Illiquid Asset Worth Billions

The U.S. ammunition market is estimated at **$7.99B in 2024** (Grand View Research). Gun ownership is widespread, but exact counts are difficult to measure; surveys show **about 32% of U.S. adults** report personally owning a gun and **about four‑in‑ten** live in a gun household (Pew Research Center, 2023). The result is a large, widely distributed stock of physical ammunition held in private storage with no direct way to trade in and out of that position.

Unlike gold, oil, or agricultural commodities, ammunition has:

- **No futures market** for price hedging
- **No liquid secondary exchange** for peer-to-peer trading
- **No financial instrument** for price exposure without physical possession
- **High friction** in buying and selling (shipping hazmat, age verification, state-by-state regulations)

### 1.2 Proven Price Volatility

Ammunition prices exhibit significant volatility driven by political events, supply chain disruptions, and panic buying. For example, 9mm FMJ averaged around **$0.20/rd** pre‑pandemic and peaked around **$0.80–$0.90/rd** in early 2021, before stabilizing back in the mid‑$0.20s in 2023–2025 (Ammunition Depot price history). Other calibers experience similar multiples during demand shocks, though the timing and magnitude vary.

Recent demand also expanded materially. The NSSF estimates **~26.2M first‑time gun buyers since 2020**, which materially increased ammunition demand during the 2020–2022 period.

This volatility creates opportunity. People who stockpile ammunition during low prices could sell during spikes — if a market existed. It does not. Ammo Exchange creates it.

### 1.3 The Gap in Existing Solutions

| Platform                             | What It Does                                      | What It Lacks                                              |
| ------------------------------------ | ------------------------------------------------- | ---------------------------------------------------------- |
| **AmmoSeek**                         | Search engine for in‑stock ammunition and pricing | No trading, no ownership layer                             |
| **Ammunition Depot (price history)** | Historical price charts                           | No trading capability                                      |
| **AmmoSquared**                      | Subscription buying + stored ammo inventory       | No liquid secondary market, no DeFi composability          |
| **Forums / classifieds**             | Peer‑to‑peer resale                               | Fragmented, no standardized pricing, compliance complexity |

Existing tools provide **price discovery** and **inventory accumulation**, but not a liquid, standardized marketplace for transfer of ownership claims.

Ammo Exchange differs by supporting **multiple calibers and load types**, deploying tokens as **standard ERC-20s** on Avalanche C-Chain, enabling **DEX trading** for real price discovery, and designing for **DeFi composability** from day one.

---

## 2. How It Works

### 2.1 System Overview

```
User sends USDC ──► CaliberMarket contract ──► Deducts fee (1.5%), sends net USDC to treasury
                                             ──► Mints caliber-specific ERC-20 tokens instantly (e.g., ax9P, ax556SD)
                                             ──► Ammo Exchange purchases physical ammo to maintain backing

User burns token ──► CaliberMarket contract ──► Locks tokens in contract (startRedeem)
                                             ──► User completes KYC via web app, admin reviews
                                             ──► Keeper finalizes on-chain, burning tokens from supply
                                             ──► Physical ammo ships to user
```

**Price flow:**

```
AmmoSquared ──► Chainlink Functions DON (every 4 hours) ──► PriceOracle contract
                                                          ──► CaliberMarket reads price at mint time
```

### 2.2 Minting (Buy)

Minting is a single atomic transaction — the user receives tokens immediately:

1. User connects wallet and selects caliber and USDC amount
2. User approves USDC spend to the CaliberMarket contract
3. User calls `mint(usdcAmount)` on the CaliberMarket
4. Contract reads current price from the on-chain PriceOracle (updated every 4 hours via Chainlink Functions)
5. Mint fee (1.5%) is deducted; net USDC is sent to the treasury; dust from rounding is refunded
6. Caliber tokens are minted directly to the user's wallet
7. A `Minted` event is emitted on-chain

Physical backing is maintained off-chain: Ammo Exchange purchases equivalent ammunition from suppliers (batched) and stores it in the insured warehouse. Proof of reserves is published via monthly audits.

**Minimum mint:** None (any non-zero amount accepted)
**Processing fee:** 1.5% of order value (configurable, max 5%)
**Price staleness:** Mint reverts if the oracle price is older than 6 hours
**Price source:** AmmoSquared market data, fetched by Chainlink Functions DON every 4 hours via Chainlink Automation

### 2.3 Redemption (Burn)

Redemption is a 2-step process because it requires off-chain verification and physical shipping:

1. User calls `startRedeem(tokenAmount, deadline)` — tokens are locked in the contract
2. A `RedeemRequested` event is emitted; the worker indexes it and begins off-chain processing
3. User completes KYC/age verification off-chain (required for physical shipment)
4. Ammo Exchange reserves and ships ammunition from the warehouse
5. Keeper calls `finalizeRedeem(orderId)`, permanently burning the locked tokens (minus fee)
6. If the keeper does not act before the user-set deadline, the user can call `cancelRedeem()` to recover their tokens (self-rescue mechanism)

**Redemption fee:** 1.5% (configurable) + shipping costs
**Age verification:** Required at redemption, per federal law (21+ for handgun ammo, 18+ for rifle/shotgun ammo)
**Shipping:** Via **UPS Ground only** within the 48 contiguous states (USPS prohibits ammunition shipping). Limited Quantity labeling applied per DOT regulations.

### 2.4 Trading

Between minting and redemption, tokens circulate freely:

- Trade on **Trader Joe, Pangolin,** or any Avalanche-compatible DEX
- Use as **collateral** in DeFi lending protocols
- Hold for **price speculation** — no KYC needed to buy/sell tokens on secondary markets
- **Anyone with access to a DEX** can gain exposure to U.S. ammunition prices by purchasing tokens on a DEX

This is the core unlock: **separating price exposure from physical possession.**  
Note: redemption is **U.S.-only** and subject to shipping/legal constraints. Non‑redeemable holders may price in a discount versus redeemable inventory.

---

## 3. Token Architecture

### 3.1 One Token Per Caliber and Load Type

Each supported ammunition caliber and load type has its own ERC-20 token. Rather than a single token per caliber, we separate by load type (e.g., practice vs. self-defense) because these have materially different prices, demand curves, and use cases:

| Token     | Symbol  | Represents                                                           | Backed By                      |
| --------- | ------- | -------------------------------------------------------------------- | ------------------------------ |
| `ax9P`    | ax9P    | 1 round of 9mm 115gr FMJ, brass case, factory‑new practice ammo      | Physical 9mm FMJ in warehouse  |
| `ax9SD`   | ax9SD   | 1 round of 9mm 124gr JHP, brass case, factory‑new self‑defense ammo  | Physical 9mm JHP in warehouse  |
| `ax556SD` | ax556SD | 1 round of 5.56 62gr self‑defense, brass case, factory‑new           | Physical 5.56 SD in warehouse  |
| `ax556P`  | ax556P  | 1 round of 5.56 NATO 55gr FMJ, brass case, factory‑new practice ammo | Physical 5.56 FMJ in warehouse |

**Why per-caliber-and-load tokens instead of an index or a single token per caliber?**

- Practice and self-defense loads have materially different prices (JHP costs 2-3x FMJ)
- Each load type has independent supply/demand dynamics
- Price movements can diverge materially between calibers and load types during demand shocks
- Users who want exposure to specific ammunition types should be able to target them
- Simplifies warehouse accounting: 1 token = 1 round of a specific spec, always

**Future calibers:** Additional calibers (.22 LR, .308 Win, .45 ACP, etc.) can be added via the factory pattern without modifying existing contracts.

**Spec & substitution policy:** each token maps to a published SKU spec (brand class, load type, case type, new factory ammo only). Substitutions, if any, must be disclosed and priced via a published discount schedule.

### 3.2 Contract Architecture

The protocol uses a factory pattern with per-caliber isolation:

- **AmmoManager** — Global role registry (owner, keeper, guardian, feeRecipient, treasury)
- **AmmoFactory** — Deploys CaliberMarket + AmmoToken pairs per caliber
- **CaliberMarket** — Per-caliber market handling mint/redeem logic
- **AmmoToken** — Minimal ERC-20 (mint/burn restricted to its CaliberMarket)
- **PriceOracle** — Shared price registry, keeper-only writes
- **AmmoPriceFunctions** — Chainlink Functions + Automation consumer for automated price updates from external sources (currently AmmoSquared)

Owner is a multisig in production. Critical addresses (manager, oracle, USDC, token) are immutable post-deployment. The protocol is deployed on **Avalanche C-Chain** (Fuji testnet for development, mainnet for production).

### 3.3 Contract Interface

```solidity
// CaliberMarket — per-caliber market
interface ICaliberMarket {
    // User-facing
    function mint(uint256 usdcAmount) external;                       // 1-step instant mint
    function startRedeem(uint256 tokenAmount, uint256 deadline) external; // 2-step: lock tokens
    function cancelRedeem(uint256 orderId, uint8 reasonCode) external;   // self-rescue after deadline

    // Keeper-only
    function finalizeRedeem(uint256 orderId) external;    // burn tokens, complete redeem
    function cancelRedeem(uint256 orderId, uint8 reasonCode) external; // cancel anytime

    // Admin
    function setMintFee(uint256 bps) external;            // max 500 bps (5%)
    function setRedeemFee(uint256 bps) external;           // max 500 bps (5%)
    function setMinMint(uint256 newMin) external;
    function pause() external;                             // owner or guardian
    function unpause() external;                           // owner only
}

// AmmoFactory — deploys per-caliber markets
interface IAmmoFactory {
    function createCaliber(
        bytes32 caliberId,
        string calldata name,
        string calldata symbol,
        uint256 mintFeeBps,
        uint256 redeemFeeBps,
        uint256 minMintRounds
    ) external returns (address market, address token);
}

// PriceOracle — shared price registry
interface IPriceOracle {
    function setPrice(address market, uint256 priceX18) external;           // keeper-only
    function setBatchPrices(address[] calldata, uint256[] calldata) external; // keeper-only
    function getPriceData() external view returns (uint256 price, uint256 updatedAt); // market-only
}
```

Minting is instant (1-step) because USDC transfer and token minting are atomic — no off-chain verification needed. Redeeming is 2-step because it requires off-chain work (KYC verification, warehouse reservation, physical shipping) before tokens can be burned.

### 3.4 Price Oracle Architecture

On-chain pricing uses a two-layer system:

1. **PriceOracle contract** — Shared price registry that stores per-market price data (18-decimal format) with timestamps. Only registered keepers can write prices; only registered CaliberMarket contracts can read them.

2. **AmmoPriceFunctions contract** — Chainlink Functions + Automation consumer that automates price updates:
   - **Chainlink Automation** checks every 4 hours whether an update is needed (`checkUpkeep`/`performUpkeep`)
   - **Chainlink Functions** sends JavaScript to the Decentralized Oracle Network (DON) to fetch current ammunition prices from the protocol API (sourced from AmmoSquared market data)
   - The DON returns prices for all calibers in a single callback, which calls `oracle.setBatchPrices()` to update all markets atomically

**Off-chain price pipeline:** A worker service scrapes AmmoSquared prices hourly, stores them in the database (CaliberPrice for latest, PriceSnapshot for history), and exposes them via the protocol API that Chainlink Functions reads from.

**Staleness protection:** CaliberMarket reverts any mint if the oracle price is older than 6 hours, protecting users from stale pricing.

---

## 4. Custody and Storage

### 4.1 Warehouse Operations

Physical ammunition is stored in a **climate-controlled, insured warehouse facility**. Storage requirements:

- Temperature and humidity controlled (ammunition shelf life: 20+ years when properly stored)
- Compliant with OSHA and local fire code for ammunition storage
- Insured against theft, fire, and natural disaster
- Regular inventory audits (monthly) with public attestation

### 4.2 Supplier Relationship

For MVP, Ammo Exchange operates via a supply partnership model:

1. **Phase 1 (MVP):** Purchase from established suppliers (potential AmmoSquared partnership for storage infrastructure). Orders batched daily for efficiency.
2. **Phase 2 (Scale):** Direct wholesale purchasing from manufacturers (Federal/Vista Outdoor, Winchester, Hornady) for better margins.
3. **Phase 3 (Maturity):** Own warehouse operations for maximum margin and control.

### 4.3 Proof of Reserves

Transparency is critical. The protocol publishes:

- **On-chain:** Total token supply per caliber (verifiable by anyone)
- **Off-chain:** Monthly warehouse audit reports with round counts by caliber
- **Attestation:** Third-party auditor signs off that physical inventory ≥ token supply

This mirrors how **Tether Gold (XAUT)** and **Paxos Gold (PAXG)** operate — both publish attestations that physical holdings match token supply. For example, Tether’s Q1 2025 attestation reports **~7.7 tons** of gold backing XAUT, and Paxos publishes a fee schedule showing **no storage fees** with variable creation/destruction fees by order size.

---

## 5. Revenue Model

### 5.1 Fee Structure

| Revenue Source   | Rate                        | Notes                                         |
| ---------------- | --------------------------- | --------------------------------------------- |
| Mint fee         | 1.5% (configurable, max 5%) | Charged on USDC deposit, deducted before mint |
| Redeem fee       | 1.5% (configurable, max 5%) | Charged on token amount at finalization       |
| Wholesale spread | 5-15%                       | Buy wholesale, mint at retail price           |
| Shipping fee     | At cost + handling          | Passed through to redeemer                    |

**Why no storage fee (demurrage)?**

Demurrage — charging token holders a recurring fee — would make tokens incompatible with DeFi. A token that decays in value cannot be effectively used as collateral, LP'd in pools, or held in smart contracts. This mirrors current practice in tokenized commodities: Paxos lists **no storage fees** for PAXG and instead uses creation/destruction fees by order size. We follow the same model.

### 5.2 Revenue Projections (Conservative)

Assuming modest adoption:

| Metric                  | Year 1     | Year 2    | Year 3    |
| ----------------------- | ---------- | --------- | --------- |
| Total Value Minted      | $500K      | $2M       | $10M      |
| Mint Fee Revenue (1.5%) | $7.5K      | $30K      | $150K     |
| Spread Revenue (10%)    | $50K       | $200K     | $1M       |
| Redemption Revenue      | $2K        | $10K      | $50K      |
| **Total Revenue**       | **$59.5K** | **$240K** | **$1.2M** |

The real business is the **wholesale spread** — buying ammunition at wholesale prices and minting tokens at retail. If 9mm costs $0.16/rd wholesale and the token reflects $0.20/rd retail, that's a 25% gross margin before the mint fee is even applied.

---

## 6. Liquidity

### 6.1 The Cold Start Problem

A token is worthless without liquidity. No one will mint if they can't trade, and no one will trade if there's no depth. Solving this is the primary challenge.

### 6.2 Initial Liquidity Strategy

**Step 1: Protocol-Seeded Pools**
Ammo Exchange uses initial capital (from funding or revenue) to seed DEX liquidity pools (e.g., Trader Joe) for each caliber token against USDC on Avalanche. Even $50-100K of liquidity per pool enables basic trading, but concentrated liquidity requires active range management to avoid depth evaporating during volatility.

**Step 2: Primers (Liquidity Incentive Program)**
Liquidity providers earn **Primers** — a points system that rewards providing depth to ammo token pools. Primers are not a tradeable token. They represent accumulated contribution to the protocol.

Why "Primers"? In ammunition, a primer is the small component that ignites the powder charge. Without a primer, a round doesn't fire. Without liquidity, a market doesn't function.

Primer accumulation may convert to governance rights, fee discounts, or protocol token allocation in the future — but no promises are made. This avoids the securities classification risk of launching a yield-bearing token while still incentivizing early liquidity.

### 6.3 Why Not a Protocol Token (Yet)?

Launching a governance/utility token at inception creates:

- **Securities risk** under the Howey test (investment of money, common enterprise, expectation of profit from others' efforts)
- **Distraction** from the core product
- **Mercenary capital** that farms and dumps

The protocol may introduce a token after demonstrating product-market fit. Until then, Primers serve the incentive function without the regulatory overhead.

---

## 7. Regulatory Considerations

### 7.1 Federal Ammunition Law

- **No FFL required** to sell ammunition at the federal level (only needed for manufacturing/importing ammo or dealing firearms)
- **Age restrictions:** 21+ for handgun ammunition, 18+ for rifle/shotgun ammunition (enforced at redemption)
- **No federal background check** required for ammunition purchases
- **Online sales** are legal at the federal level

### 7.2 State Restrictions

Key state-level considerations for redemption/shipping:

| State           | Restriction                                                                         |
| --------------- | ----------------------------------------------------------------------------------- |
| California      | Background check required at point of sale; ammo must be shipped to licensed dealer |
| New York        | Online orders must be picked up from a licensed dealer                              |
| Illinois        | FOID card required; no direct consumer shipment                                     |
| Washington D.C. | Must be picked up from dealer                                                       |
| New Jersey      | Certain ammo types restricted; FID card required                                    |

For MVP, Ammo Exchange ships to states where direct‑to‑consumer delivery is legal. Restricted state support is added in Phase 2 via dealer partnerships. **State rules are volatile and litigation‑prone**, so eligibility must be continuously updated.

### 7.3 Shipping Compliance

- Ammunition qualifies as **Limited Quantity** hazardous material when it meets “cartridges, small arms” criteria
- **UPS Ground only** within the 48 contiguous states (plus specific intra‑state services); **no international shipments**
- Requires proper packaging: new corrugated boxes, internal partitioning, and Limited Quantity labeling
- Cannot ship via air freight

### 7.4 Token Classification

Ammo-backed tokens **may** avoid securities classification if:

1. Each token represents **direct ownership** of a physical good (not a share of a common enterprise)
2. Token value derives from the **commodity price of ammunition**, not from Ammo Exchange's efforts
3. There is **no expectation of profit from the efforts of others** — the token is a receipt for stored goods
4. Holders can **redeem for physical delivery** at any time

PAXG is issued by Paxos Trust, a NYDFS‑regulated trust company. However, this is a novel asset class and legal counsel should be retained to confirm classification. If token trading develops speculative characteristics, regulatory treatment could evolve.

### 7.5 KYC/AML Policy

| Action                         | KYC Required?                                                                                                          |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| Minting (buy tokens)           | **Case‑by‑case** — may require compliance checks/geo‑fencing depending on state law and legal interpretation of “sale” |
| Trading on DEX                 | No — peer-to-peer token transfer                                                                                       |
| Redemption (physical delivery) | **Yes** — age verification, shipping address, state compliance                                                         |

This mirrors how commodity‑backed tokens generally operate: secondary market trading can be permissionless, while physical redemption requires identity and compliance checks.

---

## 8. Market Opportunity

### 8.1 Target Users

**Primary:** U.S. gun owners who stockpile ammunition and want to trade in/out of positions without shipping friction.

**Secondary:** Crypto-native investors seeking exposure to a real-world commodity with proven volatility and no existing financial instrument.

**Tertiary:** International users who cannot purchase ammunition physically but want price exposure to the U.S. ammunition market.

### 8.2 Why Now?

1. **Political climate:** Heightened uncertainty drives ammunition demand; policy risk and supply shocks can move prices quickly.
2. **RWA momentum:** Real-world asset tokenization is growing. Gold tokens (XAUT, PAXG) show the model can work with real custody and attestations.
3. **Infrastructure maturity:** DEXs, bridges, and DeFi lending protocols are mature enough to support commodity tokens. Avalanche C-Chain provides low fees, fast finality, and EVM compatibility.
4. **Cultural alignment:** Ammunition is deeply embedded in American identity. The messaging is intuitive: _"Make your ammo liquid."_

### 8.3 Total Addressable Market

- **U.S. ammunition sales:** ~**$8B** annually (2024 estimate)
- **Civilian stockpile:** Large, but estimates vary and are not reliably measured
- **Gun ownership:** Widespread across U.S. adults (survey‑based estimates)
- **If 1% of annual sales flows through tokenized channels:** ~$80M in volume
- **If a small fraction of existing holdings is tokenized:** Potentially $100M+ (assumption; depends on actual stockpile size)

Even conservative penetration represents a significant market given near-zero competition.

---

## 9. Roadmap

### Phase 1: MVP (Current — Testnet)

- ✅ Deploy mint/redeem contracts for **4 caliber markets** (9mm practice, 9mm self-defense, 5.56 self-defense, 5.56 NATO practice) on Avalanche Fuji testnet
- ✅ Factory pattern for deploying new caliber markets
- ✅ Chainlink Functions + Automation for automated on-chain price updates (sourced from AmmoSquared)
- ✅ Full web frontend: mint, redeem, portfolio, caliber browsing, admin dashboard
- ✅ Event indexer worker for order tracking and protocol statistics
- ✅ KYC flow with admin review panel
- ✅ Wallet-based authentication (SIWE pattern via iron-session)
- Establish warehouse/supplier partnership
- Seed initial DEX liquidity pools on Avalanche (e.g., Trader Joe)
- Launch Primers program for LPs

### Phase 2: Mainnet & Expansion (Months 4-8)

- Deploy to Avalanche C-Chain mainnet
- Add calibers: .22 LR, .308 Win, .45 ACP (via factory — no contract changes needed)
- Dealer partnerships for restricted-state shipping (CA, NY, IL, DC, NJ)
- Proof of reserves dashboard
- Integrate additional price sources beyond AmmoSquared (AmmoSeek, AmmoStats)

### Phase 3: DeFi Integration (Months 9-12)

- List ammo tokens on lending protocols (borrow against your ammo position)
- Cross-chain deployment (Base, Arbitrum)
- Fiat on-ramp for non-crypto users
- Explore protocol governance token

### Phase 4: Scale (Year 2+)

- Own warehouse operations
- Direct manufacturer partnerships for wholesale pricing
- Ammo index token (basket of calibers and load types)
- Smart account support for simplified UX

---

## 10. Risks

| Risk                                                | Mitigation                                                                                       |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Regulatory change (federal ammo sales restrictions) | Tokens represent ownership, not sale. Factory pattern allows deploying new compliant markets.    |
| Warehouse incident (fire, theft)                    | Insurance coverage, multiple storage locations at scale                                          |
| Low liquidity / no trading activity                 | Primers incentive program, protocol-seeded pools, loss-leader pricing on ammo to attract users   |
| Smart contract risk                                 | Audited contracts, multisig admin, battle-tested patterns, reentrancy guards, pausable markets   |
| Ammunition degradation over time                    | Climate-controlled storage extends shelf life to 20+ years. Rotate inventory on long-term basis. |
| Token classified as security                        | Structure as commodity receipt (1:1 physical backing, redeemable). Retain legal counsel.         |
| Competition from incumbents or new entrants         | DeFi composability, multi-caliber support, and open protocol are structural advantages           |

---

## 11. Comparable Precedents

| Protocol               | Asset      | Evidence                                                              | Key Lesson                                                          |
| ---------------------- | ---------- | --------------------------------------------------------------------- | ------------------------------------------------------------------- |
| **XAUT (Tether Gold)** | Gold       | Q1 2025 attestation shows ~7.7 tons backing                           | Commodity tokenization at scale is feasible                         |
| **PAXG (Paxos Gold)**  | Gold       | Issued by a NYDFS‑regulated trust company with published fee schedule | Zero storage fees can work with mint/redeem fees                    |
| **AmmoSquared**        | Ammunition | Subscription model with stored inventory                              | Demand exists for “digital ammo ownership,” but not a liquid market |

---

## 12. Conclusion

Ammunition is one of the last major consumer commodities without a liquid market. Large quantities sit in private storage with no way to trade, speculate, or hedge. Every political cycle, prices can spike materially and holders have limited mechanisms to capture that value.

Ammo Exchange bridges this gap with a simple model: physical ammo goes in, tokens come out. Tokens trade freely. Burn a token, get your ammo shipped.

The technology is proven (commodity tokens like XAUT and PAXG demonstrate that tokenized physical assets can work). The market is real (U.S. ammo sales are ~**$8B annually** and gun ownership is widespread). The gap is clear (no liquid secondary market exists). The timing is right (RWA tokenization momentum, political uncertainty driving demand, crypto infrastructure maturity).

**Make your ammo liquid.**

---

## References

- Grand View Research — U.S. Ammunition Market Report (2024 estimate)
- Pew Research Center — Key Facts About Americans and Guns (2023)
- NSSF — New First‑Time Gun Owners Since 2020 (2025 update)
- Ammunition Depot — 10‑Year 9mm Ammo Price History
- AmmoSeek — Ammo price search engine / aggregator
- AmmoStats — Real‑Time Ammunition Price Tracker
- AmmoSquared — How It Works / Ammo Reserve
- Tether — XAUT Attestation (Q1 2025)
- Paxos — PAX Gold Fees and Documentation
- Paxos Trust — NYDFS‑Regulated Trust Company
- GIFFORDS Law Center — Ammunition Regulation by State
- UPS — Ammunition Shipping Requirements (Limited Quantity)
