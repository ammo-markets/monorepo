"use client";

import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { caliberIcons } from "@/features/shared/caliber-icons";
import { useMarketData } from "@/hooks/use-market-data";
import type { MarketCaliberFromAPI } from "@/lib/types";
import { CALIBER_SPECS } from "@ammo-exchange/shared";
import type { Caliber } from "@ammo-exchange/shared";

function SectionTitle({
  children,
  id,
}: {
  children: ReactNode;
  id?: string;
}) {
  return (
    <div className="mb-12 text-center lg:mb-16" id={id}>
      <h2
        className="text-xs font-semibold uppercase tracking-[0.08em]"
        style={{ color: "var(--text-secondary)" }}
      >
        {children}
      </h2>
      <div
        className="mx-auto mt-3 h-px w-12"
        style={{ backgroundColor: "var(--brass)" }}
        aria-hidden="true"
      />
    </div>
  );
}

function CaliberCard({ caliber }: { caliber: MarketCaliberFromAPI }) {
  const IconComponent = caliberIcons[caliber.caliber as Caliber];

  return (
    <a
      href={`/market/${caliber.caliber.toLowerCase()}`}
      className="group block rounded-xl p-5 transition-all duration-150"
      style={{
        backgroundColor: "var(--bg-secondary)",
        border: "1px solid var(--border-default)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "var(--brass-border)";
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow =
          "0 4px 12px rgba(0,0,0,0.2), 0 0 20px rgba(198,164,78,0.05)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "var(--border-default)";
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <IconComponent size={32} />
        <div>
          <span
            className="text-sm font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            {caliber.caliber}
          </span>
          <span className="ml-2 text-xs" style={{ color: "var(--text-muted)" }}>
            {caliber.name}
          </span>
        </div>
      </div>

      {/* Price */}
      <div className="mt-4 flex items-baseline gap-3">
        <span
          className="font-mono text-2xl font-medium tabular-nums"
          style={{ color: "var(--text-primary)" }}
        >
          ${caliber.pricePerRound.toFixed(2)}
        </span>
        <span className="text-xs" style={{ color: "var(--text-muted)" }}>
          per round
        </span>
      </div>

      {/* Supply info */}
      <div className="mt-4 text-xs" style={{ color: "var(--text-muted)" }}>
        Supply: {caliber.totalSupply.toLocaleString("en-US")} rounds
      </div>

      {/* Specs */}
      <div
        className="mt-2 flex gap-3 text-xs"
        style={{ color: "var(--text-muted)" }}
      >
        <span>
          {CALIBER_SPECS[caliber.caliber as Caliber].grainWeight}gr
        </span>
        <span aria-hidden="true">&middot;</span>
        <span>
          {CALIBER_SPECS[caliber.caliber as Caliber].caseType.charAt(0).toUpperCase() +
            CALIBER_SPECS[caliber.caliber as Caliber].caseType.slice(1)}
        </span>
        <span aria-hidden="true">&middot;</span>
        <span>
          {CALIBER_SPECS[caliber.caliber as Caliber].minMintRounds} rd min
        </span>
      </div>

      {/* Footer */}
      <div className="mt-4 flex items-center justify-end">
        <span
          className="flex items-center gap-1 text-xs font-medium transition-colors duration-150"
          style={{ color: "var(--text-secondary)" }}
        >
          Mint
          <ArrowRight
            size={12}
            className="transition-transform duration-150 group-hover:translate-x-0.5"
          />
        </span>
      </div>
    </a>
  );
}

function CaliberCardSkeleton() {
  return (
    <div
      className="rounded-xl p-5"
      style={{
        backgroundColor: "var(--bg-secondary)",
        border: "1px solid var(--border-default)",
      }}
    >
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded shimmer" />
        <div className="h-4 w-24 rounded shimmer" />
      </div>
      <div className="mt-4 h-7 w-20 rounded shimmer" />
      <div className="mt-4 h-3 w-32 rounded shimmer" />
      <div className="mt-4 flex items-center justify-between">
        <div className="h-3 w-20 rounded shimmer" />
        <div className="h-3 w-12 rounded shimmer" />
      </div>
    </div>
  );
}

export function MarketCards() {
  const { data: calibers = [], isLoading: loading } = useMarketData();

  return (
    <section
      id="market"
      className="py-24 px-4 lg:py-32"
      style={{ backgroundColor: "var(--bg-primary)" }}
    >
      <div className="mx-auto max-w-6xl">
        <SectionTitle>Live Market</SectionTitle>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {loading
            ? [1, 2, 3, 4].map((i) => <CaliberCardSkeleton key={i} />)
            : calibers.map((caliber) => (
                <CaliberCard key={caliber.caliber} caliber={caliber} />
              ))}
        </div>
      </div>
    </section>
  );
}

export function MarketCardsSkeleton() {
  return (
    <section
      className="py-24 px-4 lg:py-32"
      style={{ backgroundColor: "var(--bg-primary)" }}
    >
      <div className="mx-auto max-w-6xl">
        <SectionTitle>Live Market</SectionTitle>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <CaliberCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
