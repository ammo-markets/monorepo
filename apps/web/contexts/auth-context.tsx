"use client";

import { createContext, useContext } from "react";
import type { ReactNode } from "react";
import { useWallet } from "@/hooks/use-wallet";

interface AuthContextValue {
  address: `0x${string}` | undefined;
  isConnected: boolean;
  isReconnecting: boolean;
  isWrongNetwork: boolean;
  disconnect: () => void;
  switchNetwork: () => void;
  isSwitching: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const wallet = useWallet();

  const value: AuthContextValue = {
    address: wallet.address,
    isConnected: wallet.isConnected,
    isReconnecting: wallet.isReconnecting,
    isWrongNetwork: wallet.isWrongNetwork,
    disconnect: wallet.disconnect,
    switchNetwork: wallet.switchNetwork,
    isSwitching: wallet.isSwitching,
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
