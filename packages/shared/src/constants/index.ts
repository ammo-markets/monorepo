import type { Caliber, CaliberSpec } from "../types/index";

/** Fee constants in basis points (1 BPS = 0.01%) */
export const FEES = {
  MINT_FEE_BPS: 150, // 1.5%
  REDEEM_FEE_BPS: 150, // 1.5%
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
    minMintRounds: 50,
    tokenName: "Ammo Exchange 9mm Practice",
    tokenSymbol: "ax9P",
    sku: "HG-9MM-PRTC",
  },
  "9MM_SELF_DEFENSE": {
    caliber: "9MM_SELF_DEFENSE",
    name: "9mm Self Defense",
    description: "9mm JHP self-defense, factory-new",
    grainWeight: 124,
    caseType: "brass",
    minMintRounds: 50,
    tokenName: "Ammo Exchange 9mm Self Defense",
    tokenSymbol: "ax9SD",
    sku: "HG-9MM-SLFD",
  },
  "556_SELF_DEFENSE": {
    caliber: "556_SELF_DEFENSE",
    name: "5.56 Self Defense",
    description: "5.56 NATO self-defense, factory-new",
    grainWeight: 62,
    caseType: "brass",
    minMintRounds: 50,
    tokenName: "Ammo Exchange 5.56 Self Defense",
    tokenSymbol: "ax556SD",
    sku: "RF-223556-SLFD",
  },
  "556_NATO_PRACTICE": {
    caliber: "556_NATO_PRACTICE",
    name: "5.56 NATO Practice",
    description: "5.56 NATO 55gr FMJ, brass case, factory-new",
    grainWeight: 55,
    caseType: "brass",
    minMintRounds: 50,
    tokenName: "Ammo Exchange 5.56 NATO Practice",
    tokenSymbol: "ax556P",
    sku: "RF-223556-PRTC-556",
  },
} as const;

/** All supported calibers derived from CALIBER_SPECS — single source of truth */
export const CALIBERS = Object.keys(CALIBER_SPECS) as Caliber[];

/** States where direct-to-consumer ammunition shipping is restricted */
export const RESTRICTED_STATES = [
  "CA", // Background check at point of sale
  "NY", // Must pick up from licensed dealer
  "IL", // FOID card required
  "DC", // Must pick up from dealer
  "NJ", // FID card required
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
