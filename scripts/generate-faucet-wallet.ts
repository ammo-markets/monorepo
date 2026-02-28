import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";

const key = generatePrivateKey();
const account = privateKeyToAccount(key);

console.log("=== AVAX Faucet Wallet ===");
console.log("Private Key:", key);
console.log("Address:    ", account.address);
console.log();
console.log("Add to your .env:");
console.log(`FAUCET_PRIVATE_KEY=${key}`);
console.log();
console.log(
  "Fund this address with AVAX on Fuji: https://core.app/tools/testnet-faucet/?subnet=c&token=c",
);
