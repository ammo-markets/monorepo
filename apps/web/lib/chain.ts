import { avalanche, avalancheFuji } from "viem/chains";
import { getNetworkConfig } from "@ammo-exchange/shared";
import type { NetworkId } from "@ammo-exchange/shared";
import { env } from "@/lib/env";

const VIEM_CHAINS = {
  fuji: avalancheFuji,
  mainnet: avalanche,
} as const;

const network = env.NEXT_PUBLIC_CHAIN as NetworkId;
const config = getNetworkConfig(network);

/** The viem chain object for the active network */
export const activeChain = VIEM_CHAINS[network];

/** Contract addresses for the active network */
export const contracts = config.contracts;

/** Whether this is a testnet deployment */
export const isTestnet = config.isTestnet;

/** Chain ID for the active network */
export const chainId = config.chain.id;

/** Deployment block for the active network */
export const deploymentBlock = config.deploymentBlock;

export function explorerTxUrl(txHash: string): string {
  return `${config.explorerUrl}/tx/${txHash}`;
}

export function explorerAddressUrl(address: string): string {
  return `${config.explorerUrl}/address/${address}`;
}
