"use client";

import { createContext, useContext } from "react";
import type { ReactNode } from "react";
import { useWallet } from "@/hooks/use-wallet";
import { useSiwe } from "@/hooks/use-siwe";

interface AuthContextValue {
  // Wallet state
  address: `0x${string}` | undefined;
  isConnected: boolean;
  isReconnecting: boolean;
  isWrongNetwork: boolean;
  connect: () => void;
  disconnect: () => void;
  switchToFuji: () => void;
  isConnecting: boolean;
  isSwitching: boolean;
  // SIWE state
  isSignedIn: boolean;
  isSessionLoading: boolean;
  isSigningIn: boolean;
  signIn: () => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const wallet = useWallet();
  const siwe = useSiwe();

  const value: AuthContextValue = {
    // Wallet
    address: wallet.address,
    isConnected: wallet.isConnected,
    isReconnecting: wallet.isReconnecting,
    isWrongNetwork: wallet.isWrongNetwork,
    connect: wallet.connect,
    disconnect: wallet.disconnect,
    switchToFuji: wallet.switchToFuji,
    isConnecting: wallet.isConnecting,
    isSwitching: wallet.isSwitching,
    // SIWE
    isSignedIn: siwe.isSignedIn,
    isSessionLoading: siwe.isSessionLoading,
    isSigningIn: siwe.isSigningIn,
    signIn: siwe.signIn,
    signOut: siwe.signOut,
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
