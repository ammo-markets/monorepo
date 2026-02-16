"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Wallet,
  User,
  Shield,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { AmmoLogo } from "./logo";
import { WalletButton } from "./wallet-button";
import { useWallet } from "@/hooks/use-wallet";
import { useKeeperCheck } from "@/hooks/use-keeper-check";
import { useSiwe } from "@/hooks/use-siwe";

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Trade", href: "/trade", icon: ArrowLeftRight },
  { label: "Portfolio", href: "/portfolio", icon: Wallet },
  { label: "Profile", href: "/profile", icon: User },
];

function isActiveLink(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

export function AppNav() {
  const pathname = usePathname();
  const { isConnected, isWrongNetwork, isReconnecting } = useWallet();
  const { isKeeper } = useKeeperCheck();
  const { isSignedIn } = useSiwe();

  const networkLabel = "Avalanche Fuji";
  const dotColor =
    isConnected && !isReconnecting && isWrongNetwork
      ? "var(--amber)"
      : "var(--green)";

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col lg:flex"
        style={{
          backgroundColor: "var(--bg-secondary)",
          borderRight: "1px solid var(--border-default)",
        }}
      >
        {/* Logo */}
        <div className="flex h-16 items-center px-5">
          <AmmoLogo size="small" />
        </div>

        {/* Nav links */}
        <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
          {navItems.map((item) => {
            const active = isActiveLink(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-150"
                style={{
                  color: active ? "var(--accent)" : "var(--text-secondary)",
                  backgroundColor: active
                    ? "var(--bg-tertiary)"
                    : "transparent",
                  borderLeft: active
                    ? "3px solid var(--accent)"
                    : "3px solid transparent",
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.color = "var(--text-primary)";
                    e.currentTarget.style.backgroundColor =
                      "var(--bg-tertiary)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.color = "var(--text-secondary)";
                    e.currentTarget.style.backgroundColor = "transparent";
                  }
                }}
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </Link>
            );
          })}

          {isKeeper && (
            <Link
              href="/admin"
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-150"
              style={{
                color: isActiveLink(pathname, "/admin")
                  ? "var(--accent)"
                  : "var(--text-secondary)",
                backgroundColor: isActiveLink(pathname, "/admin")
                  ? "var(--bg-tertiary)"
                  : "transparent",
                borderLeft: isActiveLink(pathname, "/admin")
                  ? "3px solid var(--accent)"
                  : "3px solid transparent",
              }}
              onMouseEnter={(e) => {
                if (!isActiveLink(pathname, "/admin")) {
                  e.currentTarget.style.color = "var(--text-primary)";
                  e.currentTarget.style.backgroundColor = "var(--bg-tertiary)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActiveLink(pathname, "/admin")) {
                  e.currentTarget.style.color = "var(--text-secondary)";
                  e.currentTarget.style.backgroundColor = "transparent";
                }
              }}
            >
              <Shield size={20} />
              <span>Admin</span>
            </Link>
          )}
        </nav>

        {/* Bottom section: network badge + wallet */}
        <div
          className="flex flex-col gap-3 p-4"
          style={{ borderTop: "1px solid var(--border-default)" }}
        >
          {/* Network badge */}
          <div
            className="flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium"
            style={{
              backgroundColor: "var(--bg-primary)",
              border: "1px solid var(--border-default)",
              color: "var(--text-secondary)",
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
            <span>{networkLabel}</span>
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: dotColor }}
            />
          </div>

          {/* Wallet button */}
          <WalletButton />

          {/* Signed-in indicator */}
          {isSignedIn && (
            <div className="text-xs" style={{ color: "var(--text-muted)" }}>
              Signed in via SIWE
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Bottom Tabs */}
      <nav
        className="fixed inset-x-0 bottom-0 z-40 flex lg:hidden"
        style={{
          backgroundColor: "var(--bg-secondary)",
          borderTop: "1px solid var(--border-default)",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        <div className="grid h-16 w-full grid-cols-4">
          {navItems.map((item) => {
            const active = isActiveLink(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center gap-1 text-xs font-medium transition-colors duration-150"
                style={{
                  color: active ? "var(--accent)" : "var(--text-muted)",
                }}
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
