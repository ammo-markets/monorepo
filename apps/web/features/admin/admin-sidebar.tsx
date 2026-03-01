"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Shield,
  LayoutDashboard,
  ArrowUpCircle,
  ArrowDownCircle,
  ArrowLeft,
  Menu,
  X,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/mint-orders", label: "Mint Orders", icon: ArrowUpCircle },
  {
    href: "/admin/redeem-orders",
    label: "Redeem Orders",
    icon: ArrowDownCircle,
  },
] as const;

export function AdminSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile Admin Header */}
      <div
        className="flex items-center justify-between border-b px-4 py-3 lg:hidden"
        style={{
          borderColor: "var(--border-default)",
          backgroundColor: "var(--bg-primary)",
        }}
      >
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5" style={{ color: "var(--brass)" }} />
          <span
            className="text-sm font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            Admin
          </span>
        </div>
        <button
          type="button"
          className="rounded-lg p-2 transition-colors hover:bg-[var(--bg-tertiary)]"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? (
            <X className="h-5 w-5" style={{ color: "var(--text-secondary)" }} />
          ) : (
            <Menu
              className="h-5 w-5"
              style={{ color: "var(--text-secondary)" }}
            />
          )}
        </button>
      </div>

      {/* Mobile Nav Dropdown */}
      {mobileOpen && (
        <nav
          className="flex flex-col gap-1 border-b p-3 lg:hidden"
          style={{
            borderColor: "var(--border-default)",
            backgroundColor: "var(--bg-primary)",
          }}
        >
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const isActive =
              href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? ""
                    : "hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]"
                }`}
                style={
                  isActive
                    ? {
                        backgroundColor: "var(--brass-muted)",
                        color: "var(--brass)",
                      }
                    : { color: "var(--text-secondary)" }
                }
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
          <Link
            href="/exchange"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]"
            style={{ color: "var(--text-secondary)" }}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to App
          </Link>
        </nav>
      )}

      {/* Desktop Sidebar */}
      <aside
        className="hidden h-full w-64 shrink-0 flex-col border-r lg:flex"
        style={{
          borderColor: "var(--border-default)",
          backgroundColor: "var(--bg-primary)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center gap-2 border-b px-5 py-4"
          style={{ borderColor: "var(--border-default)" }}
        >
          <Shield className="h-5 w-5" style={{ color: "var(--brass)" }} />
          <span
            className="text-sm font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            Admin
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-1 p-3">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const isActive =
              href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(href);

            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? ""
                    : "hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]"
                }`}
                style={
                  isActive
                    ? {
                        backgroundColor: "var(--brass-muted)",
                        color: "var(--brass)",
                      }
                    : { color: "var(--text-secondary)" }
                }
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Back to App */}
        <div
          className="mt-auto border-t p-3"
          style={{ borderColor: "var(--border-default)" }}
        >
          <Link
            href="/exchange"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]"
            style={{ color: "var(--text-secondary)" }}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to App
          </Link>
        </div>
      </aside>
    </>
  );
}
