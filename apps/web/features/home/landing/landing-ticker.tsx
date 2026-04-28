"use client";

import { LAUNCH_CALIBERS, CALIBER_SPECS } from "@ammo-exchange/shared";
import { useMarketData } from "@/hooks/use-market-data";

function formatPrice(price?: number) {
  if (typeof price !== "number" || !Number.isFinite(price)) return "$--";
  return `$${price.toFixed(4)}`;
}

function formatMonthlyChange(change: number | null | undefined) {
  if (typeof change !== "number" || !Number.isFinite(change)) return "--";
  const sign = change > 0 ? "+" : "";
  return `${sign}${change.toFixed(1)}%`;
}

function TickerItems() {
  const { data: marketData = [] } = useMarketData();
  const marketByCaliber = new Map(marketData.map((m) => [m.caliber, m]));
  const items = LAUNCH_CALIBERS.map((caliber) => {
    const market = marketByCaliber.get(caliber);
    const spec = CALIBER_SPECS[caliber];
    return {
      label: `${market?.tokenSymbol ?? spec.tokenSymbol} ${market?.name ?? spec.name}`,
      value: formatPrice(market?.pricePerRound),
      change: formatMonthlyChange(market?.monthlyChangePercent),
      changeValue: market?.monthlyChangePercent,
    };
  });
  // Repeat enough times to fill the marquee track regardless of item count.
  const doubled = [...items, ...items, ...items, ...items];

  return (
    <>
      {doubled.map((d, i) => (
        <span key={`${d.label}-${i}`} className="tick">
          <span className="tick-dot" aria-hidden />
          {d.label}
          {" "}
          <span className="tick-val">{d.value}</span>
          {" "}
          <span
            className={
              typeof d.changeValue !== "number"
                ? "tick-soon"
                : d.changeValue < 0
                  ? "tick-dn"
                  : "tick-up"
            }
          >
            {d.change}
          </span>
        </span>
      ))}
    </>
  );
}

export function LandingTicker() {
  return (
    <div className="ticker-wrap">
      <div className="ticker-track">
        <TickerItems />
      </div>
    </div>
  );
}
