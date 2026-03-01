import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function EmptyHoldings() {
  return (
    <div
      className="flex flex-col items-center justify-center rounded-xl px-6 py-16 text-center"
      style={{
        backgroundColor: "var(--bg-secondary)",
        border: "1px solid var(--border-default)",
      }}
    >
      {/* Empty vault SVG */}
      <svg
        width="64"
        height="64"
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="mb-5"
      >
        <rect
          x="8"
          y="12"
          width="48"
          height="40"
          rx="4"
          stroke="var(--text-muted)"
          strokeWidth="1.5"
        />
        <rect
          x="12"
          y="16"
          width="40"
          height="32"
          rx="2"
          stroke="var(--text-muted)"
          strokeWidth="1"
          opacity="0.5"
        />
        <circle
          cx="32"
          cy="32"
          r="10"
          stroke="var(--text-muted)"
          strokeWidth="1.5"
        />
        <circle
          cx="32"
          cy="32"
          r="3"
          stroke="var(--text-muted)"
          strokeWidth="1.5"
        />
        <line
          x1="32"
          y1="22"
          x2="32"
          y2="26"
          stroke="var(--text-muted)"
          strokeWidth="1"
        />
        <line
          x1="32"
          y1="38"
          x2="32"
          y2="42"
          stroke="var(--text-muted)"
          strokeWidth="1"
        />
        <line
          x1="22"
          y1="32"
          x2="26"
          y2="32"
          stroke="var(--text-muted)"
          strokeWidth="1"
        />
        <line
          x1="38"
          y1="32"
          x2="42"
          y2="32"
          stroke="var(--text-muted)"
          strokeWidth="1"
        />
        <rect
          x="48"
          y="24"
          width="6"
          height="16"
          rx="2"
          stroke="var(--text-muted)"
          strokeWidth="1"
        />
      </svg>
      <p
        className="mb-1 text-sm font-medium"
        style={{ color: "var(--text-secondary)" }}
      >
        {"You don't hold any ammo tokens yet."}
      </p>
      <p className="mb-6 text-sm" style={{ color: "var(--text-muted)" }}>
        Start minting to build your position.
      </p>
      <Link
        href="/exchange?tab=mint"
        className="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors duration-150 bg-brass text-ax-primary hover:bg-brass-hover"
      >
        Start Minting
        <ArrowRight size={16} />
      </Link>
    </div>
  );
}

export function EmptyOrders() {
  return (
    <div
      className="flex flex-col items-center justify-center rounded-xl px-6 py-12 text-center"
      style={{
        backgroundColor: "var(--bg-secondary)",
        border: "1px solid var(--border-default)",
      }}
    >
      <p
        className="mb-1 text-sm font-medium"
        style={{ color: "var(--text-secondary)" }}
      >
        No orders yet.
      </p>
      <p className="mb-5 text-sm" style={{ color: "var(--text-muted)" }}>
        Mint your first tokens to get started.
      </p>
      <Link
        href="/exchange?tab=mint"
        className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors duration-150 bg-brass text-ax-primary hover:bg-brass-hover"
      >
        Start Minting
      </Link>
    </div>
  );
}
