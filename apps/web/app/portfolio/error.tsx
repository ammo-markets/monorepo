"use client";

import { AlertTriangle } from "lucide-react";
import Link from "next/link";

export default function PortfolioError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div
      className="flex min-h-[40vh] flex-col items-center justify-center px-4 text-center"
      style={{ backgroundColor: "var(--bg-primary)" }}
    >
      <AlertTriangle
        size={40}
        className="mb-4"
        style={{ color: "var(--brass)" }}
      />
      <h2
        className="mb-2 text-lg font-semibold"
        style={{ color: "var(--text-primary)" }}
      >
        Something went wrong loading your portfolio
      </h2>
      <p
        className="mb-6 max-w-md text-sm leading-relaxed"
        style={{ color: "var(--text-secondary)" }}
      >
        {error.message.length > 200
          ? error.message.slice(0, 200) + "..."
          : error.message}
      </p>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors duration-150"
          style={{
            backgroundColor: "var(--brass)",
            color: "var(--bg-primary)",
          }}
        >
          Try Again
        </button>
        <Link
          href="/"
          className="rounded-lg px-5 py-2.5 text-sm font-medium transition-colors duration-150"
          style={{
            border: "1px solid var(--border-hover)",
            color: "var(--text-secondary)",
          }}
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
