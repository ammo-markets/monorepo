import { createPublicClient, http } from "viem";
import { avalanche } from "viem/chains";
import { prisma } from "@ammo-exchange/db";
import { CONTRACT_ADDRESSES } from "@ammo-exchange/shared";

const publicClient = createPublicClient({
  chain: avalanche,
  transport: http(),
});

async function main() {
  console.log("[worker] Starting Ammo Exchange event listener...");
  console.log(`[worker] Chain: ${publicClient.chain.name}`);

  const blockNumber = await publicClient.getBlockNumber();
  console.log(`[worker] Current block: ${blockNumber}`);

  // TODO: Watch for MintStarted events
  // const unwatch = publicClient.watchContractEvent({
  //   address: CONTRACT_ADDRESSES.mainnet.ammoToken9MM,
  //   abi: IAmmoTokenAbi,
  //   eventName: "MintStarted",
  //   onLogs(logs) {
  //     for (const log of logs) {
  //       console.log("[worker] MintStarted:", log);
  //       // Create order in database via prisma
  //     }
  //   },
  // });

  console.log("[worker] Listening for events... (press Ctrl+C to stop)");
}

main().catch((err) => {
  console.error("[worker] Fatal error:", err);
  process.exit(1);
});
