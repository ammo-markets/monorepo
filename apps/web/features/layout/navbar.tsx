"use client";

import { useMemo, useState } from "react";
import { Menu, X } from "lucide-react";
import { AmmoLogo } from "./logo";
import { WalletButton } from "./wallet-button";
import { useWallet } from "@/hooks/use-wallet";
import { useKeeperCheck } from "@/hooks/use-keeper-check";
import { useSiwe } from "@/hooks/use-siwe";

const navLinks = [
  { label: "Market", href: "/market" },
  { label: "Mint", href: "/trade?tab=mint" },
  { label: "Redeem", href: "/trade?tab=redeem" },
  { label: "Portfolio", href: "/portfolio" },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isConnected, isWrongNetwork, isReconnecting } = useWallet();
  const { isKeeper } = useKeeperCheck();
  const { isSignedIn } = useSiwe();

  const allLinks = useMemo(() => {
    const links = [...navLinks];
    if (isSignedIn) {
      links.push({ label: "Profile", href: "/profile" });
    }
    if (isKeeper) {
      links.push({ label: "Admin", href: "/admin" });
    }
    return links;
  }, [isSignedIn, isKeeper]);

  // Network badge label and status dot color
  const networkLabel = "Avalanche Fuji";
  const dotColor = isConnected && !isReconnecting && isWrongNetwork ? "var(--amber)" : "var(--green)";

  return (
    <header
      className="sticky top-0 z-50 w-full backdrop-blur-xl border-b border-border-default"
      style={{
        backgroundColor: "rgba(10, 10, 15, 0.85)",
      }}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-12">
        {/* Mobile hamburger */}
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-lg lg:hidden"
          style={{ color: "var(--text-secondary)" }}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        {/* Logo */}
        <div className="shrink-0">
          <AmmoLogo />
        </div>

        {/* Desktop nav links */}
        <div className="hidden items-center gap-1 lg:flex">
          {allLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="rounded-lg px-4 py-2 text-sm font-medium text-text-secondary transition-colors duration-150 hover:bg-ax-tertiary hover:text-text-primary"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Right side: network badge + wallet */}
        <div className="flex items-center gap-3">
          {/* Network badge -- hidden on very small screens */}
          <div
            className="hidden items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium sm:flex"
            style={{
              backgroundColor: "var(--bg-secondary)",
              border: "1px solid var(--border-default)",
              color: "var(--text-secondary)",
            }}
          >
            {/* Avalanche logo simplified */}
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M7 1L13 12H1L7 1Z" fill="#E84142" />
            </svg>
            <span>{networkLabel}</span>
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: dotColor }} />
          </div>

          {/* Wallet button */}
          <WalletButton />
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          className="border-t lg:hidden"
          style={{
            backgroundColor: "var(--bg-primary)",
            borderColor: "var(--border-default)",
          }}
        >
          <div className="flex flex-col gap-1 px-4 py-3">
            {allLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="rounded-lg px-4 py-3 text-sm font-medium transition-colors duration-150"
                style={{ color: "var(--text-secondary)" }}
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </a>
            ))}
            {/* Mobile network badge */}
            <div
              className="mt-2 flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs"
              style={{
                backgroundColor: "var(--bg-secondary)",
                color: "var(--text-muted)",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M7 1L13 12H1L7 1Z" fill="#E84142" />
              </svg>
              <span>{networkLabel}</span>
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: dotColor }} />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
