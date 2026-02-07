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

/** Placeholder addresses — replace after deployment */
export const CONTRACT_ADDRESSES = {
  mainnet: {
    ammoToken9MM: "0x0000000000000000000000000000000000000000" as const,
    ammoToken556: "0x0000000000000000000000000000000000000000" as const,
    ammoToken22LR: "0x0000000000000000000000000000000000000000" as const,
    ammoToken308: "0x0000000000000000000000000000000000000000" as const,
    usdc: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E" as const,
  },
  fuji: {
    ammoToken9MM: "0x0000000000000000000000000000000000000000" as const,
    ammoToken556: "0x0000000000000000000000000000000000000000" as const,
    ammoToken22LR: "0x0000000000000000000000000000000000000000" as const,
    ammoToken308: "0x0000000000000000000000000000000000000000" as const,
    usdc: "0x0000000000000000000000000000000000000000" as const,
  },
} as const;
