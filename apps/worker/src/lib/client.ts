import { createPublicClient, http } from "viem";
import { activeChain } from "./chain";
import { env } from "./env";

/**
 * Viem public client configured for the active network.
 *
 * Uses retry transport with exponential backoff for transient RPC failures
 * (network errors, 429, 502, 503, etc.). The env import ensures RPC_URL
 * was validated at startup.
 */
export const client = createPublicClient({
  chain: activeChain,
  transport: http(env.RPC_URL, {
    retryCount: 5,
    retryDelay: 1000,
    timeout: 30_000,
  }),
});
