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
  oracle: `0x${string}`;
  calibers: Record<Caliber, CaliberAddresses>;
};

const ZERO = "0x0000000000000000000000000000000000000000" as const;

export const CONTRACT_ADDRESSES: {
  fuji: NetworkAddresses;
  mainnet: NetworkAddresses;
} = {
  fuji: {
    manager: "0x74994498D05358502C56e491A1fd68bdC3F5177c",
    factory: "0xAB76E1c1ae81aB94B3D3824fC905189287143D5e",
    usdc: "0x313f01B900150446036F325B881993eE18c40375",
    oracle: "0x4C39b892B228E3A4Fdf971cDDB6De50b1de0A144",
    calibers: {
      "9MM_PRACTICE": {
        market: "0xC2a1D88A13539eBd62C481F7Abe5366A6c780670",
        token: "0xfed6e25c7e1d67CC38b57bD04997922fa2474E45",
      },
      "9MM_SELF_DEFENSE": {
        market: "0xD33B1c993d7958EaF5bf81Ec88ec6D5Ae757adf4",
        token: "0x810f64aa6Ca1e1030Ca1b859FFdf41Cf509b2183",
      },
      "556_SELF_DEFENSE": {
        market: "0x0A461cf5C3c9437FDE6416BA45f50C0236aef04d",
        token: "0xD7DCc019463173967dbC5871Eb8a6c2134FC6b23",
      },
      "556_NATO_PRACTICE": {
        market: "0x6855E5F296b24e9FA49524bf59A4326a952A8a82",
        token: "0xbca964959f8739b10b2981a6dA35EeF7845FA73b",
      },
    },
  },
  mainnet: {
    manager: ZERO,
    factory: ZERO,
    usdc: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E",
    oracle: ZERO,
    calibers: {
      "9MM_PRACTICE": { market: ZERO, token: ZERO },
      "9MM_SELF_DEFENSE": { market: ZERO, token: ZERO },
      "556_SELF_DEFENSE": { market: ZERO, token: ZERO },
      "556_NATO_PRACTICE": { market: ZERO, token: ZERO },
    },
  },
} as const;

/**
 * Block numbers where the protocol contracts were first deployed.
 * Used as the starting point for event indexing on fresh databases
 * to avoid scanning millions of empty blocks.
 */
export const DEPLOYMENT_BLOCKS = {
  fuji: BigInt(52346218),
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
