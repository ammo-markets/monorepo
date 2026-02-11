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
    manager: "0x5dB292eade6BEa9D710C54C5504d8400639dec25",
    factory: "0xA802FE22E85461131Ca94C8bB85C1a36815aDe8D",
    usdc: "0x270D06E53f943C6Dd69a2e51FEB07c420B3Ab146",
    calibers: {
      "9MM": {
        market: "0x5aFFA4CfF4920627C2061D211C44B1100E3a8Fe1",
        token: "0x6a9753ffDbF5036991294Ce439a042dF834aCa62",
      },
      "556": {
        market: "0xe082bDd7139eF03E8db1B9155f53aB60E5EF7e03",
        token: "0x46951A49a4d73C70ba9A12bF82f4c4686a8b60E8",
      },
      "22LR": {
        market: "0xF1B4a75C77b8a9bFB52F9B800C3f26547eDD442b",
        token: "0xFE10A09895Ab1AF20E5613c2e0715Aac56837ff5",
      },
      "308": {
        market: "0x326b5AAc6C97918716264E307923c6D2c95cA440",
        token: "0xa8685b36384b13d823bDeF75B96Ee83B6BF647A7",
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
  fuji: 51699730n,
  mainnet: 0n, // Not yet deployed
} as const;
