import { prisma } from "@ammo-exchange/db";
import {
  CONTRACT_ADDRESSES,
  CALIBER_TO_PRISMA,
} from "@ammo-exchange/shared";
import type { Caliber } from "@ammo-exchange/shared";
import { PriceOracleAbi } from "@ammo-exchange/contracts/abis";
import { client, walletClient } from "./lib/client";
import { contracts } from "./lib/chain";
import { env } from "./lib/env";

const CALIBERS = Object.keys(contracts.calibers) as Caliber[];

/**
 * Read latest prices from DB and push them to the on-chain PriceOracle
 * via `setBatchPrices(marketAddresses[], pricesX18[])`.
 *
 * Skips gracefully if no wallet client (no KEEPER_PRIVATE_KEY).
 */
export async function pushPricesToOracle(): Promise<void> {
  if (!walletClient) {
    console.log(
      "[oracleSync] No KEEPER_PRIVATE_KEY — skipping oracle push (read-only mode)",
    );
    return;
  }

  const caliberPrices = await prisma.caliberPrice.findMany();

  if (caliberPrices.length === 0) {
    console.warn("[oracleSync] No caliber prices in DB — skipping oracle push");
    return;
  }

  // Build parallel arrays for setBatchPrices
  const marketAddresses: `0x${string}`[] = [];
  const pricesX18: bigint[] = [];

  for (const caliber of CALIBERS) {
    const prismaCaliber = CALIBER_TO_PRISMA[caliber];
    const dbPrice = caliberPrices.find((p) => p.caliber === prismaCaliber);

    if (!dbPrice?.priceX18) {
      console.warn(
        `[oracleSync] No DB price for ${caliber} — skipping`,
      );
      continue;
    }

    marketAddresses.push(contracts.calibers[caliber].market);
    pricesX18.push(BigInt(dbPrice.priceX18));
  }

  if (marketAddresses.length === 0) {
    console.warn("[oracleSync] No valid prices to push");
    return;
  }

  try {
    const hash = await walletClient.writeContract({
      address: contracts.oracle,
      abi: PriceOracleAbi,
      functionName: "setBatchPrices",
      args: [marketAddresses, pricesX18],
    });

    console.log(
      `[oracleSync] Pushed ${marketAddresses.length} prices to oracle — tx: ${hash}`,
    );

    // Wait for confirmation so we know prices are live before next mint
    const receipt = await client.waitForTransactionReceipt({ hash });
    console.log(
      `[oracleSync] Confirmed in block ${receipt.blockNumber} (status: ${receipt.status})`,
    );
  } catch (error) {
    console.error(
      "[oracleSync] Failed to push prices:",
      error instanceof Error ? error.message : error,
    );
  }
}
