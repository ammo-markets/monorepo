import { config } from "dotenv";
import { resolve } from "node:path";
import pg from "pg";
import { BASE_PRICES, createAmmoPriceHistory } from "./test-seed.js";

// Load .env from monorepo root
config({ path: resolve(import.meta.dirname ?? ".", "../../../.env") });

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

/** How far back to generate data (in days) */
const HISTORY_DAYS = 90;

const CALIBERS = Object.keys(BASE_PRICES) as Array<keyof typeof BASE_PRICES>;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Given a YYYY-MM-DD date string and an hour (0–23), return a UTC Date.
 * The chart queries use createdAt so we spread the day's price across all
 * 24 hours so both hourly (24H) and daily (7D/30D/90D) views work correctly.
 */
function hourTimestamp(date: string, hour: number): Date {
  return new Date(`${date}T${String(hour).padStart(2, "0")}:00:00.000Z`);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function seedPriceHistory() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  const client = new pg.Client({ connectionString });
  await client.connect();
  console.log("Connected to database");

  // Generate daily price history for all calibers using the market simulator.
  const history = createAmmoPriceHistory(BASE_PRICES, { days: HISTORY_DAYS });

  const totalRows = CALIBERS.length * HISTORY_DAYS * 24;
  console.log(
    `Generating ${HISTORY_DAYS} days × 24 h × ${CALIBERS.length} calibers = ${totalRows} rows`,
  );

  // 1. Clear existing snapshots
  const deleted = await client.query('DELETE FROM "PriceSnapshot"');
  console.log(`Deleted ${deleted.rowCount ?? 0} existing PriceSnapshot rows`);

  // 2. Insert hourly rows derived from each daily price point
  const BATCH_SIZE = 500;

  for (const caliber of CALIBERS) {
    const points = history[caliber];

    // Expand each daily PricePoint into 24 hourly rows
    const rows: Array<{ priceCents: number; createdAt: Date }> = [];
    for (const point of points) {
      for (let hour = 0; hour < 24; hour++) {
        rows.push({
          priceCents: point.priceCents,
          createdAt: hourTimestamp(point.date, hour),
        });
      }
    }

    for (let i = 0; i < rows.length; i += BATCH_SIZE) {
      const batch = rows.slice(i, i + BATCH_SIZE);
      const values: string[] = [];
      const params: (string | Date)[] = [];

      batch.forEach((row, j) => {
        const idx = j * 4;
        values.push(
          `(gen_random_uuid(), $${idx + 1}, $${idx + 2}, $${idx + 3}, $${idx + 4})`,
        );
        params.push(
          caliber,
          String(row.priceCents),
          "mock-seed",
          row.createdAt,
        );
      });

      await client.query(
        `INSERT INTO "PriceSnapshot" (id, caliber, price, source, "createdAt")
         VALUES ${values.join(", ")}`,
        params,
      );
    }

    const prices = points.map((p) => p.priceCents);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const baseCents = BASE_PRICES[caliber];
    const maxDriftPct = Math.max(
      (Math.abs(minPrice - baseCents) / baseCents) * 100,
      (Math.abs(maxPrice - baseCents) / baseCents) * 100,
    );

    console.log(
      `  ${caliber}: ${rows.length} rows (${points.length} days × 24h) | ` +
        `base=$${(baseCents / 100).toFixed(2)} | ` +
        `low=$${(minPrice / 100).toFixed(2)} high=$${(maxPrice / 100).toFixed(2)} | ` +
        `max drift=${maxDriftPct.toFixed(1)}%`,
    );
  }

  await client.end();
  console.log("\nPrice history seed complete.");
}

seedPriceHistory().catch((e) => {
  console.error("Seed failed:", e);
  process.exit(1);
});
