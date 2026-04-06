import { scrapeBlackBasinPrices } from "./scraper";
import { prisma } from "@ammo-exchange/db";
import { CALIBER_TO_PRISMA } from "@ammo-exchange/shared";
import type { Caliber as PrismaCaliber } from "@ammo-exchange/db";

/**
 * Fetch current ammo prices from BlackBasin/ammopricesnow and sync to DB.
 *
 * For each caliber:
 * - Upserts CaliberPrice (latest price, unique per caliber)
 * - Inserts PriceSnapshot (append-only history for auditing/charts)
 *
 * On-chain price updates are handled by Chainlink Functions + Automation.
 */
export async function syncPrices(): Promise<void> {
  console.log("[priceSync] Starting price sync...");

  const prices = await scrapeBlackBasinPrices();

  if (prices.length === 0) {
    console.warn("[priceSync] No prices scraped — skipping sync");
    return;
  }

  let successCount = 0;

  for (const { caliber, priceCents, priceX18 } of prices) {
    const prismaCaliber = CALIBER_TO_PRISMA[caliber] as PrismaCaliber;

    try {
      await prisma.$transaction([
        prisma.caliberPrice.upsert({
          where: { caliber: prismaCaliber },
          create: {
            caliber: prismaCaliber,
            price: priceCents.toString(),
            priceX18,
            source: "blackbasin",
          },
          update: {
            price: priceCents.toString(),
            priceX18,
            source: "blackbasin",
          },
        }),
        prisma.priceSnapshot.create({
          data: {
            caliber: prismaCaliber,
            price: priceCents.toString(),
            source: "blackbasin",
          },
        }),
      ]);

      successCount++;
    } catch (error) {
      console.error(
        `[priceSync] DB error for ${caliber}:`,
        error instanceof Error ? error.message : error,
      );
    }
  }

  console.log(
    `[priceSync] Synced ${successCount}/${prices.length} caliber prices`,
  );
}
