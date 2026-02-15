"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAccount, useChainId, useSignMessage } from "wagmi";
import { SiweMessage } from "siwe";

interface SiweState {
  isSignedIn: boolean;
  isSigningIn: boolean;
  isSessionLoading: boolean;
  address: string | null;
}

export function useSiwe() {
  const [state, setState] = useState<SiweState>({
    isSignedIn: false,
    isSigningIn: false,
    isSessionLoading: true,
    address: null,
  });

  const { address: walletAddress } = useAccount();
  const chainId = useChainId();
  const { signMessageAsync } = useSignMessage();
  const prevAddressRef = useRef<string | undefined>(walletAddress);

  const checkSession = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/session");
      const data = await res.json();

      if (data.address) {
        setState({
          isSignedIn: true,
          isSigningIn: false,
          isSessionLoading: false,
          address: data.address,
        });
      } else {
        setState({
          isSignedIn: false,
          isSigningIn: false,
          isSessionLoading: false,
          address: null,
        });
      }
    } catch {
      setState({
        isSignedIn: false,
        isSigningIn: false,
        isSessionLoading: false,
        address: null,
      });
    }
  }, []);

  const signIn = useCallback(async () => {
    if (!walletAddress) return;

    setState((prev) => ({ ...prev, isSigningIn: true }));

    try {
      // 1. Get nonce from server
      const nonceRes = await fetch("/api/auth/nonce");
      const { nonce } = await nonceRes.json();

      // 2. Construct SIWE message
      const siweMessage = new SiweMessage({
        domain: window.location.host,
        address: walletAddress,
        statement: "Sign in to Ammo Exchange",
        uri: window.location.origin,
        version: "1",
        chainId,
        nonce,
      });

      // 3. Sign the message
      const message = siweMessage.prepareMessage();
      const signature = await signMessageAsync({ message });

      // 4. Verify with server
      const verifyRes = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, signature }),
      });

      if (verifyRes.ok) {
        const data = await verifyRes.json();
        setState({
          isSignedIn: true,
          isSigningIn: false,
          isSessionLoading: false,
          address: data.address,
        });
      } else {
        setState((prev) => ({ ...prev, isSigningIn: false }));
      }
    } catch {
      setState((prev) => ({ ...prev, isSigningIn: false }));
    }
  }, [walletAddress, chainId, signMessageAsync]);

  const signOut = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // Ignore errors — clear client state regardless
    }
    setState({ isSignedIn: false, isSigningIn: false, isSessionLoading: false, address: null });
  }, []);

  // Restore session from cookie on mount
  useEffect(() => {
    checkSession();
  }, [checkSession]);

  // Invalidate session when wallet address changes
  useEffect(() => {
    const prevAddress = prevAddressRef.current;
    prevAddressRef.current = walletAddress;

    if (
      state.isSignedIn &&
      prevAddress !== undefined &&
      walletAddress !== prevAddress
    ) {
      signOut();
    }
  }, [walletAddress, state.isSignedIn, signOut]);

  return {
    isSignedIn: state.isSignedIn,
    isSigningIn: state.isSigningIn,
    isSessionLoading: state.isSessionLoading,
    address: state.address,
    signIn,
    signOut,
    checkSession,
  };
}
