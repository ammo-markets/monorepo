# Ammo Exchange — Product Requirements Document (UI)

**Version:** 1.0
**Date:** February 2026
**Audience:** UI/UX Designer
**Scope:** Frontend application only (`apps/web`)

---

## 1. Product Summary

Ammo Exchange is a web application where users can:

1. **Mint** — Deposit USDC to purchase tokenized ammunition (ERC-20 tokens backed 1:1 by physical ammo in storage)
2. **Redeem** — Burn tokens to receive physical ammunition shipped to their U.S. address
3. **Trade** — Swap ammo tokens on decentralized exchanges for price speculation
4. **Track** — Monitor their holdings, order history, and market prices

The application targets two user personas:

- **Gun owners** who want to buy, hold, and trade ammunition digitally without physical shipping friction
- **Crypto-native speculators** who want price exposure to ammunition as a volatile real-world commodity

---

## 2. Technical Context for Designer

Understanding these constraints will inform design decisions:

| Aspect             | Detail                                                      |
| ------------------ | ----------------------------------------------------------- |
| **Framework**      | Next.js 15 (App Router), React 19                           |
| **Styling**        | Tailwind CSS 4                                              |
| **Blockchain**     | Avalanche C-Chain (EVM)                                     |
| **Wallet**         | MetaMask, WalletConnect, Coinbase Wallet via wagmi          |
| **Data fetching**  | TanStack Query (server state), wagmi hooks (on-chain reads) |
| **Token standard** | ERC-20 (one token per caliber: 9MM, 556, 22LR, 308)         |
| **Payment**        | USDC (stablecoin) on Avalanche                              |

**Key UX implication:** Minting and redemption are **two-step asynchronous operations**. The user initiates on-chain, then a backend keeper finalizes after off-chain verification. There is a processing delay (up to 24-48 hours for minting, days for redemption/shipping). The UI must clearly communicate these states.

---

## 3. Supported Calibers

These are the ammunition types available at launch. Each has its own token and independent price.

| Token Symbol | Display Name | Description                    | Min Mint   |
| ------------ | ------------ | ------------------------------ | ---------- |
| `9MM`        | 9mm FMJ      | 115gr, brass case, factory-new | 50 rounds  |
| `556`        | 5.56 NATO    | 55gr, brass case, factory-new  | 50 rounds  |
| `22LR`       | .22 LR       | 40gr, standard, factory-new    | 100 rounds |
| `308`        | .308 Win     | 147gr, brass case, factory-new | 20 rounds  |

---

## 4. Information Architecture

```
/                       → Landing page (unauthenticated hero + market overview)
/market                 → Market overview (all calibers, prices, charts)
/market/[caliber]       → Single caliber detail page (price chart, mint/redeem actions)
/mint                   → Mint flow (select caliber → enter amount → approve USDC → confirm)
/redeem                 → Redeem flow (select caliber → enter amount → shipping → confirm)
/portfolio              → User dashboard (holdings, order history, Primers)
/portfolio/orders/[id]  → Order detail (status tracker for a specific mint/redeem)
```

**Global elements on every page:**

- Top navigation bar
- Wallet connection button (top right)
- Network indicator (Avalanche mainnet / Fuji testnet)
- Footer with links

---

## 5. Page-by-Page Specifications

---

### 5.1 Landing Page (`/`)

**Purpose:** First impression. Communicate what Ammo Exchange is, show live market data, and drive users to mint or connect wallet.

**Layout (top to bottom):**

#### Hero Section

- Headline: "Make Your Ammo Liquid."
- Subhead: One sentence explaining the product (tokenized ammunition backed by physical rounds in storage)
- Two CTAs:
  - Primary: "Start Minting" → navigates to `/mint` (or triggers wallet connect if not connected)
  - Secondary: "View Market" → scrolls to market section or navigates to `/market`

#### Live Market Ticker

- Horizontal strip showing all 4 calibers with:
  - Token symbol + caliber name
  - Current price per round (in USD)
  - 24h change (% with green/red indicator)
- Auto-refreshes via TanStack Query polling (every 30 seconds)

#### How It Works Section

- Three-step visual:
  1. **Mint** — "Deposit USDC. We buy ammo and store it. You receive tokens."
  2. **Trade** — "Trade tokens on DEXes. Speculate on price. No KYC needed."
  3. **Redeem** — "Burn tokens. We ship ammo to your door. (U.S. only, age verified)"
- Each step has an icon/illustration and a short description

#### Market Overview Cards

- Grid of 4 caliber cards (one per supported caliber)
- Each card shows:
  - Caliber name and token symbol
  - Current price per round
  - Mini sparkline chart (7-day price trend)
  - 24h volume
  - CTA: "Mint" button
- Clicking the card navigates to `/market/[caliber]`

#### Stats Bar

- Key protocol stats in a horizontal row:
  - Total value locked (total USDC value of all minted tokens)
  - Total rounds tokenized (sum across all calibers)
  - Number of unique holders
  - 24h volume

#### Footer

- Links: Whitepaper, Docs, GitHub, Twitter/X
- Legal disclaimer: "Not financial advice. Redemption restricted to eligible U.S. states."

---

### 5.2 Market Overview (`/market`)

**Purpose:** Show all calibers at a glance with pricing data, volumes, and entry points to mint/redeem.

**Layout:**

#### Caliber Table

Full-width table with columns:

| Column       | Description                                                   |
| ------------ | ------------------------------------------------------------- |
| Caliber      | Token symbol + icon + full name (e.g., "9MM — 9mm FMJ 115gr") |
| Price        | Current price per round in USD                                |
| 24h Change   | Percentage with color (green up, red down)                    |
| 7d Change    | Percentage with color                                         |
| 24h Volume   | Trading volume in USD                                         |
| Total Supply | Number of tokens in circulation                               |
| Backing      | Number of physical rounds in warehouse                        |
| Actions      | "Mint" and "Trade" buttons                                    |

Clicking a row navigates to `/market/[caliber]`.

#### Time Range Selector

- Buttons: 24H | 7D | 30D | 90D | 1Y | ALL
- Changes the "Change" column data and sparklines accordingly

#### Proof of Reserves Summary

- Small card or banner:
  - "All tokens are backed 1:1 by physical ammunition in insured storage."
  - Link to latest audit attestation (external link)
  - Total rounds in warehouse vs. total token supply (should match)

---

### 5.3 Caliber Detail Page (`/market/[caliber]`)

**Purpose:** Deep dive into a single caliber. Price chart, token info, and quick access to mint/redeem.

**Layout:**

#### Header

- Caliber name, token symbol, and specification (e.g., "9mm FMJ — 115gr, brass case, factory-new")
- Current price (large)
- 24h change with color
- 24h high / 24h low

#### Price Chart

- Interactive line chart showing price over time
- Time range selector: 24H | 7D | 30D | 90D | 1Y | ALL
- Hover shows tooltip with exact price and date
- Y-axis: Price per round (USD)
- X-axis: Time

#### Token Stats Grid

Two-column grid:

| Stat                | Value                           |
| ------------------- | ------------------------------- |
| Total Supply        | Number of tokens in circulation |
| Warehouse Inventory | Physical rounds backing tokens  |
| 24h Volume          | USD volume traded               |
| Market Cap          | Total supply x current price    |
| Mint Fee            | 1.5%                            |
| Redeem Fee          | 1.5%                            |
| Min Mint            | 50 rounds (varies by caliber)   |

#### Action Panel (right sidebar on desktop, bottom sheet on mobile)

- Two tabs: **Mint** and **Redeem**
- **Mint tab:**
  - Amount input (USDC) with "MAX" button
  - Shows: rounds you'll receive, fee breakdown, estimated total
  - "Mint" button (primary CTA)
- **Redeem tab:**
  - Amount input (tokens/rounds) with "MAX" button
  - Shows: fee breakdown, net rounds for shipping
  - "Redeem" button → navigates to full `/redeem` flow (shipping details needed)

#### Recent Activity Feed

- Latest mint and redeem events for this caliber (from on-chain events)
- Columns: Type (Mint/Redeem), Amount, Address (truncated), Time
- Limited to last 10-20 entries

---

### 5.4 Mint Flow (`/mint`)

**Purpose:** The core conversion flow. User deposits USDC and receives ammo tokens after processing.

**This is a multi-step form flow. Each step is a distinct UI state on the same page (not separate routes).**

#### Step 1: Select Caliber

- Grid of caliber cards (same design as landing page cards)
- Each card shows: name, current price, min mint quantity
- User clicks one to select → visual selection state (border highlight, checkmark)
- "Next" button at bottom

#### Step 2: Enter Amount

- Selected caliber shown at top (with price per round)
- Input field: "Amount in USDC" (numeric input)
  - Below input: calculated rounds to receive (USDC amount / price per round)
  - Below that: fee breakdown
    - Subtotal: [USDC amount]
    - Mint fee (1.5%): -[fee]
    - Net USDC for ammo: [subtotal - fee]
    - Estimated rounds: [net / price]
- Input field validation:
  - Must be enough for minimum mint (50 rounds for 9mm/556, 100 for 22LR, 20 for 308)
  - Cannot exceed wallet USDC balance
- Show user's USDC balance
- "Next" button

#### Step 3: Review & Confirm

- Summary card:
  - Caliber: [selected]
  - USDC to deposit: [amount]
  - Mint fee: [1.5%]
  - Estimated tokens to receive: [amount]
  - Processing time: "Up to 24-48 hours"
- Disclaimer text: "Tokens will be minted once physical ammunition is verified in storage. This may take up to 48 hours."
- If wallet not connected: show "Connect Wallet" button
- If wallet connected but USDC not approved: show "Approve USDC" button (first transaction)
- After USDC approved: show "Confirm Mint" button (second transaction)

#### Step 4: Transaction Submitted

- Success state with:
  - Check icon / animation
  - "Mint order submitted!"
  - Transaction hash (linked to Snowtrace explorer)
  - "Your tokens will be delivered to your wallet once the order is processed (up to 48 hours)."
  - Order ID for tracking
  - Two CTAs:
    - "View Order" → navigates to `/portfolio/orders/[id]`
    - "Mint More" → resets flow

**Error states to design:**

- Wallet not connected
- Insufficient USDC balance
- Amount below minimum
- Transaction rejected by user
- Transaction failed on-chain
- Network error / wrong network (must be on Avalanche)

---

### 5.5 Redeem Flow (`/redeem`)

**Purpose:** Burn tokens to receive physical ammunition via shipping. This is the only flow that requires KYC and shipping information.

**Multi-step form flow:**

#### Step 1: Select Caliber & Amount

- Dropdown or card selector for caliber
- Shows user's token balance for selected caliber
- Amount input (in rounds/tokens) with "MAX" button
- Fee breakdown:
  - Tokens to burn: [amount]
  - Redeem fee (1.5%): -[fee in tokens]
  - Net rounds for shipment: [amount - fee]
- Validation:
  - Cannot exceed token balance
  - Minimum redemption: same as minimum mint
- "Next" button

#### Step 2: Shipping Information

- **Important banner at top:** "Physical ammunition can only be shipped to eligible U.S. states via UPS Ground."
- Form fields:
  - Full name (required)
  - Address line 1 (required)
  - Address line 2 (optional)
  - City (required)
  - State (required) — dropdown of U.S. states
    - **If user selects a restricted state (CA, NY, IL, DC, NJ):** show inline warning: "Direct shipping is not available in [state]. Dealer pickup may be required. Contact support."
    - Disable "Next" for restricted states in MVP
  - ZIP code (required)
- Age verification checkbox: "I confirm I am 21 years or older (handgun ammo) / 18 years or older (rifle/shotgun ammo) and eligible to receive ammunition in my state."
- "Next" button

#### Step 3: KYC Verification

- **If user's KYC status is "approved":** skip this step
- **If "none" or "rejected":** show KYC prompt
  - "Identity verification is required for physical ammunition shipment."
  - "This is a one-time process."
  - CTA: "Verify Identity" → opens third-party KYC flow (e.g., Persona, Sumsub) in a modal or new tab
  - After completion: status updates to "pending"
- **If "pending":** show waiting state
  - "Your identity verification is being reviewed. This usually takes a few minutes to a few hours."
  - "We'll notify you when it's approved."
  - Option to continue later (save order as draft)

#### Step 4: Review & Confirm

- Summary:
  - Caliber: [selected]
  - Tokens to burn: [amount]
  - Redeem fee: [1.5%]
  - Net rounds for shipment: [net]
  - Ship to: [formatted address]
  - Estimated shipping time: "5-10 business days after processing"
  - Shipping cost: [calculated or "included in fee"]
- Disclaimer: "Once confirmed, tokens will be burned and cannot be recovered. Ammunition will be shipped via UPS Ground to the address above."
- "Confirm Redemption" button (triggers on-chain burn transaction)

#### Step 5: Confirmation

- Success state:
  - "Redemption order submitted!"
  - Transaction hash (linked to explorer)
  - Order ID
  - "You'll receive a tracking number via email once your order ships."
  - CTA: "Track Order" → `/portfolio/orders/[id]`

**Error states:**

- Insufficient token balance
- Restricted state selected
- KYC not approved
- Transaction rejected/failed

---

### 5.6 Portfolio Dashboard (`/portfolio`)

**Purpose:** Authenticated user's home base. See holdings, orders, and Primers balance.

**Requires wallet connection. If not connected, show connect prompt.**

**Layout:**

#### Portfolio Value Header

- Total portfolio value (sum of all token holdings in USD)
- 24h change ($ and %)
- Wallet address (truncated, with copy button)

#### Holdings Section

- Table or card grid of user's token balances:

| Column   | Description                              |
| -------- | ---------------------------------------- |
| Caliber  | Token symbol + icon + name               |
| Balance  | Number of tokens held                    |
| Value    | Balance x current price (USD)            |
| Avg Cost | Average mint price (if trackable)        |
| P&L      | Unrealized profit/loss (if trackable)    |
| Actions  | "Mint More" / "Redeem" / "Trade" buttons |

- If user holds zero tokens: show empty state with CTA to mint

#### Active Orders Section

- Table of pending/processing orders:

| Column   | Description                                                   |
| -------- | ------------------------------------------------------------- |
| Order ID | Clickable → `/portfolio/orders/[id]`                          |
| Type     | Mint or Redeem (with icon/badge)                              |
| Caliber  | Token symbol                                                  |
| Amount   | Rounds/tokens                                                 |
| Status   | Pending / Processing / Completed / Failed (color-coded badge) |
| Created  | Relative time (e.g., "2 hours ago")                           |

- Tab filters: All | Active | Completed | Failed

#### Primers Section

- Primers balance (points earned from LP activity)
- Simple display: "You have earned **X Primers**"
- Brief explanation: "Primers are earned by providing liquidity to ammo token pools. Future utility TBD."
- If zero: "Provide liquidity on a DEX to start earning Primers." with link to trade/LP

---

### 5.7 Order Detail (`/portfolio/orders/[id]`)

**Purpose:** Detailed status tracking for a specific mint or redeem order.

**Layout:**

#### Order Status Tracker

- Horizontal stepper/progress bar showing order lifecycle:

**For Mint orders:**

1. Order Placed (with timestamp)
2. USDC Deposited (with tx hash link)
3. Ammo Purchased (processing indicator)
4. Warehouse Verified
5. Tokens Minted (with tx hash link) → **Complete**

**For Redeem orders:**

1. Redemption Initiated (with timestamp)
2. Tokens Burned (with tx hash link)
3. KYC Verified
4. Order Packed
5. Shipped (with tracking number + carrier link)
6. Delivered → **Complete**

- Current step is highlighted; completed steps have checkmarks; future steps are grayed out
- Failed orders show a red state at the step where failure occurred, with error message

#### Order Details Card

| Field                  | Value                        |
| ---------------------- | ---------------------------- |
| Order ID               | [id]                         |
| Type                   | Mint / Redeem                |
| Caliber                | [caliber name]               |
| Amount                 | [rounds/tokens]              |
| Fee                    | [amount]                     |
| Status                 | [current status badge]       |
| Created                | [date and time]              |
| Updated                | [date and time]              |
| Transaction            | [tx hash linked to explorer] |
| Shipping (redeem only) | Address + tracking number    |

#### Support Section

- "Having issues with this order?"
- Link to contact support or open a ticket

---

## 6. Global Components

### 6.1 Navigation Bar

**Desktop (always visible at top):**

- Left: Logo / wordmark ("Ammo Exchange")
- Center: Nav links — Market | Mint | Redeem | Portfolio
- Right:
  - Network badge (Avalanche logo + "Avalanche" or "Fuji Testnet")
  - Wallet button:
    - **Disconnected:** "Connect Wallet" button
    - **Connected:** Truncated address (0x1234...abcd) with avatar/identicon, dropdown on click:
      - USDC balance
      - Copy address
      - View on explorer
      - Disconnect

**Mobile:**

- Hamburger menu (left)
- Logo (center)
- Wallet button (right)
- Menu slides in from left with nav links

### 6.2 Wallet Connection Modal

Triggered when user clicks "Connect Wallet" anywhere:

- Modal with wallet options:
  - MetaMask (icon + name)
  - WalletConnect (icon + name)
  - Coinbase Wallet (icon + name)
- After selection: follow wallet's native connection flow
- On success: modal closes, UI updates to connected state
- On error: show error message in modal with retry option

### 6.3 Network Switch Prompt

If user is connected to wrong network (not Avalanche):

- Persistent banner or modal: "Please switch to Avalanche network to use Ammo Exchange."
- "Switch Network" button (triggers wagmi network switch)
- All action buttons (mint, redeem) are disabled until correct network

### 6.4 Transaction Status Toast/Notifications

After any on-chain transaction:

1. **Pending:** Toast at bottom-right: "Transaction submitted. Waiting for confirmation..." with spinner and tx hash link
2. **Confirmed:** Toast updates: "Transaction confirmed!" with green check
3. **Failed:** Toast updates: "Transaction failed." with red X and error reason

Toasts auto-dismiss after 8 seconds but can be manually closed.

### 6.5 Loading States

- **Page load:** Skeleton screens matching the layout of each page section
- **Data fetching:** Shimmer/pulse animation on data cells
- **Transaction waiting:** Spinner with "Waiting for wallet..." or "Confirming on-chain..."
- **Processing order:** Animated progress indicator on order detail page

### 6.6 Empty States

Design empty states for:

- Portfolio with zero holdings: "You don't hold any ammo tokens yet." + "Start Minting" CTA
- No orders: "No orders yet." + "Mint your first tokens" CTA
- Zero Primers: "Provide liquidity to earn Primers." + link to learn more

---

## 7. UX Flows (End-to-End)

These are the complete user journeys the designer should map.

### Flow 1: First-Time Mint

```
Landing page
  → User clicks "Start Minting"
  → Wallet connect modal appears (if not connected)
  → User connects MetaMask
  → Network switch prompt (if wrong network)
  → User switches to Avalanche
  → Navigated to /mint
  → Step 1: User selects "9MM"
  → Step 2: User enters "100" USDC
    → UI shows: ~476 rounds, 1.50 USDC fee, net 98.50 USDC
  → Step 3: User reviews summary
    → Clicks "Approve USDC" → MetaMask popup → confirms
    → Button changes to "Confirm Mint" → MetaMask popup → confirms
  → Step 4: Success screen
    → Toast: "Transaction confirmed!"
    → User clicks "View Order" → /portfolio/orders/[id]
    → Order shows: Step 2 of 5 (USDC Deposited), waiting for processing
```

### Flow 2: Redeem and Ship

```
User navigates to /portfolio
  → Sees 9MM balance: 476 tokens ($100 value)
  → Clicks "Redeem" on 9MM row
  → Navigated to /redeem
  → Step 1: 9MM selected, enters 200 rounds
    → Fee: 3 rounds (1.5%), net shipment: 197 rounds
  → Step 2: Enters shipping address (Texas — no restrictions)
    → Checks age verification box
  → Step 3: KYC — user hasn't verified yet
    → Clicks "Verify Identity" → third-party KYC opens
    → Completes verification → status: "pending"
    → Waits for approval (minutes to hours)
    → Returns to app, KYC now "approved"
  → Step 4: Reviews summary, clicks "Confirm Redemption"
    → MetaMask popup → confirms burn transaction
  → Step 5: Confirmation screen
    → Order ID, tx hash, estimated delivery
  → Later: user checks /portfolio/orders/[id]
    → Status progresses: Packed → Shipped (tracking number) → Delivered
```

### Flow 3: Speculator (No Redemption)

```
Landing page
  → User sees 9MM price is $0.19/rd, notices 7d chart trending up
  → Clicks "Start Minting" → connects wallet
  → Mints $500 USDC worth of 9MM tokens
  → Tokens arrive in wallet (24-48hr)
  → Price moves to $0.25/rd over next month
  → User navigates to /market/9MM → clicks "Trade"
    → Redirected to Uniswap/DEX pool for 9MM/USDC
    → Sells tokens at market price
  → Profit captured without ever touching physical ammo
```

### Flow 4: Restricted State Redemption Attempt

```
User navigates to /redeem
  → Selects caliber and amount
  → Step 2: Enters California address
    → State dropdown selection triggers warning:
      "Direct shipping is not available in California.
       Ammunition must be shipped to a licensed dealer.
       Contact support for dealer pickup options."
    → "Next" button disabled
    → User either changes state or contacts support
```

### Flow 5: Returning User Checks Portfolio

```
User connects wallet
  → Navigated to /portfolio
  → Sees holdings: 476 9MM ($100), 200 556 ($70)
  → Total portfolio: $170, up 3.2% (24h)
  → Sees active order: Mint 308, Processing
  → Clicks order → sees status: Step 3 of 5 (Ammo Purchased)
  → Sees Primers balance: 1,240 Primers
```

---

## 8. Design System Guidance

### 8.1 Brand Direction

- **Tone:** Serious, trustworthy, utilitarian. Not playful. Think financial product, not meme coin.
- **Palette:** Dark theme recommended (aligns with firearms/tactical aesthetic and crypto convention). High contrast for readability.
- **Typography:** Clean, sans-serif. Monospace for numbers, prices, addresses.
- **Iconography:** Minimal, functional. Caliber icons should be recognizable but not photorealistic.

### 8.2 Responsive Breakpoints

| Breakpoint | Target     |
| ---------- | ---------- |
| Mobile     | 320-767px  |
| Tablet     | 768-1023px |
| Desktop    | 1024px+    |

- **Mobile-first design.** Mint and redeem flows must be fully functional on mobile.
- Caliber detail page: action panel moves from right sidebar (desktop) to bottom sheet (mobile).
- Navigation: hamburger on mobile, full bar on desktop.

### 8.3 Accessibility

- WCAG 2.1 AA compliance minimum
- Color-coded indicators (green/red for price changes) must also have text/icon fallbacks
- All interactive elements must be keyboard-navigable
- Form inputs need proper labels and error messages

### 8.4 Animation Guidance

- Subtle, purposeful. No decorative animation.
- Page transitions: simple fade or slide
- Number changes (prices): count-up animation
- Skeleton loading: shimmer effect
- Transaction states: spinner → checkmark transition
- Chart interactions: smooth tooltip follow on hover

---

## 9. Data Requirements per Page

This tells the designer what data is dynamic (fetched from API/chain) vs. static.

| Page                 | Dynamic Data Source                                | Refresh                |
| -------------------- | -------------------------------------------------- | ---------------------- |
| Landing (hero)       | Static                                             | —                      |
| Landing (ticker)     | TanStack Query → price API                         | 30s polling            |
| Landing (stats)      | TanStack Query → stats API                         | 60s polling            |
| Market table         | TanStack Query → price API + on-chain supply reads | 30s polling            |
| Caliber detail chart | TanStack Query → historical price API              | On time-range change   |
| Caliber detail stats | wagmi hooks → on-chain reads (totalSupply)         | 30s polling            |
| Mint flow            | wagmi hooks → USDC balance, allowance              | On wallet change       |
| Redeem flow          | wagmi hooks → token balances                       | On wallet change       |
| Portfolio holdings   | wagmi hooks → all token balances + price API       | 30s polling            |
| Portfolio orders     | TanStack Query → orders API (backend)              | 15s polling for active |
| Order detail         | TanStack Query → single order API                  | 10s polling if active  |
| Primers              | TanStack Query → primers API                       | 60s polling            |

---

## 10. Out of Scope (for this PRD)

These are not part of the UI design scope for MVP:

- Admin dashboard (keeper/admin interface for finalizing orders)
- KYC provider integration UI (we will embed a third-party flow)
- DEX/swap interface (we link out to Uniswap or embed their widget)
- Smart contract deployment or backend worker
- Fiat on-ramp
- Mobile native app
- Multi-chain network selector (MVP is Avalanche only)
- Primers earning mechanics / LP interface (we show balance only; LP happens on DEX)

---

## 11. Deliverables Expected from Designer

1. **Wireframes** for all pages listed in Section 5 (desktop + mobile)
2. **High-fidelity mockups** for all pages (desktop + mobile)
3. **Component library** — reusable components:
   - Caliber card
   - Price ticker
   - Stat card
   - Order status stepper
   - Action panel (mint/redeem)
   - Toast notification
   - Empty state
   - Wallet button states
   - Table row
   - Modal (wallet connect, confirmation)
   - Form inputs (text, number, dropdown, checkbox)
   - Button variants (primary, secondary, disabled, loading)
   - Badge variants (status, network, caliber)
4. **Interactive prototype** covering the 5 UX flows in Section 7
5. **Design tokens** — colors, typography scale, spacing scale, border radius, shadows
6. **Responsive behavior** documentation for each page

---

## Appendix A: State Restrictions Reference

States where direct ammunition shipping is prohibited (MVP will not support redemption to these states):

| State           | Reason                                                  |
| --------------- | ------------------------------------------------------- |
| California      | Background check required; must ship to licensed dealer |
| New York        | Must pick up from licensed dealer                       |
| Illinois        | FOID card required; no direct consumer shipment         |
| Washington D.C. | Must pick up from dealer                                |
| New Jersey      | FID card required; certain ammo types restricted        |

## Appendix B: Fee Constants

| Fee             | Value          | Notes                            |
| --------------- | -------------- | -------------------------------- |
| Mint fee        | 150 bps (1.5%) | Applied to USDC deposit          |
| Redeem fee      | 150 bps (1.5%) | Applied to token burn amount     |
| Max fee cap     | 500 bps (5%)   | Hard cap in smart contract       |
| BPS denominator | 10,000         | Standard basis point calculation |

## Appendix C: Order Status Lifecycle

```
Mint:   PENDING → PROCESSING → COMPLETED
                              → FAILED
                              → CANCELLED

Redeem: PENDING → PROCESSING → COMPLETED
                              → FAILED
                              → CANCELLED
```

Transitions are triggered by the backend keeper, not by the user. The UI must poll for status updates on active orders.
