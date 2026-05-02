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

export interface ReturnPoint {
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
      "ERC-20 ammunition tokens, fully backed 1:1 by physical inventory in our US warehouse.",
  },
  {
    icon: "🔒",
    title: "Avalanche-only at launch",
    detail:
      "Bridges blacklisted by the protocol — supply stays native to Avalanche so redemption integrity and tax mechanics hold.",
  },
  {
    icon: "🤝",
    title: "In partnership with Avalanche",
    detail:
      "Built in close coordination with the Avalanche team — strategic ecosystem support and aligned go-to-market.",
  },
];

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
      "Thin pools signal an undesirable asset before retail ever arrives. Liquidity is the first trust signal a buyer sees.",
  },
  {
    icon: "📉",
    headline: "Wide spreads break the funnel",
    detail:
      "5–10% slippage on a token-to-AVAX swap is enough to send a first-time buyer away. They don't come back.",
  },
  {
    icon: "🎯",
    headline: "Anchor caliber, then catalog",
    detail:
      "Deep liquidity on 5.56 NATO unlocks the rest. Each additional caliber compounds the network effect for the protocol and for the LP.",
  },
];

// ---------------------------------------------------------------------------
// Slide 4 — The Ask
// ---------------------------------------------------------------------------

export const ASK_HEADLINE = "$100K – $1M per caliber";
export const ASK_SUB =
  "50% AVAX · 50% ammo rounds · Uniswap V2-style LP — Pharaoh Exchange at launch";

export const ASK_TERMS: AskRow[] = [
  { label: "Capital range", value: "$100K – $1M per caliber" },
  { label: "Composition", value: "50% AVAX / 50% ammo tokens" },
  { label: "Position", value: "Uniswap V2-style LP" },
  {
    label: "Venue",
    value: "Pharaoh Exchange at launch — any V2-compatible AMM",
  },
  { label: "Launch caliber", value: "5.56 NATO" },
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
    title: "95% NAV Exit Floor",
    detail:
      "AmmoSquared repurchases ammo rounds at 95% of NAV — at any time, you can unwind the ammo side of your position into cash with a hard, transparent floor.",
  },
];
