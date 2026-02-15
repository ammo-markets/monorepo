import { createPublicClient, http } from "viem";
import { avalancheFuji } from "viem/chains";
import { env } from "./env";

/**
 * Viem public client configured for Avalanche Fuji testnet (chain ID 43113).
 *
 * Uses retry transport with exponential backoff for transient RPC failures
 * (network errors, 429, 502, 503, etc.). The env import ensures FUJI_RPC_URL
 * was validated at startup.
 */
export const client = createPublicClient({
  chain: avalancheFuji,
  transport: http(env.FUJI_RPC_URL, {
    retryCount: 5,
    retryDelay: 1000, // 1s base, viem uses exponential backoff internally
    timeout: 30_000, // 30s timeout per request (default 10s too short for batch getLogs)
  }),
});
