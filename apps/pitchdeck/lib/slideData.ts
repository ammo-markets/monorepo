/* Static data constants for pitch deck slides */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface MarketStats {
  tam: string;
  tamValue: string;
  tamDetail: string;
  sam: string;
  samValue: string;
  samPercent: string;
  samDetail: string;
  som: string;
  somValue: string;
  somPercent: string;
  somDetail: string;
  gunOwnership: string;
  regularBuyers: string;
  globalDimension: string;
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

export interface UseCase {
  title: string;
  description: string;
  highlight: string;
}

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

/** TAM / SAM / SOM market sizing */
export const MARKET_STATS: MarketStats = {
  tam: "Total Addressable Market",
  tamValue: "$13B",
  tamDetail: "Global small arms ammunition market (annual)",
  sam: "Serviceable Addressable Market",
  samValue: "$8B",
  samPercent: "62%",
  samDetail: "US civilian ammunition market",
  som: "Serviceable Obtainable Market",
  somValue: "$80M",
  somPercent: "1%",
  somDetail: "Initial target — online-accessible segment",
  gunOwnership: "42%",
  regularBuyers: "60%",
  globalDimension:
    "Tokenization removes borders. Anyone on earth gets price exposure.",
};

/** Problem slide statistics */
export const PROBLEM_STATS: ProblemStat[] = [
  {
    icon: "$",
    headline: "$8B market with zero financial instruments",
    detail:
      "No futures, no ETFs, no options — the only major commodity without a derivatives market.",
  },
  {
    icon: "%",
    headline: "300%+ price spike with no hedge",
    detail:
      "9mm surged from $0.17 to $0.82 per round in 2020–2021. No way to hedge or profit from the move.",
  },
  {
    icon: "X",
    headline: "Geographic restrictions lock out investors",
    detail:
      "Physical ammo cannot cross most borders. Import/export bans lock out non-US buyers entirely.",
  },
  {
    icon: "?",
    headline: "No way to invest in ammunition",
    detail:
      "Ammo is an asset with wild price swings, yet there's no way to gain exposure in the financial ecosystem.",
  },
];

/** Why Now slide -- market stats */
export const WHY_NOW_HOOK =
  "Ammunition is a massive, volatile commodity with zero financial infrastructure. The market is ready.";

export const WHY_NOW_POINTS: WhyNowPoint[] = [
  { stat: "$8B+", label: "US civilian ammunition market" },
  { stat: "82M+", label: "American gun owners" },
  { stat: "300%+", label: "9mm price spike 2020–2021" },
  { stat: "0", label: "Financial instruments for ammunition" },
];

/** Use Cases slide -- 3 concrete examples */
export const USE_CASE_DATA: UseCase[] = [
  {
    title: "Collateral",
    description:
      "Use 20,000 rounds of 9mm as collateral to borrow money for a car.",
    highlight: "Unlock the value sitting in your ammo stockpile.",
  },
  {
    title: "Yield",
    description:
      "Provide liquidity to earn yield on 10,000 rounds of 5.56.",
    highlight: "Your ammo works for you while you hold it.",
  },
  {
    title: "Global Access",
    description:
      "Invest in a million rounds from halfway around the world at the click of a button.",
    highlight: "No borders, no import restrictions, no storage.",
  },
];
