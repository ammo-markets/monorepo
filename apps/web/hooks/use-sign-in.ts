"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAccount, useSignMessage } from "wagmi";
import { SiweMessage } from "siwe";
import { chainId } from "@/lib/chain";
import { queryKeys } from "@/lib/query-keys";

/**
 * Imperative SIWE sign-in hook.
 *
 * Unlike the old RainbowKitAuthenticationProvider flow, this does NOT
 * auto-prompt on wallet connect. Instead, callers invoke `signIn()` when
 * authentication is actually needed (admin gate, shipping save, etc.).
 */
export function useSignIn() {
  const { address } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      if (!address) throw new Error("No wallet connected");

      // 1. Get nonce from server
      const nonceRes = await fetch("/api/auth/nonce");
      const { nonce } = await nonceRes.json();

      // 2. Build SIWE message
      const message = new SiweMessage({
        domain: window.location.host,
        address,
        statement: "Sign in to Ammo Markets",
        uri: window.location.origin,
        version: "1",
        chainId,
        nonce,
      }).prepareMessage();

      // 3. Prompt wallet signature
      const signature = await signMessageAsync({ message });

      // 4. Verify on server — creates iron-session
      const verifyRes = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, signature }),
      });

      if (!verifyRes.ok) throw new Error("Verification failed");

      return { address, chainId };
    },
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.auth.session, {
        address: data.address,
      });
    },
  });

  // Preserve the `signIn: () => Promise<boolean>` API for consumers
  const signIn = async (): Promise<boolean> => {
    try {
      await mutation.mutateAsync();
      return true;
    } catch {
      return false;
    }
  };

  return { signIn, isPending: mutation.isPending };
}
