"use client";

import { useState } from "react";
import { Menu, X, Wallet } from "lucide-react";
import { AmmoLogo } from "./logo";

const navLinks = [
  { label: "Market", href: "/market" },
  { label: "Mint", href: "/mint" },
  { label: "Redeem", href: "/redeem" },
  { label: "Portfolio", href: "/portfolio" },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [walletConnected] = useState(false);

  return (
    <header
      className="sticky top-0 z-50 w-full backdrop-blur-xl"
      style={{
        backgroundColor: "rgba(10, 10, 15, 0.85)",
        borderBottom: "1px solid var(--border-default)",
      }}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-8">
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
        <div className="flex-shrink-0">
          <AmmoLogo />
        </div>

        {/* Desktop nav links */}
        <div className="hidden items-center gap-1 lg:flex">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-150"
              style={{ color: "var(--text-secondary)" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "var(--text-primary)";
                e.currentTarget.style.backgroundColor = "var(--bg-tertiary)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "var(--text-secondary)";
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Right side: network badge + wallet */}
        <div className="flex items-center gap-3">
          {/* Network badge — hidden on very small screens */}
          <div
            className="hidden items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium sm:flex"
            style={{
              backgroundColor: "var(--bg-secondary)",
              border: "1px solid var(--border-default)",
              color: "var(--text-secondary)",
            }}
          >
            {/* Avalanche logo simplified */}
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              aria-hidden="true"
            >
              <path d="M7 1L13 12H1L7 1Z" fill="#E84142" />
            </svg>
            <span>Avalanche</span>
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: "var(--green)" }}
            />
          </div>

          {/* Wallet button */}
          {walletConnected ? (
            <button
              type="button"
              className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-150"
              style={{
                backgroundColor: "var(--bg-secondary)",
                border: "1px solid var(--border-hover)",
                color: "var(--text-primary)",
              }}
            >
              {/* Identicon placeholder */}
              <span
                className="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold"
                style={{
                  backgroundColor: "var(--brass-muted)",
                  color: "var(--brass)",
                }}
              >
                A
              </span>
              <span className="font-mono text-xs">0x1a2...f4c8</span>
            </button>
          ) : (
            <button
              type="button"
              className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-150"
              style={{
                backgroundColor: "transparent",
                border: "1px solid var(--border-hover)",
                color: "var(--text-primary)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "var(--bg-tertiary)";
                e.currentTarget.style.borderColor = "var(--brass-border)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.borderColor = "var(--border-hover)";
              }}
            >
              <Wallet size={16} />
              <span className="hidden sm:inline">Connect Wallet</span>
            </button>
          )}
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
          <div className="flex flex-col px-4 py-3 gap-1">
            {navLinks.map((link) => (
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
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                aria-hidden="true"
              >
                <path d="M7 1L13 12H1L7 1Z" fill="#E84142" />
              </svg>
              <span>Avalanche Mainnet</span>
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: "var(--green)" }}
              />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
