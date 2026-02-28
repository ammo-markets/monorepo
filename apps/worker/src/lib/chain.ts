import { avalanche, avalancheFuji } from "viem/chains";
import { getNetworkConfig } from "@ammo-exchange/shared";
import type { NetworkId } from "@ammo-exchange/shared";

const VIEM_CHAINS = {
  fuji: avalancheFuji,
  mainnet: avalanche,
} as const;

const network = (process.env.CHAIN ?? "fuji") as NetworkId;
const config = getNetworkConfig(network);

export const activeChain = VIEM_CHAINS[network];
export const contracts = config.contracts;
export const deploymentBlock = config.deploymentBlock;
export const chainId = config.chain.id;
export const isTestnet = config.isTestnet;
