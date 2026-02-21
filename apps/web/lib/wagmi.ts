import { http, createConfig } from "wagmi";
import type { Config } from "wagmi";
import { avalanche, avalancheFuji } from "wagmi/chains";
import { injected, coinbaseWallet } from "wagmi/connectors";

export const wagmiConfig: Config = createConfig({
  chains: [avalanche, avalancheFuji],
  connectors: [
    injected(),
    coinbaseWallet({ appName: "Ammo Exchange" }),
  ],
  transports: {
    [avalanche.id]: http(),
    [avalancheFuji.id]: http(),
  },
  ssr: true,
});
