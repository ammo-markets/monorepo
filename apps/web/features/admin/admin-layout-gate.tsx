"use client";

import type { ReactNode } from "react";
import { Shield, AlertTriangle, Loader2 } from "lucide-react";
import { useKeeperCheck } from "@/hooks/use-keeper-check";
import { WalletButton } from "@/features/layout";

export function AdminLayoutGate({ children }: { children: ReactNode }) {
  const { isKeeper, isLoading, isConnected } = useKeeperCheck();

  // Loading state
  if (isLoading && isConnected) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-zinc-400">
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
        <div className="flex max-w-md flex-col items-center gap-6 rounded-xl border border-zinc-800 bg-zinc-900 p-8 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-zinc-800">
            <Shield className="h-7 w-7 text-zinc-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-zinc-100">
              Connect Wallet
            </h2>
            <p className="mt-2 text-sm text-zinc-400">
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
        <div className="flex max-w-md flex-col items-center gap-6 rounded-xl border border-zinc-800 bg-zinc-900 p-8 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-900/30">
            <AlertTriangle className="h-7 w-7 text-red-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-zinc-100">
              Access Denied
            </h2>
            <p className="mt-2 text-sm text-zinc-400">
              Your wallet is not authorized as a keeper. Only keeper wallets can
              access the admin dashboard.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Authorized keeper
  return <>{children}</>;
}
