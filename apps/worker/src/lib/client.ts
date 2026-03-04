import { createPublicClient, createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { activeChain } from "./chain";
import { env } from "./env";

const transport = http(env.RPC_URL, {
  retryCount: 5,
  retryDelay: 1000,
  timeout: 30_000,
});

/**
 * Viem public client configured for the active network.
 *
 * Uses retry transport with exponential backoff for transient RPC failures
 * (network errors, 429, 502, 503, etc.). The env import ensures RPC_URL
 * was validated at startup.
 */
export const client = createPublicClient({
  chain: activeChain,
  transport,
});

/**
 * Wallet client for keeper transactions (oracle price push).
 * Only created if KEEPER_PRIVATE_KEY is provided — without it the worker
 * runs in read-only mode (indexes events, scrapes prices, but can't push to oracle).
 */
const keeperAccount = env.KEEPER_PRIVATE_KEY
  ? privateKeyToAccount(env.KEEPER_PRIVATE_KEY as `0x${string}`)
  : undefined;

export const walletClient = keeperAccount
  ? createWalletClient({
      account: keeperAccount,
      chain: activeChain,
      transport,
    })
  : undefined;
