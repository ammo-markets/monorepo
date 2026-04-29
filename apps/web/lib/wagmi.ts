import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { avalanche, avalancheFuji } from "wagmi/chains";
import { http, createStorage, cookieStorage } from "wagmi";
import { activeChain } from "@/lib/chain";
import { env } from "@/lib/env";

export const wagmiConfig = getDefaultConfig({
  appName: "Ammo Markets",
  projectId: env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
  chains: [
    activeChain,
    ...(activeChain.id === avalancheFuji.id ? [avalanche] : [avalancheFuji]),
  ],
  transports: {
    [avalanche.id]: http(),
    [avalancheFuji.id]: http(),
  },
  ssr: true,
  storage: createStorage({ storage: cookieStorage }),
});
