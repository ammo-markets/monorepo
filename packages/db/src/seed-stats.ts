import { config } from "dotenv";
import { resolve } from "node:path";

// Load .env from monorepo root (same as prisma.config.ts)
config({ path: resolve(import.meta.dirname ?? ".", "../../.env") });

import { prisma } from "./client.js";

const CALIBERS = [
  "NINE_MM",
  "FIVE_FIVE_SIX",
  "TWENTY_TWO_LR",
  "THREE_OH_EIGHT",
] as const;

async function seedStats() {
  console.log("Seeding ProtocolStats rows...");

  for (const caliber of CALIBERS) {
    const result = await prisma.protocolStats.upsert({
      where: { caliber },
      create: {
        caliber,
        totalMinted: "0",
        totalRedeemed: "0",
        netSupply: "0",
        userCount: 0,
      },
      update: {},
    });
    console.log(`  ${result.caliber}: ${result.id} (upserted)`);
  }

  console.log("Done. 4 ProtocolStats rows seeded.");
}

seedStats()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
