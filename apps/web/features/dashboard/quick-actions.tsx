"use client";

import Link from "next/link";
import { ArrowUpRight, ArrowDownLeft } from "lucide-react";

export function QuickActions() {
  return (
    <div
      className="flex flex-col gap-3 rounded-xl p-4 sm:flex-row sm:gap-4"
      style={{
        backgroundColor: "var(--bg-secondary)",
        border: "1px solid var(--border-default)",
      }}
    >
      <Link
        href="/trade?tab=mint"
        className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-brass px-5 py-3 text-sm font-semibold text-ax-primary transition-colors duration-150 hover:bg-brass-hover"
      >
        <ArrowUpRight size={16} />
        Mint Tokens
      </Link>
      <Link
        href="/trade?tab=redeem"
        className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-border-hover bg-transparent px-5 py-3 text-sm font-semibold text-text-primary transition-colors duration-150 hover:border-brass-border hover:bg-ax-tertiary"
      >
        <ArrowDownLeft size={16} />
        Redeem Tokens
      </Link>
    </div>
  );
}
