"use client";

import Link from "next/link";
import { AmmoLogo } from "./logo";

export function LandingNavbar() {
  return (
    <header
      className="sticky top-0 z-50 w-full backdrop-blur-xl border-b border-border-default"
      style={{
        backgroundColor: "rgba(10, 10, 15, 0.85)",
      }}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-12 border-x border-transparent">
        <AmmoLogo />
        <Link
          href="/dashboard"
          className="rounded-none border border-brass bg-brass px-6 py-2 text-xs font-mono font-bold tracking-widest uppercase text-ax-primary transition-colors hover:bg-transparent hover:text-brass"
        >
          Launch App
        </Link>
      </nav>
    </header>
  );
}
