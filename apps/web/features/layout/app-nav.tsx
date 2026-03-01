"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowLeftRight,
  BarChart3,
  Wallet,
  User,
  Shield,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { AmmoLogo } from "./logo";
import { useKeeperCheck } from "@/hooks/use-keeper-check";

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

const navItems: NavItem[] = [
  { label: "Mint / Redeem", href: "/exchange", icon: ArrowLeftRight },
  { label: "Portfolio", href: "/portfolio", icon: Wallet },
  { label: "Calibers", href: "/calibers", icon: BarChart3 },
  { label: "Profile", href: "/profile", icon: User },
];

function isActiveLink(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

export function AppNav() {
  const pathname = usePathname();
  const { isKeeper } = useKeeperCheck();

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
        <nav className="flex flex-1 flex-col gap-0 border-y border-border-default">
          {navItems.map((item) => {
            const active = isActiveLink(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-4 px-6 py-4 text-xs font-mono font-bold tracking-widest uppercase transition-none border-b border-border-default ${
                  active
                    ? "text-brass bg-ax-tertiary border-l-2 border-l-brass"
                    : "text-text-secondary bg-transparent border-l-2 border-l-transparent hover:text-text-primary hover:bg-ax-tertiary hover:border-l-border-hover"
                }`}
              >
                <item.icon size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}

          {isKeeper && (
            <Link
              href="/admin"
              aria-current={
                isActiveLink(pathname, "/admin") ? "page" : undefined
              }
              className={`flex items-center gap-4 px-6 py-4 text-xs font-mono font-bold tracking-widest uppercase transition-none border-b border-border-default ${
                isActiveLink(pathname, "/admin")
                  ? "text-brass bg-ax-tertiary border-l-2 border-l-brass"
                  : "text-text-secondary bg-transparent border-l-2 border-l-transparent hover:text-text-primary hover:bg-ax-tertiary hover:border-l-border-hover"
              }`}
            >
              <Shield size={18} />
              <span>Admin</span>
            </Link>
          )}
        </nav>
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
        <div
          className={`grid h-16 w-full ${isKeeper ? "grid-cols-5" : "grid-cols-4"}`}
        >
          {navItems.map((item) => {
            const active = isActiveLink(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex flex-col items-center justify-center gap-1 text-[10px] font-mono font-bold tracking-widest uppercase transition-none border-t-2 ${
                  active
                    ? "text-brass bg-ax-tertiary border-brass"
                    : "text-text-muted bg-transparent border-transparent hover:text-text-secondary hover:bg-ax-tertiary"
                }`}
              >
                <item.icon size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}
          {isKeeper && (
            <Link
              href="/admin"
              aria-current={
                isActiveLink(pathname, "/admin") ? "page" : undefined
              }
              className={`flex flex-col items-center justify-center gap-1 text-[10px] font-mono font-bold tracking-widest uppercase transition-none border-t-2 ${
                isActiveLink(pathname, "/admin")
                  ? "text-brass bg-ax-tertiary border-brass"
                  : "text-text-muted bg-transparent border-transparent hover:text-text-secondary hover:bg-ax-tertiary"
              }`}
            >
              <Shield size={18} />
              <span>Admin</span>
            </Link>
          )}
        </div>
      </nav>
    </>
  );
}
