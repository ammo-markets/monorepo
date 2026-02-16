"use client";

import { useState } from "react";
import { Info, ArrowRight } from "lucide-react";

export function PrimersSection({ primers }: { primers: number }) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <section>
      <div className="mb-4 flex items-center gap-2">
        <h2
          className="text-lg font-semibold"
          style={{ color: "var(--text-primary)" }}
        >
          Primers
        </h2>
        <div className="relative">
          <button
            type="button"
            className="flex items-center justify-center"
            aria-label="What are Primers?"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            onFocus={() => setShowTooltip(true)}
            onBlur={() => setShowTooltip(false)}
          >
            <Info size={15} style={{ color: "var(--text-muted)" }} />
          </button>
          {showTooltip && (
            <div
              className="absolute left-1/2 bottom-full mb-2 w-56 -translate-x-1/2 rounded-lg px-3 py-2 text-xs leading-relaxed"
              style={{
                backgroundColor: "var(--bg-tertiary)",
                border: "1px solid var(--border-hover)",
                color: "var(--text-secondary)",
                zIndex: 50,
              }}
            >
              Loyalty points earned from liquidity provision. Future utility to
              be announced.
            </div>
          )}
        </div>
      </div>

      <div
        className="rounded-xl p-6"
        style={{
          backgroundColor: "var(--bg-secondary)",
          border: "1px solid var(--border-default)",
        }}
      >
        {primers > 0 ? (
          <>
            <span
              className="font-mono text-3xl font-bold tabular-nums"
              style={{ color: "var(--brass)" }}
            >
              {primers.toLocaleString()}
            </span>
            <span
              className="ml-2 text-lg font-medium"
              style={{ color: "var(--brass)" }}
            >
              Primers
            </span>
            <p
              className="mt-3 text-sm leading-relaxed"
              style={{ color: "var(--text-secondary)" }}
            >
              Earned from providing liquidity to ammo token pools.
            </p>
            <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
              Future utility to be announced.
            </p>
          </>
        ) : (
          <>
            <span
              className="font-mono text-3xl font-bold tabular-nums"
              style={{ color: "var(--text-muted)" }}
            >
              0
            </span>
            <span
              className="ml-2 text-lg font-medium"
              style={{ color: "var(--text-muted)" }}
            >
              Primers
            </span>
            <p
              className="mt-3 text-sm"
              style={{ color: "var(--text-secondary)" }}
            >
              Provide liquidity on a DEX to start earning Primers.
            </p>
            <a
              href="#"
              className="mt-2 inline-flex items-center gap-1 text-sm font-medium transition-colors duration-150 text-brass hover:text-brass-hover"
            >
              Learn More
              <ArrowRight size={14} />
            </a>
          </>
        )}
      </div>
    </section>
  );
}
