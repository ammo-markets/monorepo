"use client";

import { createContext, useContext, useEffect } from "react";
import type { ReactNode, RefObject } from "react";
import type { AuthenticationStatus } from "@rainbow-me/rainbowkit";
import { useWallet } from "@/hooks/use-wallet";
import { useSiwe } from "@/hooks/use-siwe";

interface AuthContextValue {
  address: `0x${string}` | undefined;
  isConnected: boolean;
  isReconnecting: boolean;
  isWrongNetwork: boolean;
  disconnect: () => void;
  switchNetwork: () => void;
  isSwitching: boolean;
  isSignedIn: boolean;
  isSessionLoading: boolean;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({
  children,
  onAuthStatusChange,
  checkSessionRef,
}: {
  children: ReactNode;
  onAuthStatusChange: (status: AuthenticationStatus) => void;
  checkSessionRef: RefObject<(() => void) | null>;
}) {
  const wallet = useWallet();
  const siwe = useSiwe(onAuthStatusChange);

  // Wire the ref so the SIWE adapter can trigger a session re-check
  useEffect(() => {
    checkSessionRef.current = siwe.checkSession;
    return () => {
      checkSessionRef.current = null;
    };
  }, [checkSessionRef, siwe.checkSession]);

  const value: AuthContextValue = {
    address: wallet.address,
    isConnected: wallet.isConnected,
    isReconnecting: wallet.isReconnecting,
    isWrongNetwork: wallet.isWrongNetwork,
    disconnect: wallet.disconnect,
    switchNetwork: wallet.switchNetwork,
    isSwitching: wallet.isSwitching,
    isSignedIn: siwe.isSignedIn,
    isSessionLoading: siwe.isSessionLoading,
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
