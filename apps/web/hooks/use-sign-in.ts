"use client";

import { useCallback, useState } from "react";
import { useAccount, useSignMessage } from "wagmi";
import { SiweMessage } from "siwe";
import { chainId } from "@/lib/chain";

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
  const [isPending, setIsPending] = useState(false);

  const signIn = useCallback(async (): Promise<boolean> => {
    if (!address) return false;

    setIsPending(true);
    try {
      // 1. Get nonce from server
      const nonceRes = await fetch("/api/auth/nonce");
      const { nonce } = await nonceRes.json();

      // 2. Build SIWE message
      const message = new SiweMessage({
        domain: window.location.host,
        address,
        statement: "Sign in to Ammo Exchange",
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

      return verifyRes.ok;
    } catch {
      // User rejected signature or network error
      return false;
    } finally {
      setIsPending(false);
    }
  }, [address, signMessageAsync]);

  return { signIn, isPending };
}
