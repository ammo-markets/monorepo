export const AVALANCHE_MAINNET = {
  id: 43114,
  name: "Avalanche",
  nativeCurrency: { name: "AVAX", symbol: "AVAX", decimals: 18 },
  rpcUrls: {
    default: "https://api.avax.network/ext/bc/C/rpc",
  },
  blockExplorers: {
    default: "https://snowtrace.io",
  },
} as const;

export const AVALANCHE_FUJI = {
  id: 43113,
  name: "Avalanche Fuji",
  nativeCurrency: { name: "AVAX", symbol: "AVAX", decimals: 18 },
  rpcUrls: {
    default: "https://api.avax-test.network/ext/bc/C/rpc",
  },
  blockExplorers: {
    default: "https://testnet.snowtrace.io",
  },
} as const;

import type { Caliber } from "../types/index";

type CaliberAddresses = {
  market: `0x${string}`;
  token: `0x${string}`;
};

type NetworkAddresses = {
  manager: `0x${string}`;
  factory: `0x${string}`;
  usdc: `0x${string}`;
  calibers: Record<Caliber, CaliberAddresses>;
};

export const CONTRACT_ADDRESSES: {
  fuji: NetworkAddresses;
  mainnet: NetworkAddresses;
} = {
  fuji: {
    manager: "0xB275e81aDc8c0fFd8cb0d2c2142AcDBeb4A7B82c",
    factory: "0xAbbf3fb509DA4FE46Ee65A3BE3A1BbE84E2Aa3e4",
    usdc: "0xE073D724c03346202C5311aDEbca530aaB72299e",
    calibers: {
      "9MM": {
        market: "0x0bff015EEA8C18674AB8d9B3f995E25359Da8Ab1",
        token: "0x1f7999bc88090c7B397D4630442991a4E27Fb98F",
      },
      "556": {
        market: "0x1094166b993c0D92912D298E6AD9E5170977e12C",
        token: "0x11afaDEd9C8Fa5D19377251232Af30BeB57b04b6",
      },
      "22LR": {
        market: "0xc5DC672b3A72c1c6f78dBaF98d7A118bBCe18a79",
        token: "0xac6A4F943845e7Fad9d7421756DAd1aceb57f4c7",
      },
      "308": {
        market: "0x4b4DeBfCCCB60250007dB708f670CE74b62387AE",
        token: "0x6Ea392b168BEFbC33776068c18ad8F4313cDdCeE",
      },
    },
  },
  mainnet: {
    manager: "0x0000000000000000000000000000000000000000",
    factory: "0x0000000000000000000000000000000000000000",
    usdc: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E",
    calibers: {
      "9MM": {
        market: "0x0000000000000000000000000000000000000000",
        token: "0x0000000000000000000000000000000000000000",
      },
      "556": {
        market: "0x0000000000000000000000000000000000000000",
        token: "0x0000000000000000000000000000000000000000",
      },
      "22LR": {
        market: "0x0000000000000000000000000000000000000000",
        token: "0x0000000000000000000000000000000000000000",
      },
      "308": {
        market: "0x0000000000000000000000000000000000000000",
        token: "0x0000000000000000000000000000000000000000",
      },
    },
  },
} as const;

/**
 * Block numbers where the protocol contracts were first deployed.
 * Used as the starting point for event indexing on fresh databases
 * to avoid scanning millions of empty blocks.
 */
export const DEPLOYMENT_BLOCKS = {
  fuji: BigInt(52220913),
  mainnet: BigInt(0), // Not yet deployed
} as const;

/* ────────────── Active Network Resolver ────────────── */

export type NetworkId = "fuji" | "mainnet";

const CHAIN_CONFIGS = {
  fuji: AVALANCHE_FUJI,
  mainnet: AVALANCHE_MAINNET,
} as const;

/**
 * Returns the full network config for the given network ID.
 * Every app should call this once at startup with the value of
 * their CHAIN env var, then re-export the results.
 */
export function getNetworkConfig(network: NetworkId) {
  return {
    networkId: network,
    chain: CHAIN_CONFIGS[network],
    contracts: CONTRACT_ADDRESSES[network],
    deploymentBlock: DEPLOYMENT_BLOCKS[network],
    isTestnet: network === "fuji",
    explorerUrl: CHAIN_CONFIGS[network].blockExplorers.default,
  };
}

export type NetworkConfig = ReturnType<typeof getNetworkConfig>;
