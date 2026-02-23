import type React from "react";
import { createAuthenticationAdapter } from "@rainbow-me/rainbowkit";
import type { AuthenticationConfig } from "@rainbow-me/rainbowkit";
import { SiweMessage } from "siwe";

export function createSiweAdapter(
  checkSessionRef: React.RefObject<(() => void) | null>,
): AuthenticationConfig<string>["adapter"] {
  return createAuthenticationAdapter({
    getNonce: async () => {
      const res = await fetch("/api/auth/nonce");
      const { nonce } = await res.json();
      return nonce;
    },

    createMessage: ({ nonce, address, chainId }) => {
      return new SiweMessage({
        domain: window.location.host,
        address,
        statement: "Sign in to Ammo Exchange",
        uri: window.location.origin,
        version: "1",
        chainId,
        nonce,
      }).prepareMessage();
    },

    verify: async ({ message, signature }) => {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, signature }),
      });

      if (res.ok) {
        checkSessionRef.current?.();
        return true;
      }
      return false;
    },

    signOut: async () => {
      await fetch("/api/auth/logout", { method: "POST" });
      checkSessionRef.current?.();
    },
  });
}
