import type { Caliber, CaliberSpec } from "../types/index";

/** Fee constants in basis points (1 BPS = 0.01%) */
export const FEES = {
  MINT_FEE_BPS: 150, // 1.5%
  REDEEM_FEE_BPS: 150, // 1.5%
  MAX_FEE_BPS: 500, // 5% hard cap
  BPS_DENOMINATOR: 10_000,
} as const;

export const CALIBER_SPECS: Record<Caliber, CaliberSpec> = {
  "9MM": {
    caliber: "9MM",
    name: "9mm Luger",
    description: "9mm 115gr FMJ, brass case, factory-new",
    grainWeight: 115,
    caseType: "brass",
    minMintRounds: 50,
  },
  "556": {
    caliber: "556",
    name: "5.56 NATO",
    description: "5.56 NATO 55gr FMJ, brass case, factory-new",
    grainWeight: 55,
    caseType: "brass",
    minMintRounds: 50,
  },
  "22LR": {
    caliber: "22LR",
    name: ".22 Long Rifle",
    description: ".22 LR 40gr, factory-new",
    grainWeight: 40,
    caseType: "standard",
    minMintRounds: 100,
  },
  "308": {
    caliber: "308",
    name: ".308 Winchester",
    description: ".308 Win 147gr FMJ, brass case, factory-new",
    grainWeight: 147,
    caseType: "brass",
    minMintRounds: 20,
  },
} as const;

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
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "DC", "FL",
  "GA", "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME",
  "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH",
  "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI",
  "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI",
  "WY", "AS", "GU", "MP", "PR", "VI",
]);

// Bidirectional mapping: Prisma Caliber enum <-> shared Caliber type
// NOTE: Prisma enum values use NINE_MM, FIVE_FIVE_SIX, etc. because Prisma enum
// identifiers cannot start with a digit (e.g., "9MM" is invalid). This is a Prisma
// limitation, not a naming preference. The mapping bridges the two representations.
export const PRISMA_TO_CALIBER = {
  NINE_MM: "9MM",
  FIVE_FIVE_SIX: "556",
  TWENTY_TWO_LR: "22LR",
  THREE_OH_EIGHT: "308",
} as const satisfies Record<string, Caliber>;

export const CALIBER_TO_PRISMA = {
  "9MM": "NINE_MM",
  "556": "FIVE_FIVE_SIX",
  "22LR": "TWENTY_TWO_LR",
  "308": "THREE_OH_EIGHT",
} as const satisfies Record<Caliber, string>;
