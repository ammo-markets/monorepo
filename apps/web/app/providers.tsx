"use client";

import { useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import {
  RainbowKitAuthenticationProvider,
  RainbowKitProvider,
} from "@rainbow-me/rainbowkit";
import type { AuthenticationStatus } from "@rainbow-me/rainbowkit";
import { avalancheFuji } from "wagmi/chains";
import { wagmiConfig } from "@/lib/wagmi";
import { ammoTheme } from "@/lib/rainbow-theme";
import { createSiweAdapter } from "@/lib/siwe-adapter";
import { AuthProvider } from "@/contexts/auth-context";

import "@rainbow-me/rainbowkit/styles.css";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        retry: 2,
        refetchOnWindowFocus: true,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

function getQueryClient() {
  // Server: always make a new query client
  if (typeof window === "undefined") {
    return makeQueryClient();
  }
  // Browser: reuse singleton to preserve cache across navigations
  if (!browserQueryClient) browserQueryClient = makeQueryClient();
  return browserQueryClient;
}

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(getQueryClient);
  const [authStatus, setAuthStatus] =
    useState<AuthenticationStatus>("unauthenticated");
  const checkSessionRef = useRef<(() => void) | null>(null);

  const siweAdapter = useMemo(
    () => createSiweAdapter(checkSessionRef),
    [],
  );

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitAuthenticationProvider
          adapter={siweAdapter}
          status={authStatus}
        >
          <RainbowKitProvider
            theme={ammoTheme}
            initialChain={avalancheFuji}
          >
            <AuthProvider onAuthStatusChange={setAuthStatus} checkSessionRef={checkSessionRef}>
              {children}
            </AuthProvider>
          </RainbowKitProvider>
        </RainbowKitAuthenticationProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
