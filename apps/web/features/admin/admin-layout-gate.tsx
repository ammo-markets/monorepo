"use client";

import type { ReactNode } from "react";
import { Shield, AlertTriangle, Loader2, Fingerprint } from "lucide-react";
import { useKeeperCheck } from "@/hooks/use-keeper-check";
import { useAuth } from "@/contexts/auth-context";
import { WalletButton } from "@/features/layout";

export function AdminLayoutGate({ children }: { children: ReactNode }) {
  const { isKeeper, isLoading, isConnected, isReconnecting } = useKeeperCheck();
  const { isSignedIn, isAuthLoading, signIn } = useAuth();

  // Loading or reconnecting state
  if (isReconnecting || (isLoading && isConnected) || isAuthLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div
          className="flex flex-col items-center gap-4"
          style={{ color: "var(--text-secondary)" }}
        >
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-sm">Checking access...</p>
        </div>
      </div>
    );
  }

  // Not connected
  if (!isConnected) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div
          className="flex max-w-md flex-col items-center gap-6 rounded-xl border p-8 text-center"
          style={{
            borderColor: "var(--border-default)",
            backgroundColor: "var(--bg-secondary)",
          }}
        >
          <div
            className="flex h-14 w-14 items-center justify-center rounded-full"
            style={{ backgroundColor: "var(--bg-tertiary)" }}
          >
            <Shield
              className="h-7 w-7"
              style={{ color: "var(--text-secondary)" }}
            />
          </div>
          <div>
            <h2
              className="text-xl font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              Connect Wallet
            </h2>
            <p
              className="mt-2 text-sm"
              style={{ color: "var(--text-secondary)" }}
            >
              Connect a keeper wallet to access the admin dashboard.
            </p>
          </div>
          <WalletButton />
        </div>
      </div>
    );
  }

  // Not a keeper
  if (!isKeeper) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div
          className="flex max-w-md flex-col items-center gap-6 rounded-xl border p-8 text-center"
          style={{
            borderColor: "var(--border-default)",
            backgroundColor: "var(--bg-secondary)",
          }}
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-900/30">
            <AlertTriangle className="h-7 w-7 text-red-400" />
          </div>
          <div>
            <h2
              className="text-xl font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              Access Denied
            </h2>
            <p
              className="mt-2 text-sm"
              style={{ color: "var(--text-secondary)" }}
            >
              Your wallet is not authorized as a keeper. Only keeper wallets can
              access the admin dashboard.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Keeper but not signed in — prompt SIWE
  if (!isSignedIn) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div
          className="flex max-w-md flex-col items-center gap-6 rounded-xl border p-8 text-center"
          style={{
            borderColor: "var(--border-default)",
            backgroundColor: "var(--bg-secondary)",
          }}
        >
          <div
            className="flex h-14 w-14 items-center justify-center rounded-full"
            style={{ backgroundColor: "rgba(184, 156, 78, 0.12)" }}
          >
            <Fingerprint
              className="h-7 w-7"
              style={{ color: "var(--brass)" }}
            />
          </div>
          <div>
            <h2
              className="text-xl font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              Verify Identity
            </h2>
            <p
              className="mt-2 text-sm"
              style={{ color: "var(--text-secondary)" }}
            >
              Sign a message to prove you own this wallet. This is required for
              admin operations.
            </p>
          </div>
          <button
            type="button"
            onClick={() => signIn()}
            className="rounded-lg px-6 py-2.5 text-sm font-semibold transition-colors hover:bg-brass-hover"
            style={{
              backgroundColor: "var(--brass)",
              color: "var(--bg-primary)",
            }}
          >
            Sign Message
          </button>
        </div>
      </div>
    );
  }

  // Authorized keeper with SIWE session
  return <>{children}</>;
}
