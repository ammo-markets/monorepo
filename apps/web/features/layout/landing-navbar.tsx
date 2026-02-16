"use client";

import Link from "next/link";
import { AmmoLogo } from "./logo";

export function LandingNavbar() {
  return (
    <header
      className="sticky top-0 z-50 w-full backdrop-blur-xl"
      style={{
        backgroundColor: "rgba(10, 10, 15, 0.85)",
        borderBottom: "1px solid var(--border-default)",
      }}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-8">
        <AmmoLogo />
        <Link
          href="/dashboard"
          className="rounded-lg px-5 py-2 text-sm font-semibold transition-colors duration-150"
          style={{
            backgroundColor: "var(--accent)",
            color: "var(--bg-primary)",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.opacity = "0.9";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.opacity = "1";
          }}
        >
          Launch App
        </Link>
      </nav>
    </header>
  );
}
