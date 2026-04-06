import { chromium } from "playwright";
import type { Browser } from "playwright";
import { CALIBER_SPECS } from "@ammo-exchange/shared";
import type { Caliber } from "@ammo-exchange/shared";

const AMMOSQUARED_BASE = "https://ammosquared.com/product_price_details";

export interface ScrapedPrice {
  caliber: Caliber;
  priceCents: number;
  priceX18: string;
}

/**
 * Scrape AmmoSquared product pages to get current per-round prices.
 *
 * Uses Playwright with Chromium to pass Cloudflare's Turnstile challenge.
 * Launches one browser instance and reuses it across all calibers.
 */
export async function scrapeAmmoSquaredPrices(): Promise<ScrapedPrice[]> {
  const calibers = Object.keys(CALIBER_SPECS) as Caliber[];
  const results: ScrapedPrice[] = [];

  let browser: Browser | null = null;

  try {
    browser = await chromium.launch({ headless: false });

    for (const caliber of calibers) {
      try {
        const price = await scrapeSingleCaliber(browser, caliber);
        if (price) results.push(price);
      } catch (error) {
        console.warn(
          `[scraper] Failed to scrape ${caliber}:`,
          error instanceof Error ? error.message : error,
        );
      }
    }
  } finally {
    await browser?.close();
  }

  return results;
}

async function scrapeSingleCaliber(
  browser: Browser,
  caliber: Caliber,
): Promise<ScrapedPrice | null> {
  const sku = CALIBER_SPECS[caliber].sku;
  const url = `${AMMOSQUARED_BASE}/${sku}`;

  const page = await browser.newPage();

  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30_000 });
    // Wait for Cloudflare challenge to resolve and actual content to appear
    await page
      .locator("text=AMMOSQUARED PRICE / ROUND")
      .waitFor({ timeout: 20_000 });

    const label = page.locator("text=AMMOSQUARED PRICE / ROUND");
    let priceText: string | null = null;

    if ((await label.count()) > 0) {
      const cardText = (await label.locator("..").textContent()) ?? "";
      const match = cardText.match(/\$(\d+\.\d{2})/);
      priceText = match ? match[1]! : null;
    }

    if (!priceText) {
      console.warn(`[scraper] Could not find price for ${caliber} at ${url}`);
      return null;
    }

    return parsePrice(caliber, priceText);
  } finally {
    await page.close();
  }
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
  // Convert cents to 1e18 scale: $0.57 → 57 cents → 57 * 10^16 = 570000000000000000
  const priceX18 = (BigInt(priceCents) * 10n ** 16n).toString();

  return { caliber, priceCents, priceX18 };
}
