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

type ChainlinkAddresses = {
  functionsRouter: `0x${string}`;
  linkToken: `0x${string}`;
};

type NetworkAddresses = {
  manager: `0x${string}`;
  factory: `0x${string}`;
  usdc: `0x${string}`;
  oracle: `0x${string}`;
  priceFunctions: `0x${string}`;
  chainlink: ChainlinkAddresses;
  calibers: Record<Caliber, CaliberAddresses>;
};

const ZERO = "0x0000000000000000000000000000000000000000" as const;

export const CONTRACT_ADDRESSES: {
  fuji: NetworkAddresses;
  mainnet: NetworkAddresses;
} = {
  fuji: {
    manager: "0x3D3DAca6B9A402547DFfaef181e8017cB41175Af",
    factory: "0x62345A84750E0F1DFfa84b13faEaC3567123170b",
    usdc: "0x3A7D061c31eF92b34074F92aB6217b28f7F3DCFC",
    oracle: "0x109f8aBb10a0A4Ec0DBB6A81161dD79150A1E425",
    priceFunctions: "0x3482B32F6B7D1f3a4A6037031282732187b95C37",
    chainlink: {
      functionsRouter: "0xA9d587a00A31A52Ed70D6026794a8FC5E2F5dCb0",
      linkToken: "0x0b9d5D9136855f6FEc3c0993feE6E9CE8a297846",
    },
    calibers: {
      "9MM_PRACTICE": {
        market: "0x2a1a20F7326b10d85Ea77d67B41FBfac285B70E6",
        token: "0x2F0F7EC6F17eC4080C721b40A5617c8838497a21",
      },
      "9MM_SELF_DEFENSE": {
        market: "0xd63dA5E2FD7a9eA4E994973c0D7C0bcA1EAc1ED7",
        token: "0xb929CB94dEA8f83E8529C1fF7A95Cf82b1A5aC71",
      },
      "556_SELF_DEFENSE": {
        market: "0xe1c2b489F0CF1D4056c9d21305e0236a3bf5830F",
        token: "0xc6b70C4Fc5B5e6581D03d46db11604E4340af566",
      },
      "556_NATO_PRACTICE": {
        market: "0xba84fFBf6D5CB6Ced18cf23461B264C34264c659",
        token: "0xa95Fb7045C822c8187325980dB9f0085eF8a1E7c",
      },
    },
  },
  mainnet: {
    manager: ZERO,
    factory: ZERO,
    usdc: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E",
    oracle: ZERO,
    priceFunctions: ZERO,
    chainlink: {
      functionsRouter: ZERO,
      linkToken: ZERO,
    },
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
  fuji: BigInt(52525594),
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
