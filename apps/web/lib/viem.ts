import { createPublicClient, createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { avalancheFuji } from "viem/chains";
import { env } from "@/lib/env";

export const publicClient = createPublicClient({
  chain: avalancheFuji,
  transport: http(env.FUJI_RPC_URL),
});

// Server-side faucet wallet — only available when FAUCET_PRIVATE_KEY is set
export const faucetAccount = env.FAUCET_PRIVATE_KEY
  ? privateKeyToAccount(env.FAUCET_PRIVATE_KEY as `0x${string}`)
  : null;

export const faucetWalletClient = faucetAccount
  ? createWalletClient({
      account: faucetAccount,
      chain: avalancheFuji,
      transport: http(env.FUJI_RPC_URL),
    })
  : null;
