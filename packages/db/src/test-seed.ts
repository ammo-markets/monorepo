export type AmmoType =
  | "NINE_MM_PRACTICE"
  | "NINE_MM_SELF_DEFENSE"
  | "FIVE_FIVE_SIX_SELF_DEFENSE"
  | "FIVE_FIVE_SIX_NATO_PRACTICE";

export const BASE_PRICES = {
  NINE_MM_PRACTICE: 28,
  NINE_MM_SELF_DEFENSE: 63,
  FIVE_FIVE_SIX_SELF_DEFENSE: 149,
  FIVE_FIVE_SIX_NATO_PRACTICE: 57,
} as const satisfies Record<AmmoType, number>;

export type PricePoint = {
  date: string; // YYYY-MM-DD
  priceCents: number;
};

type PriceHistory = Record<AmmoType, PricePoint[]>;

type GeneratorOptions = {
  days?: number; // default 90
  endDate?: Date; // default today
  seed?: number; // deterministic output if provided
};

export function createAmmoPriceHistory(
  basePrices: Record<AmmoType, number>,
  options: GeneratorOptions = {},
): PriceHistory {
  const days = options.days ?? 90;
  const endDate = options.endDate ?? new Date();
  const rng = mulberry32(options.seed ?? 123456789);

  const ammoTypes = Object.keys(basePrices) as AmmoType[];

  // Shared market factor:
  // simulates broad pressure from inputs / retail competition / inventory.
  let commonFactor = randomBetween(rng, -0.01, 0.01); // start within ±1%

  // Per-ammo states in percentage deviation from base price, e.g. 0.035 = +3.5%
  const state: Record<AmmoType, number> = {} as Record<AmmoType, number>;
  const promoShock: Record<AmmoType, number> = {} as Record<AmmoType, number>;

  for (const ammo of ammoTypes) {
    state[ammo] = randomBetween(rng, -0.015, 0.015);
    promoShock[ammo] = 0;
  }

  const history: PriceHistory = {} as PriceHistory;
  for (const ammo of ammoTypes) history[ammo] = [];

  // Make self-defense ammo a bit more stable and sticky.
  const params: Record<
    AmmoType,
    {
      volatility: number; // daily idiosyncratic movement in percentage points
      reversion: number; // pull toward zero
      marketBeta: number; // exposure to common factor
      promoChance: number; // rare event chance per day
      promoSize: [number, number]; // in deviation terms
    }
  > = {
    NINE_MM_PRACTICE: {
      volatility: 0.006,
      reversion: 0.18,
      marketBeta: 0.95,
      promoChance: 0.045,
      promoSize: [-0.035, 0.02], // more likely discounts than spikes
    },
    NINE_MM_SELF_DEFENSE: {
      volatility: 0.004,
      reversion: 0.14,
      marketBeta: 0.75,
      promoChance: 0.02,
      promoSize: [-0.02, 0.025],
    },
    FIVE_FIVE_SIX_SELF_DEFENSE: {
      volatility: 0.0045,
      reversion: 0.13,
      marketBeta: 0.8,
      promoChance: 0.018,
      promoSize: [-0.02, 0.025],
    },
    FIVE_FIVE_SIX_NATO_PRACTICE: {
      volatility: 0.0065,
      reversion: 0.17,
      marketBeta: 1.0,
      promoChance: 0.04,
      promoSize: [-0.03, 0.022],
    },
  };

  const startDate = addDays(endDate, -(days - 1));

  for (let i = 0; i < days; i++) {
    const date = addDays(startDate, i);

    // Common factor mean-reverts too, so the whole market doesn't drift away.
    commonFactor = commonFactor * 0.82 + gaussian(rng, 0, 0.0035);

    // Clamp common factor so all lines stay believable.
    commonFactor = clamp(commonFactor, -0.04, 0.04);

    for (const ammo of ammoTypes) {
      const p = params[ammo];

      // Occasional temporary promo / supply shock.
      if (rng() < p.promoChance) {
        promoShock[ammo] += randomBetween(rng, p.promoSize[0], p.promoSize[1]);
      }

      // Promo effects decay over a few days.
      promoShock[ammo] *= 0.72;

      // Mean-reverting idiosyncratic movement around base.
      const idiosyncratic =
        state[ammo] * (1 - p.reversion) + gaussian(rng, 0, p.volatility);

      // Combine product-specific behavior + broad market movement + temporary shock.
      let deviation =
        idiosyncratic + commonFactor * p.marketBeta + promoShock[ammo];

      // Hard bound to requested ±10% around base.
      deviation = clamp(deviation, -0.1, 0.1);
      state[ammo] = deviation;

      const base = basePrices[ammo];
      const rawPrice = base * (1 + deviation);

      // Ammo prices should always be integer cents.
      const priceCents = Math.max(1, Math.round(rawPrice));

      history[ammo].push({
        date: formatDate(date),
        priceCents,
      });
    }
  }

  // Optional cleanup pass:
  // remove ugly single-day flips by softly smoothing while preserving realism.
  for (const ammo of ammoTypes) {
    history[ammo] = softSmooth(history[ammo], 0.2);
  }

  return history;
}

/* ---------------- helpers ---------------- */

function mulberry32(seed: number): () => number {
  let t = seed >>> 0;
  return function () {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function gaussian(rng: () => number, mean = 0, stdDev = 1): number {
  // Box-Muller transform
  let u = 0;
  let v = 0;
  while (u === 0) u = rng();
  while (v === 0) v = rng();
  const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  return mean + z * stdDev;
}

function randomBetween(rng: () => number, min: number, max: number): number {
  return min + (max - min) * rng();
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function softSmooth(points: PricePoint[], strength = 0.2): PricePoint[] {
  if (points.length < 3) return points;

  const out = [...points];

  for (let i = 1; i < points.length - 1; i++) {
    const prevPoint = out[i - 1]!;
    const currPoint = out[i]!;
    const nextPoint = out[i + 1]!;

    const neighborAvg = (prevPoint.priceCents + nextPoint.priceCents) / 2;
    const blended =
      currPoint.priceCents * (1 - strength) + neighborAvg * strength;

    out[i] = {
      date: currPoint.date,
      priceCents: Math.max(1, Math.round(blended)),
    };
  }

  return out;
}
