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
    manager: "0x3C018b0e99AFAF5A21a282A525266Bb4827224fC",
    factory: "0x3073558D5cb2f7cab18f09d343ad8f6E90312FeD",
    usdc: "0xC71865F5A4D87dF4c6f7DEEB5a66819df8863aa3",
    calibers: {
      "9MM": {
        market: "0x17Cfd46d792f200693CCEaB8576617566396DC2c",
        token: "0xdf57f8F78Cc519e083C0C0B7f05Ff35eB58dd52B",
      },
      "556": {
        market: "0x5769846911A5A80536a1AF6E3Ea6CA52B44A2663",
        token: "0xf60f4836409E64CFBa8cF0DAEc0Ce0093721B298",
      },
      "22LR": {
        market: "0xD5c83631aEa3590d2273bA9648954Ce986223840",
        token: "0x37e1a3a438BC5D31B33397d95446fe104a409b5E",
      },
      "308": {
        market: "0x8f765405Bc17Ab8045cfEB4f48C8762c61CD2705",
        token: "0xb9e30B8B5ee33e9Ac1E71aE7d7d445068B5A384b",
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
  fuji: BigInt(52030756),
  mainnet: BigInt(0), // Not yet deployed
} as const;
