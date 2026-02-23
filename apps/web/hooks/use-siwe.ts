"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAccount } from "wagmi";
import type { AuthenticationStatus } from "@rainbow-me/rainbowkit";

interface SiweState {
  isSignedIn: boolean;
  isSessionLoading: boolean;
  address: string | null;
}

export function useSiwe(
  onAuthStatusChange?: (status: AuthenticationStatus) => void,
) {
  const [state, setState] = useState<SiweState>({
    isSignedIn: false,
    isSessionLoading: true,
    address: null,
  });

  const { address: walletAddress } = useAccount();
  const prevAddressRef = useRef<string | undefined>(walletAddress);

  const checkSession = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/session");
      const data = await res.json();

      if (data.address) {
        setState({
          isSignedIn: true,
          isSessionLoading: false,
          address: data.address,
        });
        onAuthStatusChange?.("authenticated");
      } else {
        setState({
          isSignedIn: false,
          isSessionLoading: false,
          address: null,
        });
        onAuthStatusChange?.("unauthenticated");
      }
    } catch {
      setState({
        isSignedIn: false,
        isSessionLoading: false,
        address: null,
      });
      onAuthStatusChange?.("unauthenticated");
    }
  }, [onAuthStatusChange]);

  const signOut = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // Ignore errors — clear client state regardless
    }
    setState({
      isSignedIn: false,
      isSessionLoading: false,
      address: null,
    });
    onAuthStatusChange?.("unauthenticated");
  }, [onAuthStatusChange]);

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
    isSessionLoading: state.isSessionLoading,
    address: state.address,
    signOut,
    checkSession,
  };
}
