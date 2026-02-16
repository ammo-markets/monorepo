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
        href="/mint"
        className="flex flex-1 items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold transition-colors duration-150"
        style={{
          backgroundColor: "var(--brass)",
          color: "var(--bg-primary)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "var(--brass-hover)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "var(--brass)";
        }}
      >
        <ArrowUpRight size={16} />
        Mint Tokens
      </Link>
      <Link
        href="/redeem"
        className="flex flex-1 items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold transition-colors duration-150"
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
        <ArrowDownLeft size={16} />
        Redeem Tokens
      </Link>
    </div>
  );
}
