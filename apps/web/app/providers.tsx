"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import {
  MutationCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { WagmiProvider } from "wagmi";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { wagmiConfig } from "@/lib/wagmi";
import { activeChain } from "@/lib/chain";
import { ammoTheme } from "@/lib/rainbow-theme";
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
    mutationCache: new MutationCache({
      onError: (error, _variables, _context, mutation) => {
        // Skip if the mutation handles its own errors
        if (mutation.options.onError) return;
        toast.error(error.message || "Something went wrong");
      },
    }),
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

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={ammoTheme} initialChain={activeChain}>
          <AuthProvider>{children}</AuthProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
