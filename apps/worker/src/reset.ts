import { prisma } from "@ammo-exchange/db";

async function reset() {
  console.log("[reset] Wiping event-derived data...");

  const result = await prisma.$transaction([
    prisma.activityLog.deleteMany(),
    prisma.shippingAddress.deleteMany(),
    prisma.order.deleteMany(),
    prisma.protocolStats.deleteMany(),
    prisma.blockCursor.deleteMany(),
  ]);

  const [activity, shipping, orders, stats, cursors] = result;
  console.log(`[reset] Deleted ${activity.count} activity logs`);
  console.log(`[reset] Deleted ${shipping.count} shipping addresses`);
  console.log(`[reset] Deleted ${orders.count} orders`);
  console.log(`[reset] Deleted ${stats.count} protocol stats`);
  console.log(`[reset] Deleted ${cursors.count} block cursors`);
  console.log(
    "[reset] Done. Restart the worker to resync from DEPLOYMENT_BLOCK."
  );

  await prisma.$disconnect();
}

reset().catch((err) => {
  console.error("[reset] Fatal:", err);
  process.exit(1);
});
