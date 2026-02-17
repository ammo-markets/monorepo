/* Static data constants for all 13 pitch deck slides */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PriceDataPoint {
  year: string;
  price: number;
}

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
  description: string;
  items: string[];
  current?: boolean;
}

export interface TeamMember {
  name: string;
  role: string;
  bio: string;
  initials: string;
}

export interface CompetitorEntry {
  name: string;
  type: string;
  priceExposure: boolean;
  globalAccess: boolean;
  blockchain: boolean;
  noStorage: boolean;
}

export interface ProblemStat {
  icon: string;
  headline: string;
  detail: string;
}

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

/** 9mm FMJ price history 2018-2025 (whitepaper section 1.2) */
export const PRICE_DATA: PriceDataPoint[] = [
  { year: "2018", price: 0.18 },
  { year: "2019", price: 0.17 },
  { year: "2020 Q1", price: 0.19 },
  { year: "2020 Q3", price: 0.35 },
  { year: "2021", price: 0.82 },
  { year: "2022", price: 0.38 },
  { year: "2023", price: 0.24 },
  { year: "2024", price: 0.22 },
  { year: "2025", price: 0.21 },
];

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
  gunOwnership: "32%",
  regularBuyers: "44%",
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

/** Product roadmap (whitepaper section 9) */
export const ROADMAP_PHASES: RoadmapPhase[] = [
  {
    phase: 1,
    name: "MVP",
    timeline: "Q1 2026",
    description: "Fuji testnet launch with core protocol",
    items: [
      "4 caliber tokens (9mm, 5.56, .22 LR, .308)",
      "Mint and redeem flows with admin finalization",
      "Basic web dashboard",
      "Fuji testnet deployment",
    ],
    current: true,
  },
  {
    phase: 2,
    name: "Expansion",
    timeline: "Q3 2026",
    description: "Mainnet launch and liquidity",
    items: [
      "Avalanche C-Chain mainnet deployment",
      "Additional caliber tokens",
      "Uniswap v3 liquidity pools",
      "Mobile-optimized UI",
    ],
  },
  {
    phase: 3,
    name: "DeFi Integration",
    timeline: "Q1 2027",
    description: "Protocol composability and oracles",
    items: [
      "Chainlink price oracle feeds",
      "Lending / borrowing with ammo collateral",
      "Yield strategies for token holders",
      "Cross-chain bridge (Ethereum, Arbitrum)",
    ],
  },
  {
    phase: 4,
    name: "Scale",
    timeline: "2027+",
    description: "Institutional and international expansion",
    items: [
      "Institutional custody solutions",
      "International market expansion",
      "Reloading component tokens",
      "Governance token launch",
    ],
  },
];

/** Placeholder team members */
export const TEAM_MEMBERS: TeamMember[] = [
  {
    name: "TBD",
    role: "Founder & CEO",
    bio: "Background in DeFi protocol design and commodity markets",
    initials: "F",
  },
  {
    name: "TBD",
    role: "CTO",
    bio: "Full-stack engineer with Solidity and EVM expertise",
    initials: "T",
  },
  {
    name: "TBD",
    role: "Head of Compliance",
    bio: "Former ATF regulatory advisor, firearms law specialist",
    initials: "C",
  },
  {
    name: "TBD",
    role: "Head of Operations",
    bio: "Supply chain management with FFL distributor network",
    initials: "O",
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
    noStorage: false,
  },
  {
    name: "AmmoSquared",
    type: "Layaway program",
    priceExposure: false,
    globalAccess: false,
    blockchain: false,
    noStorage: false,
  },
  {
    name: "Forums / Discord",
    type: "P2P trading",
    priceExposure: false,
    globalAccess: false,
    blockchain: false,
    noStorage: false,
  },
  {
    name: "Ammo Exchange",
    type: "DeFi protocol",
    priceExposure: true,
    globalAccess: true,
    blockchain: true,
    noStorage: true,
  },
];

/** Problem slide statistics */
export const PROBLEM_STATS: ProblemStat[] = [
  {
    icon: "$",
    headline: "$8B market with zero financial instruments",
    detail:
      "No futures, no ETFs, no options. Ammunition is the only major commodity without a derivatives market.",
  },
  {
    icon: "%",
    headline: "355% price spike with no hedge",
    detail:
      "9mm FMJ surged from $0.17 to $0.82 per round during the 2020-2021 shortage. No way to hedge exposure.",
  },
  {
    icon: "X",
    headline: "Geographic restrictions limit access",
    detail:
      "Physical ammunition cannot cross most international borders. 95% of the world has zero access to the US ammo market.",
  },
  {
    icon: "?",
    headline: "Fragmented market, no transparent pricing",
    detail:
      "Thousands of retailers, no centralized exchange, no real-time price discovery mechanism.",
  },
];
