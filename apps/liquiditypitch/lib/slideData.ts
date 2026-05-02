/* Static data constants for liquidity-pitch slides */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ProtocolPoint {
  icon: string;
  title: string;
  detail: string;
}

export interface ProblemPoint {
  icon: string;
  headline: string;
  detail: string;
}

export interface AskRow {
  label: string;
  value: string;
}

export interface AskSlippageRow {
  tvl: string;
  slippage: string;
  note: string;
  isTarget: boolean;
}

export interface ReturnPoint {
  icon: string;
  title: string;
  detail: string;
}

export interface AmmoSquaredPillar {
  icon: string;
  title: string;
  detail: string;
}

// ---------------------------------------------------------------------------
// Slide 2 — The Protocol, Briefly
// ---------------------------------------------------------------------------

export const PROTOCOL_POINTS: ProtocolPoint[] = [
  {
    icon: "🪙",
    title: "1 token = 1 round",
    detail:
      "ERC-20 ammunition tokens, fully backed 1:1 by physical rounds. Mint with USDC, redeem to your door.",
  },
  {
    icon: "🤝",
    title: "Avalanche-native by design",
    detail:
      "Built in close coordination with the Avalanche team. Bridges blocked at launch — supply, redemption, and tax mechanics all stay on-chain.",
  },
];

// ---------------------------------------------------------------------------
// Slide 3 — Backed by AmmoSquared (dual-pillar)
// ---------------------------------------------------------------------------

export const AMMOSQUARED_HEADLINE = "Backed by AmmoSquared";
export const AMMOSQUARED_SUB =
  "Custody and exit liquidity through one named US counterparty.";

export const AMMOSQUARED_PILLARS: AmmoSquaredPillar[] = [
  {
    icon: "🏭",
    title: "Physical Custody",
    detail:
      "Every token = 1 physical round, custodied at AmmoSquared's US warehouse. Audited, insured, redeemable on demand.",
  },
  {
    icon: "🛡️",
    title: "95% NAV Buyback",
    detail:
      "Token holders who don't want physical delivery redeem to cash at 95% of NAV through AmmoSquared. Hard, transparent floor.",
  },
];

export const AMMOSQUARED_FOOTER =
  "One named US counterparty handling both sides of the physical leg — custody and exit liquidity.";

// ---------------------------------------------------------------------------
// Slide 3 — The Problem (cold-start)
// ---------------------------------------------------------------------------

export const PROBLEM_HOOK =
  "A brand new onchain commodity needs deep liquidity from day one — or it never starts.";

export const PROBLEM_POINTS: ProblemPoint[] = [
  {
    icon: "🥶",
    headline: "Cold start kills new commodities",
    detail:
      "Thin pools signal an undesirable asset, and 5–10% slippage on early swaps sends first-time buyers away. Liquidity is the trust signal — there's no second first impression.",
  },
  {
    icon: "🎯",
    headline: "Anchor calibers, then catalog",
    detail:
      "Deep liquidity on 9mm + 5.56 NATO unlocks the rest. Each additional caliber compounds the network effect for the protocol and for the LP.",
  },
];

// ---------------------------------------------------------------------------
// Slide 4 — The Ask
// ---------------------------------------------------------------------------

export const ASK_INTRO =
  "A $5K user swap shouldn't feel slippage. TVL is the dial.";

export const ASK_SLIPPAGE_ROWS: AskSlippageRow[] = [
  {
    tvl: "$1M pool",
    slippage: "~1.0%",
    note: "Minimum — some friction.",
    isTarget: false,
  },
  {
    tvl: "$4M pool",
    slippage: "~0.25%",
    note: "Target — feels professional.",
    isTarget: true,
  },
];

export const ASK_SUMMARY =
  "$1M floor · $4M target — per caliber. Two calibers at launch: 9mm + 5.56 NATO.";

export const ASK_TERMS: AskRow[] = [
  { label: "Calibers at launch", value: "9mm + 5.56 NATO" },
  { label: "Composition", value: "50% AVAX / 50% ammo tokens per pool" },
  { label: "Position", value: "Uniswap V2-style LP" },
  {
    label: "Venue",
    value: "Pharaoh Exchange at launch — any V2-compatible AMM",
  },
  {
    label: "Roadmap",
    value: "Additional calibers open as further LPs commit",
  },
];

// ---------------------------------------------------------------------------
// Slide 5 — What You Get Back
// ---------------------------------------------------------------------------

export const RETURN_POINTS: ReturnPoint[] = [
  {
    icon: "💰",
    title: "LP Trading Fees",
    detail:
      "Standard Pharaoh swap fees accrue to your position on every trade routed through the pool.",
  },
  {
    icon: "🌾",
    title: "Liquidity Farming",
    detail:
      "Optional emissions in the Ammo Markets protocol token. Long-term value-capture mechanisms (potential buyback-and-bond, etc.) under active design as the protocol matures.",
  },
  {
    icon: "🛡️",
    title: "Bounded Downside",
    detail:
      "Worst case, the ammo side exits at 95% of NAV. Best case, fees and farming compound on a position with a known floor — your risk profile has a known bottom before any return assumption.",
  },
];
