import { createPublicClient, createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { avalancheFuji } from "viem/chains";

export const publicClient = createPublicClient({
  chain: avalancheFuji,
  transport: http(process.env.FUJI_RPC_URL),
});

// Server-side faucet wallet — only available when FAUCET_PRIVATE_KEY is set
export const faucetAccount = process.env.FAUCET_PRIVATE_KEY
  ? privateKeyToAccount(process.env.FAUCET_PRIVATE_KEY as `0x${string}`)
  : null;

export const faucetWalletClient = faucetAccount
  ? createWalletClient({
      account: faucetAccount,
      chain: avalancheFuji,
      transport: http(process.env.FUJI_RPC_URL),
    })
  : null;
