"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Shield,
  LayoutDashboard,
  ArrowUpCircle,
  ArrowDownCircle,
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

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-zinc-800 bg-zinc-950">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-zinc-800 px-5 py-4">
        <Shield className="h-5 w-5 text-amber-400" />
        <span className="text-sm font-semibold text-zinc-100">Admin</span>
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
                  ? "bg-amber-400/10 text-amber-400"
                  : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
