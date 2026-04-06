import {
  CALIBER_SPECS,
  BLACKBASIN_SLUGS,
  SD_MULTIPLIERS,
  AMMOPRICESNOW_BASE,
} from "@ammo-exchange/shared";
import type { Caliber } from "@ammo-exchange/shared";

export interface ScrapedPrice {
  caliber: Caliber;
  priceCents: number;
  priceX18: string;
}

type BlackBasinEntry = { date: string; price: number };

/**
 * Fetch current ammo prices from BlackBasin / ammopricesnow.
 *
 * Practice calibers: fetches the JSON feed and reads the last data point.
 * Self-defense calibers: derives from practice price × market-verified multiplier.
 *
 * No browser automation needed — just HTTP fetches.
 */
export async function scrapeBlackBasinPrices(): Promise<ScrapedPrice[]> {
  const results: ScrapedPrice[] = [];

  // 1. Fetch practice prices from ammopricesnow JSON
  const practicePrices: Partial<Record<Caliber, number>> = {};

  for (const [caliber, { jsonFile }] of Object.entries(BLACKBASIN_SLUGS)) {
    try {
      const priceCents = await fetchLatestPrice(jsonFile);
      if (priceCents !== null) {
        const cal = caliber as Caliber;
        practicePrices[cal] = priceCents;
        results.push(buildScrapedPrice(cal, priceCents));
      }
    } catch (error) {
      console.warn(
        `[scraper] Failed to fetch ${caliber}:`,
        error instanceof Error ? error.message : error,
      );
    }
  }

  // 2. Derive self-defense prices from practice prices × multiplier
  for (const [caliber, { practiceKey, multiplier }] of Object.entries(
    SD_MULTIPLIERS,
  )) {
    const practicePrice = practicePrices[practiceKey];
    if (practicePrice === undefined) {
      console.warn(
        `[scraper] No practice price for ${practiceKey}, skipping ${caliber}`,
      );
      continue;
    }

    const sdPriceCents = Math.round(practicePrice * multiplier);
    results.push(buildScrapedPrice(caliber as Caliber, sdPriceCents));
  }

  return results;
}

/**
 * Fetch the most recent price from the ammopricesnow JSON feed.
 * Returns price in cents, or null on failure.
 */
async function fetchLatestPrice(jsonFile: string): Promise<number | null> {
  const url = `${AMMOPRICESNOW_BASE}/${jsonFile}`;

  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      Referer: "https://blackbasin.com/",
      Accept: "application/json",
    },
    signal: AbortSignal.timeout(30_000),
  });

  if (!res.ok) {
    console.warn(`[scraper] HTTP ${res.status} from ${url}`);
    return null;
  }

  const json = (await res.json()) as { data1?: BlackBasinEntry[] };
  const entries = json.data1;
  if (!entries?.length) {
    console.warn(`[scraper] Empty data1 in ${jsonFile}`);
    return null;
  }

  const lastEntry = entries[entries.length - 1]!;
  const priceDollars = lastEntry.price;

  if (typeof priceDollars !== "number" || priceDollars <= 0 || priceDollars > 100) {
    console.warn(`[scraper] Invalid price in ${jsonFile}: ${priceDollars}`);
    return null;
  }

  return Math.round(priceDollars * 100);
}

function buildScrapedPrice(caliber: Caliber, priceCents: number): ScrapedPrice {
  // Convert cents to 1e18 scale: $0.57 → 57 cents → 57 * 10^16
  const priceX18 = (BigInt(priceCents) * 10n ** 16n).toString();
  return { caliber, priceCents, priceX18 };
}

/**
 * Parse a price string (e.g. "0.57") into cents and 1e18 scale.
 * Validates the price is between $0.01 and $100.00.
 */
export function parsePrice(
  caliber: Caliber,
  priceText: string,
): ScrapedPrice | null {
  const priceFloat = parseFloat(priceText);
  if (isNaN(priceFloat) || priceFloat <= 0 || priceFloat > 100) {
    console.warn(`[scraper] Invalid price for ${caliber}: $${priceText}`);
    return null;
  }

  const priceCents = Math.round(priceFloat * 100);
  const priceX18 = (BigInt(priceCents) * 10n ** 16n).toString();

  return { caliber, priceCents, priceX18 };
}
