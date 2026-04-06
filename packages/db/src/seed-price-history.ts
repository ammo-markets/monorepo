import { config } from "dotenv";
import { resolve } from "node:path";
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import pg from "pg";
import { createAmmoPriceHistory } from "./test-seed.js";
import type { AmmoType, PricePoint } from "./test-seed.js";

// Load .env from monorepo root
config({ path: resolve(import.meta.dirname ?? ".", "../../../.env") });

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const HISTORY_DAYS = 90;

const AMMOPRICESNOW_BASE = "https://ammopricesnow.com/ammodata";
const DATA_DIR = resolve(import.meta.dirname ?? ".", "../data");

/** Practice calibers: real BlackBasin JSON data */
const PRACTICE_SOURCES: Array<{
  prismaEnum: AmmoType;
  jsonFile: string;
}> = [
  { prismaEnum: "NINE_MM_PRACTICE", jsonFile: "9mm.json" },
  { prismaEnum: "FIVE_FIVE_SIX_NATO_PRACTICE", jsonFile: "556nato.json" },
];

/**
 * Self-defense calibers: simulated from real current prices.
 * Base prices sourced from AmmoSquared (2,000+ retailers, March 2026).
 */
const SD_BASE_PRICES: Partial<Record<AmmoType, number>> = {
  NINE_MM_SELF_DEFENSE: 65, // $0.65/rd
  FIVE_FIVE_SIX_SELF_DEFENSE: 149, // $1.49/rd
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

type BlackBasinEntry = { date: string; price: number };

/**
 * Load BlackBasin price data. Tries local file first (packages/db/data/{file}),
 * falls back to fetching from ammopricesnow.com.
 *
 * To populate local files: open https://blackbasin.com/ammo-prices/9mm/ in
 * Chrome, copy the 9mm.json response from the Network tab, and save it to
 * packages/db/data/9mm.json. Same for 556nato.json.
 */
async function loadBlackBasinData(
  jsonFile: string,
): Promise<BlackBasinEntry[]> {
  const localPath = resolve(DATA_DIR, jsonFile);

  // Try local file first
  if (existsSync(localPath)) {
    console.log(`  Loading from local file: ${localPath}`);
    const raw = await readFile(localPath, "utf-8");
    const json = JSON.parse(raw) as { data1: BlackBasinEntry[] };
    if (!json.data1?.length) throw new Error(`No data1 in local ${jsonFile}`);
    return json.data1;
  }

  // Fall back to network fetch
  const url = `${AMMOPRICESNOW_BASE}/${jsonFile}`;
  console.log(`  Fetching ${url}...`);

  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      Referer: "https://blackbasin.com/",
      Accept: "application/json",
    },
    signal: AbortSignal.timeout(30_000),
  });
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);

  const json = (await res.json()) as { data1: BlackBasinEntry[] };
  if (!json.data1?.length) throw new Error(`No data1 in ${jsonFile}`);

  return json.data1;
}

/**
 * Take the last N entries and shift dates so the final entry lands on today.
 */
function sliceLast90AndShift(entries: BlackBasinEntry[]): PricePoint[] {
  const slice = entries.slice(-HISTORY_DAYS);
  if (slice.length === 0) throw new Error("No entries to slice");

  const lastDate = new Date(slice[slice.length - 1]!.date + "T00:00:00Z");
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const shiftMs = today.getTime() - lastDate.getTime();

  return slice.map((entry) => {
    const original = new Date(entry.date + "T00:00:00Z");
    const shifted = new Date(original.getTime() + shiftMs);
    return {
      date: formatDateUTC(shifted),
      priceCents: Math.round(entry.price * 100),
    };
  });
}

function formatDateUTC(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function hourTimestamp(date: string, hour: number): Date {
  return new Date(`${date}T${String(hour).padStart(2, "0")}:00:00.000Z`);
}

// ---------------------------------------------------------------------------
// DB insertion (reused for both practice and SD)
// ---------------------------------------------------------------------------

async function insertCaliberRows(
  client: pg.Client,
  caliber: string,
  points: PricePoint[],
  source: string,
) {
  const BATCH_SIZE = 500;

  // Expand each daily price into 24 hourly rows
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
      params.push(caliber, String(row.priceCents), source, row.createdAt);
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

  console.log(
    `  ${caliber}: ${rows.length} rows (${points.length} days × 24h) | ` +
      `low=$${(minPrice / 100).toFixed(2)} high=$${(maxPrice / 100).toFixed(2)} | ` +
      `source=${source}`,
  );
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function seedPriceHistory() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is not set");

  const client = new pg.Client({ connectionString });
  await client.connect();
  console.log("Connected to database");

  // 1. Clear existing snapshots
  const deleted = await client.query('DELETE FROM "PriceSnapshot"');
  console.log(`Deleted ${deleted.rowCount ?? 0} existing PriceSnapshot rows`);

  // 2. Seed practice calibers from real BlackBasin data
  console.log("\n--- Practice calibers (real BlackBasin data) ---");
  for (const { prismaEnum, jsonFile } of PRACTICE_SOURCES) {
    const raw = await loadBlackBasinData(jsonFile);
    const points = sliceLast90AndShift(raw);
    await insertCaliberRows(client, prismaEnum, points, "blackbasin");
  }

  // 3. Seed self-defense calibers using market simulator + real base prices
  console.log("\n--- Self-defense calibers (simulated from real prices) ---");
  const sdHistory = createAmmoPriceHistory(
    SD_BASE_PRICES as Record<AmmoType, number>,
    { days: HISTORY_DAYS },
  );

  for (const [caliber, points] of Object.entries(sdHistory)) {
    await insertCaliberRows(client, caliber, points, "blackbasin-derived");
  }

  await client.end();

  const totalRows =
    (PRACTICE_SOURCES.length + Object.keys(SD_BASE_PRICES).length) *
    HISTORY_DAYS *
    24;
  console.log(`\nPrice history seed complete. ~${totalRows} rows inserted.`);
}

seedPriceHistory().catch((e) => {
  console.error("Seed failed:", e);
  process.exit(1);
});
