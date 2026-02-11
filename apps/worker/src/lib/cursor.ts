import { prisma } from "@ammo-exchange/db";
import { CURSOR_KEY, CHAIN_ID } from "./constants";

/**
 * Transaction client type extracted from Prisma's $transaction callback.
 * Used by handlers to perform writes within the same transaction scope.
 */
export type PrismaTx = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

/**
 * Read the current block cursor position.
 * Returns 0n if no cursor exists yet (first run).
 */
export async function getCursor(tx: PrismaTx): Promise<bigint> {
  const cursor = await tx.blockCursor.findUnique({
    where: { contractAddress: CURSOR_KEY },
  });
  return cursor?.lastBlock ?? 0n;
}

/**
 * Create or update the block cursor to the given block number.
 * Should be called atomically within the same transaction as event processing.
 */
export async function upsertCursor(
  tx: PrismaTx,
  lastBlock: bigint,
): Promise<void> {
  await tx.blockCursor.upsert({
    where: { contractAddress: CURSOR_KEY },
    create: {
      contractAddress: CURSOR_KEY,
      chainId: CHAIN_ID,
      lastBlock,
    },
    update: { lastBlock },
  });
}
