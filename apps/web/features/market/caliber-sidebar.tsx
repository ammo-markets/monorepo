"use client";

import { useEffect, useRef } from "react";
import { caliberIcons } from "@/features/shared/caliber-icons";
import type { MarketCaliberFromAPI } from "@/lib/types";
import type { Caliber } from "@ammo-exchange/shared";

interface CaliberNavProps {
  calibers: MarketCaliberFromAPI[];
  selectedCaliber: Caliber | null;
  onSelect: (caliber: Caliber) => void;
  isLoading: boolean;
}

function formatSupply(supply: string): string {
  const num = Number(supply);
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(0)}K`;
  return num.toLocaleString();
}

export function CaliberSidebar({
  calibers,
  selectedCaliber,
  onSelect,
  isLoading,
}: CaliberNavProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-[88px] rounded-2xl shimmer"
            style={{ backgroundColor: "var(--bg-secondary)" }}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 overflow-y-auto max-h-[calc(100vh-12rem)]">
      {calibers.map((c) => {
        const Icon = caliberIcons[c.caliber];
        const isActive = c.caliber === selectedCaliber;

        return (
          <button
            key={c.caliber}
            type="button"
            onClick={() => onSelect(c.caliber)}
            className="flex items-center gap-3 rounded-2xl p-4 text-left transition-colors duration-150"
            style={{
              backgroundColor: isActive
                ? "var(--bg-tertiary)"
                : "var(--bg-secondary)",
              border: isActive
                ? "1px solid var(--border-default)"
                : "1px solid var(--border-default)",
              borderLeft: isActive
                ? "3px solid var(--brass)"
                : "3px solid transparent",
            }}
          >
            <Icon size={20} className="shrink-0" />
            <div className="min-w-0 flex-1">
              <div
                className="text-sm font-semibold truncate"
                style={{ color: "var(--text-primary)" }}
              >
                {c.name}
              </div>
              <div
                className="mt-0.5 font-mono text-sm tabular-nums"
                style={{ color: "var(--brass)" }}
              >
                ${c.pricePerRound.toFixed(4)}
              </div>
              <div
                className="mt-0.5 text-xs"
                style={{ color: "var(--text-muted)" }}
              >
                {formatSupply(c.totalSupply)} rounds
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

export function CaliberPillNav({
  calibers,
  selectedCaliber,
  onSelect,
  isLoading,
}: CaliberNavProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (activeRef.current) {
      activeRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [selectedCaliber]);

  if (isLoading) {
    return (
      <div className="flex gap-2 overflow-hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-9 w-32 shrink-0 rounded-full shimmer"
            style={{ backgroundColor: "var(--bg-secondary)" }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      ref={scrollRef}
      className="flex gap-2 overflow-x-auto scrollbar-hide"
    >
      {calibers.map((c) => {
        const isActive = c.caliber === selectedCaliber;

        return (
          <button
            key={c.caliber}
            ref={isActive ? activeRef : undefined}
            type="button"
            onClick={() => onSelect(c.caliber)}
            className="shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors duration-150"
            style={{
              backgroundColor: isActive
                ? "var(--brass)"
                : "var(--bg-secondary)",
              color: isActive
                ? "var(--ax-primary)"
                : "var(--text-secondary)",
              border: isActive
                ? "1px solid var(--brass)"
                : "1px solid var(--border-default)",
            }}
          >
            {c.name} · ${c.pricePerRound.toFixed(4)}
          </button>
        );
      })}
    </div>
  );
}
