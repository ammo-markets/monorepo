import { http, createConfig } from "wagmi";
import { avalanche, avalancheFuji } from "wagmi/chains";

export const wagmiConfig = createConfig({
  chains: [avalanche, avalancheFuji],
  transports: {
    [avalanche.id]: http(),
    [avalancheFuji.id]: http(),
  },
  ssr: true,
});
