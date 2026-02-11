import { createPublicClient, http } from "viem";
import { avalancheFuji } from "viem/chains";

/**
 * Viem public client configured for Avalanche Fuji testnet (chain ID 43113).
 *
 * Uses FUJI_RPC_URL env var for the transport. Falls back to the default
 * public Fuji RPC if not set.
 */
export const client = createPublicClient({
  chain: avalancheFuji,
  transport: http(process.env.FUJI_RPC_URL),
});
