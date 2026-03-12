"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
} from "react";
import type { ReactNode } from "react";
import { useWallet } from "@/hooks/use-wallet";
import { useSignIn } from "@/hooks/use-sign-in";
import { useSession } from "@/hooks/use-session";
import { useLogout } from "@/hooks/use-logout";

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
  const session = useSession();
  const logout = useLogout();

  const isSignedIn = !!session.data?.address;
  const prevAddressRef = useRef<`0x${string}` | undefined>(wallet.address);

  // Invalidate session when wallet address changes
  useEffect(() => {
    const prev = prevAddressRef.current;
    prevAddressRef.current = wallet.address;

    if (isSignedIn && prev !== undefined && wallet.address !== prev) {
      logout.mutate();
    }
  }, [wallet.address, isSignedIn, logout]);

  const signIn = useCallback(async (): Promise<boolean> => {
    return doSignIn();
  }, [doSignIn]);

  const signOut = useCallback(async () => {
    await logout.mutateAsync();
  }, [logout]);

  const value: AuthContextValue = {
    address: wallet.address,
    isConnected: wallet.isConnected,
    isReconnecting: wallet.isReconnecting,
    isWrongNetwork: wallet.isWrongNetwork,
    disconnect: wallet.disconnect,
    switchNetwork: wallet.switchNetwork,
    isSwitching: wallet.isSwitching,
    isSignedIn,
    isAuthLoading: session.isLoading || isSignInPending,
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
