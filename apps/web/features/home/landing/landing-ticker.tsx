"use client";

import {
  CALIBER_SPECS,
  UPCOMING_CALIBERS,
} from "@ammo-exchange/shared";
import type { Caliber } from "@ammo-exchange/shared";
import { useMarketData } from "@/hooks/use-market-data";

const LIVE_TICKER_CALIBER = "556_NATO_PRACTICE" satisfies Caliber;

const ROADMAP_TAGLINE = "MORE CALIBERS ADDED AS THE PROTOCOL GROWS";

function formatPrice(price?: number) {
  if (typeof price !== "number" || !Number.isFinite(price)) return "$--";
  return `$${price.toFixed(4)}`;
}

function formatMonthlyChange(change: number | null | undefined) {
  if (typeof change !== "number" || !Number.isFinite(change)) return "--";
  const sign = change > 0 ? "+" : "";
  return `${sign}${change.toFixed(1)}%`;
}

interface TickerItem {
  label: string;
  value: string;
  change: string;
  changeValue: number | null | undefined;
  live: boolean;
}

function TickerItems() {
  const { data: marketData = [] } = useMarketData();
  const marketByCaliber = new Map(marketData.map((m) => [m.caliber, m]));
  const liveMarket = marketByCaliber.get(LIVE_TICKER_CALIBER);
  const liveSpec = CALIBER_SPECS[LIVE_TICKER_CALIBER];
  const liveItem: TickerItem = {
    label: `${liveMarket?.tokenSymbol ?? liveSpec.tokenSymbol} ${
      liveMarket?.name ?? liveSpec.name
    }`,
    value: formatPrice(liveMarket?.pricePerRound),
    change: formatMonthlyChange(liveMarket?.monthlyChangePercent),
    changeValue: liveMarket?.monthlyChangePercent,
    live: true,
  };

  // Interleave the live item between each upcoming caliber, then close with the
  // roadmap tagline so the marquee feels alive even when only one caliber ships.
  const items: TickerItem[] = UPCOMING_CALIBERS.flatMap((cal) => [
    liveItem,
    {
      label: cal.displayName.toUpperCase(),
      value: "Coming Soon",
      change: "",
      changeValue: null,
      live: false,
    },
  ]);
  items.push(liveItem, {
    label: ROADMAP_TAGLINE,
    value: "",
    change: "",
    changeValue: null,
    live: false,
  });

  // Repeat enough times to fill the marquee track regardless of item count.
  const doubled = [...items, ...items];

  return (
    <>
      {doubled.map((d, i) => (
        <span key={`${d.label}-${i}`} className="tick">
          <span className={`tick-dot${d.live ? "" : " tick-dot-soon"}`} aria-hidden />
          {d.label}
          {d.value ? (
            <>
              {" "}
              <span className={d.live ? "tick-val" : "tick-soon"}>{d.value}</span>
            </>
          ) : null}
          {d.change ? (
            <>
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
            </>
          ) : null}
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
