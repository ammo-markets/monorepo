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
