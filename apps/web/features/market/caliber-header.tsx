"use client";

import type { CaliberDetailData } from "@/lib/types";
import type { Caliber } from "@ammo-exchange/shared";
import { caliberIcons } from "@/features/shared/caliber-icons";

interface CaliberHeaderProps {
  data: CaliberDetailData;
}

export function CaliberHeader({ data }: CaliberHeaderProps) {
  const IconComponent = caliberIcons[data.id as Caliber];

  return (
    <div>
      {/* Breadcrumb */}
      <nav
        className="mb-4 flex items-center gap-2 text-sm"
        aria-label="Breadcrumb"
      >
        <a
          href="/market"
          className="text-brass transition-colors duration-150 hover:text-brass-hover"
        >
          Market
        </a>
        <span style={{ color: "var(--text-muted)" }} aria-hidden="true">
          /
        </span>
        <span style={{ color: "var(--text-secondary)" }}>{data.symbol}</span>
      </nav>

      {/* Caliber name + icon */}
      <div className="flex items-center gap-3">
        <IconComponent size={32} />
        <div>
          <h1
            className="text-2xl font-bold tracking-tight lg:text-3xl"
            style={{ color: "var(--text-primary)" }}
          >
            {data.name}
          </h1>
          <p
            className="mt-0.5 text-sm"
            style={{ color: "var(--text-secondary)" }}
          >
            {data.specLine}
          </p>
        </div>
      </div>

      {/* Price */}
      <div className="mt-5">
        <span
          className="font-mono text-5xl font-bold tabular-nums tracking-tight"
          style={{ color: "var(--text-primary)" }}
        >
          ${data.price.toFixed(2)}
        </span>
        <div className="mt-2 text-xs" style={{ color: "var(--text-muted)" }}>
          per round
        </div>
      </div>
    </div>
  );
}
