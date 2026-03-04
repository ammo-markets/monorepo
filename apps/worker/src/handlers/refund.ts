import type { PrismaTx } from "../lib/cursor";
import type { EventMeta } from "../lib/constants";
import { addressToCaliber } from "../lib/constants";
import { CALIBER_TO_PRISMA } from "@ammo-exchange/shared";
import type { Caliber as PrismaCaliber } from "@ammo-exchange/db";

// ── Event Argument Types ────────────────────────────────────────────

export interface RedeemCanceledArgs {
  orderId: bigint;
  user: `0x${string}`;
  unlockedTokens: bigint;
  reasonCode: number;
}

// ── Handlers ────────────────────────────────────────────────────────

/**
 * Handle a RedeemCanceled event by updating the matching PENDING REDEEM order
 * to CANCELLED status.
 *
 * Uses updateMany because onChainOrderId is not a unique field --
 * the lookup is by (onChainOrderId, caliber, type, status).
 */
export async function handleRedeemCanceled(
  tx: PrismaTx,
  args: RedeemCanceledArgs,
  meta: EventMeta,
): Promise<void> {
  const caliber = addressToCaliber(meta.address);
  const prismaCaliber = CALIBER_TO_PRISMA[caliber] as PrismaCaliber;

  await tx.order.updateMany({
    where: {
      onChainOrderId: args.orderId.toString(),
      caliber: prismaCaliber,
      type: "REDEEM",
      status: { in: ["PENDING", "CANCELLED"] },
    },
    data: {
      status: "CANCELLED",
    },
  });

  console.log(
    `[refund] RedeemCanceled orderId=${args.orderId} reason=${args.reasonCode}`,
  );
}
