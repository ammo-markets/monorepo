import type {
  Caliber,
  CaliberSpec,
  UpcomingCaliberSpec,
} from "../types/index";

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
    name: "5.56 NATO",
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

/** Calibers exposed to users at launch. Subset of CALIBERS — flip to add more. */
export const LAUNCH_CALIBERS: readonly Caliber[] = [
  "556_NATO_PRACTICE",
] as const;

/**
 * Calibers on the roadmap that are not yet deployable. Surfaced in the
 * landing ticker and exchange caliber panel as greyed-out previews.
 * When one ships, promote it: add to Caliber union + CALIBER_SPECS +
 * LAUNCH_CALIBERS, then remove from this list.
 */
export const UPCOMING_CALIBERS: readonly UpcomingCaliberSpec[] = [
  {
    id: "9MM_115GR",
    displayName: "9mm 115gr",
    description: "9mm 115gr FMJ practice",
    grainWeight: 115,
    caseType: "brass",
    iconKey: "9MM",
  },
  {
    id: "308_WIN_147GR",
    displayName: ".308 Win 147gr",
    description: ".308 Winchester FMJ",
    grainWeight: 147,
    caseType: "brass",
    iconKey: "308",
  },
  {
    id: "223_REM_55GR",
    displayName: ".223 Rem 55gr",
    description: ".223 Remington FMJ",
    grainWeight: 55,
    caseType: "brass",
    iconKey: "556",
  },
  {
    id: "45_ACP_230GR",
    displayName: ".45 ACP 230gr",
    description: ".45 ACP 230gr FMJ",
    grainWeight: 230,
    caseType: "brass",
    iconKey: "9MM",
  },
  {
    id: "12GA_00_BUCK",
    displayName: "12ga 00 Buck",
    description: "12 gauge 00 buckshot",
    caseType: "shotshell",
    iconKey: "default",
  },
  {
    id: "65_CREEDMOOR",
    displayName: "6.5 Creedmoor",
    description: "6.5 Creedmoor rifle ammunition",
    caseType: "brass",
    iconKey: "308",
  },
  {
    id: "22_LR_40GR",
    displayName: ".22 LR 40gr",
    description: ".22 LR 40gr rimfire",
    grainWeight: 40,
    caseType: "brass",
    iconKey: "22LR",
  },
] as const;

/** States where online ammunition shipping is blocked (any restriction) */
export const RESTRICTED_STATES = [
  "AK", // No UPS Ground service
  "CA", // Background check + licensed dealer pickup required
  "CT", // Permit required for handgun ammo, restrictions on online sales
  "DC", // Effectively prohibited for civilians
  "HI", // Permit required to purchase ammunition, no UPS Ground
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
