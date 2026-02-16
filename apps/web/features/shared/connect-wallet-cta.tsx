"use client";

import { Lock, Wallet } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";

/* ── Full-page centered card variant ── */

interface ConnectWalletCTAProps {
  title?: string;
  description?: string;
}

export function ConnectWalletCTA({
  title = "Connect your wallet",
  description = "Link your wallet to access this feature.",
}: ConnectWalletCTAProps) {
  const { connect } = useAuth();

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div
        className="flex max-w-md flex-col items-center rounded-2xl px-8 py-16 text-center"
        style={{
          backgroundColor: "var(--bg-secondary)",
          border: "1px solid var(--border-default)",
        }}
      >
        <div
          className="mb-6 flex h-16 w-16 items-center justify-center rounded-full"
          style={{ backgroundColor: "var(--bg-tertiary)" }}
        >
          <Lock size={28} style={{ color: "var(--text-muted)" }} />
        </div>
        <h2
          className="mb-2 text-lg font-semibold"
          style={{ color: "var(--text-primary)" }}
        >
          {title}
        </h2>
        <p className="mb-8 text-sm" style={{ color: "var(--text-secondary)" }}>
          {description}
        </p>
        <button
          type="button"
          className="inline-flex items-center gap-2.5 rounded-lg bg-brass px-6 py-3 text-sm font-semibold text-ax-primary transition-colors duration-150 hover:bg-brass-hover"
          onClick={connect}
        >
          <Wallet size={18} />
          Connect Wallet
        </button>
      </div>
    </div>
  );
}

/* ── Inline button variant (replaces action CTAs) ── */

interface ConnectWalletInlineProps {
  label?: string;
}

export function ConnectWalletInline({
  label = "Connect Wallet",
}: ConnectWalletInlineProps) {
  const { connect } = useAuth();

  return (
    <button
      type="button"
      className="flex w-full items-center justify-center gap-2 rounded-xl bg-brass py-3.5 text-sm font-semibold text-ax-primary transition-colors duration-150 hover:bg-brass-hover"
      onClick={connect}
    >
      <Wallet size={16} />
      {label}
    </button>
  );
}
