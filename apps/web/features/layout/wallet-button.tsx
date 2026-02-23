"use client";

import { useState } from "react";
import { Copy, ExternalLink, LogOut, Wallet } from "lucide-react";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useAuth } from "@/contexts/auth-context";
import { useTokenBalances } from "@/hooks/use-token-balances";
import { truncateAddress } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { formatUnits } from "viem";
import { AVALANCHE_FUJI } from "@ammo-exchange/shared";

function formatUsdc(raw: bigint): string {
  return Number(formatUnits(raw, 6)).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function WalletButton() {
  const [showDisconnectDialog, setShowDisconnectDialog] = useState(false);
  const { openConnectModal } = useConnectModal();

  const {
    address,
    isConnected,
    isReconnecting,
    isWrongNetwork,
    disconnect,
    switchToFuji,
    isSwitching,
    isSignedIn,
    signOut,
  } = useAuth();
  const { usdc } = useTokenBalances();

  // During reconnection, render disconnected state to match SSR (prevents hydration mismatch)
  if (isReconnecting || !isConnected) {
    return (
      <button
        type="button"
        className="flex items-center gap-2 rounded-lg border border-border-hover bg-transparent px-4 py-2 text-sm font-medium text-text-primary transition-all duration-150 hover:border-brass-border hover:bg-ax-tertiary"
        onClick={openConnectModal}
        aria-label="Connect wallet"
      >
        <Wallet size={16} />
        <span className="hidden sm:inline">Connect Wallet</span>
      </button>
    );
  }

  // Wrong network
  if (isWrongNetwork) {
    return (
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="flex items-center gap-2 rounded-lg border border-ammo-amber bg-transparent px-4 py-2 text-sm font-medium text-ammo-amber transition-all duration-150 hover:bg-ammo-amber/10"
          onClick={switchToFuji}
          disabled={isSwitching}
          aria-label={
            isSwitching ? "Switching network" : "Switch to Fuji network"
          }
        >
          <Wallet size={16} />
          <span className="hidden sm:inline">
            {isSwitching ? "Switching..." : "Switch to Fuji"}
          </span>
        </button>
        <button
          type="button"
          className="flex items-center gap-2 rounded-lg border border-border-hover bg-transparent px-3 py-2 text-sm font-medium text-text-secondary transition-all duration-150 hover:border-red-500/50 hover:text-red-400"
          onClick={() => disconnect()}
          aria-label="Disconnect wallet"
        >
          <LogOut size={16} />
        </button>
      </div>
    );
  }

  // Connected but not signed in — prompt handled by RainbowKit adapter
  if (!isSignedIn) {
    return (
      <button
        type="button"
        className="flex items-center gap-2 rounded-lg border border-brass-border bg-transparent px-4 py-2 text-sm font-medium text-brass transition-all duration-150 hover:bg-brass-muted"
        onClick={openConnectModal}
        aria-label="Sign in with wallet"
      >
        <Wallet size={16} />
        <span className="hidden sm:inline">Sign In</span>
      </button>
    );
  }

  // Connected, correct network, and signed in
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-150"
            style={{
              backgroundColor: "var(--bg-secondary)",
              border: "1px solid var(--border-hover)",
              color: "var(--text-primary)",
            }}
            aria-label="Wallet menu"
          >
            <span
              className="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold"
              style={{
                backgroundColor: "var(--brass-muted)",
                color: "var(--brass)",
              }}
            >
              {address ? address[2]?.toUpperCase() : "?"}
            </span>
            <span className="font-mono text-xs">
              {address ? truncateAddress(address) : ""}
            </span>
            {usdc !== undefined && (
              <span
                className="hidden text-xs sm:inline"
                style={{ color: "var(--text-muted)" }}
              >
                {formatUsdc(usdc)} USDC
              </span>
            )}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={() => {
              if (address) {
                navigator.clipboard.writeText(address);
              }
            }}
          >
            <Copy size={16} />
            Copy Address
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              window.open(
                `${AVALANCHE_FUJI.blockExplorers.default}/address/${address}`,
                "_blank",
              );
            }}
          >
            <ExternalLink size={16} />
            View on Explorer
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onClick={() => setShowDisconnectDialog(true)}
          >
            <LogOut size={16} />
            Disconnect
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog
        open={showDisconnectDialog}
        onOpenChange={setShowDisconnectDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Disconnect Wallet?</AlertDialogTitle>
            <AlertDialogDescription>
              This will sign you out and disconnect your wallet. You&apos;ll
              need to reconnect and sign in again to continue.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                signOut();
                disconnect();
              }}
            >
              Disconnect
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
