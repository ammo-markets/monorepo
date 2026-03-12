"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";
import { useWallet } from "@/hooks/use-wallet";
import { useSignIn } from "@/hooks/use-sign-in";

interface AuthContextValue {
  address: `0x${string}` | undefined;
  isConnected: boolean;
  isReconnecting: boolean;
  isWrongNetwork: boolean;
  disconnect: () => void;
  switchNetwork: () => void;
  isSwitching: boolean;
  /** Whether the user has a valid SIWE session */
  isSignedIn: boolean;
  /** Whether a session check or sign-in is in progress */
  isAuthLoading: boolean;
  /** Trigger SIWE sign-in. Returns true on success. */
  signIn: () => Promise<boolean>;
  /** Sign out and destroy the SIWE session */
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const wallet = useWallet();
  const { signIn: doSignIn, isPending: isSignInPending } = useSignIn();

  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isSessionLoading, setIsSessionLoading] = useState(true);
  const prevAddressRef = useRef<`0x${string}` | undefined>(wallet.address);

  // Check for existing session on mount
  useEffect(() => {
    let cancelled = false;
    async function check() {
      try {
        const res = await fetch("/api/auth/session");
        const data = await res.json();
        if (!cancelled) setIsSignedIn(!!data.address);
      } catch {
        if (!cancelled) setIsSignedIn(false);
      } finally {
        if (!cancelled) setIsSessionLoading(false);
      }
    }
    check();
    return () => {
      cancelled = true;
    };
  }, []);

  // Invalidate session when wallet address changes
  useEffect(() => {
    const prev = prevAddressRef.current;
    prevAddressRef.current = wallet.address;

    if (isSignedIn && prev !== undefined && wallet.address !== prev) {
      setIsSignedIn(false);
      fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    }
  }, [wallet.address, isSignedIn]);

  const signIn = useCallback(async (): Promise<boolean> => {
    const ok = await doSignIn();
    setIsSignedIn(ok);
    return ok;
  }, [doSignIn]);

  const signOut = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // Clear client state regardless
    }
    setIsSignedIn(false);
  }, []);

  const value: AuthContextValue = {
    address: wallet.address,
    isConnected: wallet.isConnected,
    isReconnecting: wallet.isReconnecting,
    isWrongNetwork: wallet.isWrongNetwork,
    disconnect: wallet.disconnect,
    switchNetwork: wallet.switchNetwork,
    isSwitching: wallet.isSwitching,
    isSignedIn,
    isAuthLoading: isSessionLoading || isSignInPending,
    signIn,
    signOut,
  };

  return <AuthContext value={value}>{children}</AuthContext>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
