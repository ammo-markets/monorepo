"use client";

import { ArrowRight } from "lucide-react";

export function Hero() {
  return (
    <section className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden px-4">
      {/* Subtle geometric background pattern — concentric primer circles */}
      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
        aria-hidden="true"
      >
        <svg
          width="800"
          height="800"
          viewBox="0 0 800 800"
          fill="none"
          className="opacity-[0.03]"
        >
          <circle
            cx="400"
            cy="400"
            r="100"
            stroke="#C6A44E"
            strokeWidth="0.5"
          />
          <circle
            cx="400"
            cy="400"
            r="180"
            stroke="#C6A44E"
            strokeWidth="0.5"
          />
          <circle
            cx="400"
            cy="400"
            r="260"
            stroke="#C6A44E"
            strokeWidth="0.5"
          />
          <circle
            cx="400"
            cy="400"
            r="340"
            stroke="#C6A44E"
            strokeWidth="0.5"
          />
          {/* Crosshair lines */}
          <line
            x1="400"
            y1="60"
            x2="400"
            y2="740"
            stroke="#C6A44E"
            strokeWidth="0.3"
          />
          <line
            x1="60"
            y1="400"
            x2="740"
            y2="400"
            stroke="#C6A44E"
            strokeWidth="0.3"
          />
        </svg>
      </div>

      {/* Radial gradient overlay for depth */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(198, 164, 78, 0.03) 0%, transparent 60%)",
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto max-w-3xl text-center">
        {/* Headline */}
        <h1
          className="text-balance text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl"
          style={{ color: "var(--text-primary)" }}
        >
          Make Your Ammo <span style={{ color: "var(--brass)" }}>Liquid.</span>
        </h1>

        {/* Subhead */}
        <p
          className="mx-auto mt-6 max-w-xl text-pretty text-base leading-relaxed sm:text-lg"
          style={{ color: "var(--text-secondary)" }}
        >
          Buy, hold, and trade tokenized ammunition backed 1:1 by physical
          rounds in insured storage. No shipping. No friction. Just USDC in,
          ammo tokens out.
        </p>

        {/* CTAs */}
        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <a
            href="/dashboard"
            className="group inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold transition-all duration-150"
            style={{
              backgroundColor: "var(--brass)",
              color: "var(--bg-primary)",
              boxShadow: "0 0 20px rgba(198, 164, 78, 0.15)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "var(--brass-hover)";
              e.currentTarget.style.boxShadow =
                "0 0 30px rgba(198, 164, 78, 0.25)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "var(--brass)";
              e.currentTarget.style.boxShadow =
                "0 0 20px rgba(198, 164, 78, 0.15)";
            }}
          >
            Launch App
            <ArrowRight
              size={16}
              className="transition-transform duration-150 group-hover:translate-x-0.5"
            />
          </a>
          <a
            href="#market"
            className="inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold transition-all duration-150"
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
            View Market
          </a>
        </div>

        {/* Trust strip */}
        <div
          className="mt-16 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[11px] font-medium uppercase tracking-[0.08em] sm:gap-x-6"
          style={{ color: "var(--text-muted)" }}
        >
          <span>Backed by physical inventory</span>
          <span
            className="hidden sm:inline"
            style={{ color: "var(--border-hover)" }}
            aria-hidden="true"
          >
            |
          </span>
          <span>Insured storage</span>
          <span
            className="hidden sm:inline"
            style={{ color: "var(--border-hover)" }}
            aria-hidden="true"
          >
            |
          </span>
          <span>USDC payments</span>
          <span
            className="hidden sm:inline"
            style={{ color: "var(--border-hover)" }}
            aria-hidden="true"
          >
            |
          </span>
          <span>Avalanche blockchain</span>
        </div>
      </div>
    </section>
  );
}
