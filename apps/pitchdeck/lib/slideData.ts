/* Static data constants for all 13 pitch deck slides */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface MarketStats {
  tam: string;
  tamValue: string;
  sam: string;
  samValue: string;
  samPercent: string;
  som: string;
  somValue: string;
  somPercent: string;
  gunOwnership: string;
  regularBuyers: string;
  globalDimension: string;
}

export interface FeeEntry {
  label: string;
  value: string;
  description: string;
}

export interface RoadmapPhase {
  phase: number;
  name: string;
  timeline: string;
  outcome: string;
  current?: boolean;
}

export interface CompetitorEntry {
  name: string;
  type: string;
  priceExposure: boolean;
  globalAccess: boolean;
  blockchain: boolean;
  storageFree: boolean;
}

export interface ProblemStat {
  icon: string;
  headline: string;
  detail: string;
}

export interface WhyNowPoint {
  stat: string;
  label: string;
}

export interface Persona {
  title: string;
  description: string;
  motivation: string;
}

export interface RevenueProjection {
  som: string;
  feeRate: string;
  arr: string;
  label: string;
}

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

/** TAM / SAM / SOM market sizing */
export const MARKET_STATS: MarketStats = {
  tam: "Total Addressable Market",
  tamValue: "$8B",
  sam: "Serviceable Addressable Market",
  samValue: "$800M",
  samPercent: "10%",
  som: "Serviceable Obtainable Market",
  somValue: "$80M",
  somPercent: "1%",
  gunOwnership: "42%",
  regularBuyers: "60%",
  globalDimension:
    "Tokenization removes borders. Anyone on earth gets price exposure.",
};

/** Protocol fee structure */
export const FEE_TABLE: FeeEntry[] = [
  {
    label: "Mint Fee",
    value: "1.5%",
    description: "Charged when depositing USDC to mint ammo tokens",
  },
  {
    label: "Redeem Fee",
    value: "1.5%",
    description: "Charged when burning tokens for physical ammunition",
  },
  {
    label: "Max Fee Cap",
    value: "5%",
    description: "Hard-coded on-chain maximum fee (governance protected)",
  },
  {
    label: "Wholesale Spread",
    value: "5-15%",
    description: "Procurement margin on physical ammunition inventory",
  },
];

/** Product roadmap -- outcome milestones */
export const ROADMAP_PHASES: RoadmapPhase[] = [
  {
    phase: 1,
    name: "Testnet Live",
    timeline: "Q1 2026",
    outcome: "4 caliber tokens trading on testnet with full mint/redeem flow",
    current: true,
  },
  {
    phase: 2,
    name: "Mainnet + Liquidity",
    timeline: "Q3 2026",
    outcome: "Mainnet launch with DEX liquidity pools and mobile UI",
  },
  {
    phase: 3,
    name: "DeFi Composability",
    timeline: "Q1 2027",
    outcome: "Chainlink oracles, lending markets, and cross-chain bridges",
  },
  {
    phase: 4,
    name: "Institutional Scale",
    timeline: "2027+",
    outcome:
      "Institutional custody, international expansion, governance token, and RWA framework exploration",
  },
];

/** Competitive landscape comparison */
export const COMPETITIVE_DATA: CompetitorEntry[] = [
  {
    name: "AmmoSeek",
    type: "Price comparison",
    priceExposure: false,
    globalAccess: false,
    blockchain: false,
    storageFree: false,
  },
  {
    name: "AmmoSquared",
    type: "Physical reserve",
    priceExposure: true,
    globalAccess: false,
    blockchain: false,
    storageFree: true,
  },
  {
    name: "GunBroker",
    type: "Auction marketplace",
    priceExposure: false,
    globalAccess: false,
    blockchain: false,
    storageFree: false,
  },
  {
    name: "Forums / Discord",
    type: "P2P trading",
    priceExposure: false,
    globalAccess: false,
    blockchain: false,
    storageFree: false,
  },
  {
    name: "Ammo Exchange",
    type: "DeFi protocol",
    priceExposure: true,
    globalAccess: true,
    blockchain: true,
    storageFree: true,
  },
];

/** Problem slide statistics -- tightened to 1 sentence each */
export const PROBLEM_STATS: ProblemStat[] = [
  {
    icon: "$",
    headline: "$8B market with zero financial instruments",
    detail: "No futures, no ETFs, no options -- the only major commodity without a derivatives market.",
  },
  {
    icon: "%",
    headline: "355% price spike with no hedge",
    detail: "9mm surged from $0.17 to $0.82 per round in 2020-2021. No way to hedge.",
  },
  {
    icon: "X",
    headline: "Geographic restrictions limit access",
    detail: "Physical ammo cannot cross most borders. Import/export bans lock out non-US buyers entirely.",
  },
  {
    icon: "?",
    headline: "Fragmented market, no transparent pricing",
    detail: "Thousands of retailers, no centralized exchange, no real-time price discovery.",
  },
];

// ---------------------------------------------------------------------------
// New data for rewritten slides
// ---------------------------------------------------------------------------

/** Why Now slide -- geopolitical hook */
export const WHY_NOW_HOOK =
  "Defense budgets are surging, ammo shelves are thinning, and 80M gun owners have no financial tool to manage it.";

export const WHY_NOW_POINTS: WhyNowPoint[] = [
  { stat: "$886B", label: "US defense budget (2024) -- record high" },
  { stat: "2020+", label: "Prolonged ammo shortage -- COVID, Ukraine, global demand" },
  { stat: "80M+", label: "American gun owners -- all-time record" },
  { stat: "0", label: "Financial instruments for ammunition exposure" },
];

/** Persona slide -- 3 beachhead users */
export const PERSONA_DATA: Persona[] = [
  {
    title: "Crypto Trader",
    description: "Seeks uncorrelated real-world assets beyond gold and oil.",
    motivation: "Portfolio diversification into a tangible commodity.",
  },
  {
    title: "Gun Store Owner",
    description: "Needs to hedge inventory against unpredictable price spikes.",
    motivation: "Lock in today's price, protect margins from volatility.",
  },
  {
    title: "Global Speculator",
    description: "Wants US ammo price exposure without import barriers.",
    motivation: "Trade a restricted commodity from anywhere on earth.",
  },
];

/** Revenue projection for the revenue slide */
export const REVENUE_PROJECTION: RevenueProjection = {
  som: "$80M",
  feeRate: "3%",
  arr: "$2.4M",
  label: "Year 1 ARR at full SOM capture",
};
