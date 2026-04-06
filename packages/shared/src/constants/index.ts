import type { Caliber, CaliberSpec } from "../types/index";

/** Fee constants in basis points (1 BPS = 0.01%) */
export const FEES = {
  MINT_FEE_BPS: 150, // 1.5%
  REDEEM_FEE_BPS: 0, // disabled — fees collected in USDT on new flow
  MAX_FEE_BPS: 500, // 5% hard cap
  BPS_DENOMINATOR: 10_000,
} as const;

export const CALIBER_SPECS: Record<Caliber, CaliberSpec> = {
  "9MM_PRACTICE": {
    caliber: "9MM_PRACTICE",
    name: "9mm Practice",
    description: "9mm 115gr FMJ, brass case, factory-new",
    grainWeight: 115,
    caseType: "brass",
    minMintRounds: 0,
    minRedeemRounds: 1000,
    tokenName: "Ammo Exchange 9mm Practice",
    tokenSymbol: "9MM-P",
    sku: "HG-9MM-PRTC",
  },
  "9MM_SELF_DEFENSE": {
    caliber: "9MM_SELF_DEFENSE",
    name: "9mm Self Defense",
    description: "9mm JHP self-defense, factory-new",
    grainWeight: 124,
    caseType: "brass",
    minMintRounds: 0,
    minRedeemRounds: 1000,
    tokenName: "Ammo Exchange 9mm Self Defense",
    tokenSymbol: "9MM-SD",
    sku: "HG-9MM-SLFD",
  },
  "556_SELF_DEFENSE": {
    caliber: "556_SELF_DEFENSE",
    name: "5.56 Self Defense",
    description: "5.56 NATO self-defense, factory-new",
    grainWeight: 62,
    caseType: "brass",
    minMintRounds: 0,
    minRedeemRounds: 1000,
    tokenName: "Ammo Exchange 5.56 Self Defense",
    tokenSymbol: "556-SD",
    sku: "RF-223556-SLFD",
  },
  "556_NATO_PRACTICE": {
    caliber: "556_NATO_PRACTICE",
    name: "5.56 NATO Practice",
    description: "5.56 NATO 55gr FMJ, brass case, factory-new",
    grainWeight: 55,
    caseType: "brass",
    minMintRounds: 0,
    minRedeemRounds: 1000,
    tokenName: "Ammo Exchange 5.56 NATO Practice",
    tokenSymbol: "556-P",
    sku: "RF-223556-PRTC-556",
  },
} as const;

/** All supported calibers derived from CALIBER_SPECS — single source of truth */
export const CALIBERS = Object.keys(CALIBER_SPECS) as Caliber[];

/** States where online ammunition shipping is blocked (any restriction) */
export const RESTRICTED_STATES = [
  "CA", // Background check + licensed dealer pickup required
  "CT", // Permit required for handgun ammo, restrictions on online sales
  "DC", // Effectively prohibited for civilians
  "HI", // Permit required to purchase ammunition
  "IL", // FOID card required
  "MA", // FID/LTC required
  "NJ", // FID required for handgun ammo, restricted online sales
  "NY", // Must ship to licensed dealer
] as const;

/** All valid US state codes (50 states + DC + territories) */
export const VALID_US_STATE_CODES: Set<string> = new Set([
  "AL",
  "AK",
  "AZ",
  "AR",
  "CA",
  "CO",
  "CT",
  "DE",
  "DC",
  "FL",
  "GA",
  "HI",
  "ID",
  "IL",
  "IN",
  "IA",
  "KS",
  "KY",
  "LA",
  "ME",
  "MD",
  "MA",
  "MI",
  "MN",
  "MS",
  "MO",
  "MT",
  "NE",
  "NV",
  "NH",
  "NJ",
  "NM",
  "NY",
  "NC",
  "ND",
  "OH",
  "OK",
  "OR",
  "PA",
  "RI",
  "SC",
  "SD",
  "TN",
  "TX",
  "UT",
  "VT",
  "VA",
  "WA",
  "WV",
  "WI",
  "WY",
  "AS",
  "GU",
  "MP",
  "PR",
  "VI",
]);

// Bidirectional mapping: Prisma Caliber enum <-> shared Caliber type
// NOTE: Prisma enum values use NINE_MM, FIVE_FIVE_SIX, etc. because Prisma enum
// identifiers cannot start with a digit (e.g., "9MM" is invalid). This is a Prisma
// limitation, not a naming preference. The mapping bridges the two representations.
export const PRISMA_TO_CALIBER = {
  NINE_MM_PRACTICE: "9MM_PRACTICE",
  NINE_MM_SELF_DEFENSE: "9MM_SELF_DEFENSE",
  FIVE_FIVE_SIX_SELF_DEFENSE: "556_SELF_DEFENSE",
  FIVE_FIVE_SIX_NATO_PRACTICE: "556_NATO_PRACTICE",
} as const satisfies Record<string, Caliber>;

export const CALIBER_TO_PRISMA = {
  "9MM_PRACTICE": "NINE_MM_PRACTICE",
  "9MM_SELF_DEFENSE": "NINE_MM_SELF_DEFENSE",
  "556_SELF_DEFENSE": "FIVE_FIVE_SIX_SELF_DEFENSE",
  "556_NATO_PRACTICE": "FIVE_FIVE_SIX_NATO_PRACTICE",
} as const satisfies Record<Caliber, string>;

// ---------------------------------------------------------------------------
// BlackBasin / ammopricesnow price data config
// ---------------------------------------------------------------------------

export const AMMOPRICESNOW_BASE = "https://ammopricesnow.com/ammodata";
export const BLACKBASIN_BASE = "https://blackbasin.com/ammo-prices";

/** Practice calibers have direct JSON data from ammopricesnow */
export const BLACKBASIN_SLUGS = {
  "9MM_PRACTICE": { jsonFile: "9mm.json", htmlSlug: "9mm" },
  "556_NATO_PRACTICE": { jsonFile: "556nato.json", htmlSlug: "5-56-nato" },
} as const;

/**
 * Self-defense calibers are derived from practice prices × a multiplier.
 * Ratios sourced from AmmoSquared market data (2,000+ retailers, March 2026):
 *   9mm:  $0.65 SD / $0.28 Practice = 2.32×
 *   5.56: $1.49 SD / $0.57 Practice = 2.61×
 */
export const SD_MULTIPLIERS = {
  "9MM_SELF_DEFENSE": { practiceKey: "9MM_PRACTICE" as Caliber, multiplier: 2.32 },
  "556_SELF_DEFENSE": { practiceKey: "556_NATO_PRACTICE" as Caliber, multiplier: 2.61 },
} as const;
