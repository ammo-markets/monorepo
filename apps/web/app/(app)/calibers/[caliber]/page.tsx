"use client";

import { use, useMemo } from "react";
import { notFound } from "next/navigation";
import {
  CaliberHeader,
  PriceChart,
  TokenStats,
  ActivityFeed,
  ActionPanelDesktop,
  ActionPanelMobile,
} from "@/features/market";
import { useMarketData } from "@/hooks/use-market-data";
import { useAuth } from "@/contexts/auth-context";
import type { Caliber } from "@ammo-exchange/shared";
import { buildCaliberDetail } from "@/lib/caliber-utils";

const validCalibers = ["9mm", "556", "22lr", "308"];

function resolveCaliberId(slug: string): Caliber | null {
  const map: Record<string, Caliber> = {
    "9mm": "9MM",
    "556": "556",
    "22lr": "22LR",
    "308": "308",
  };
  return map[slug.toLowerCase()] ?? null;
}

export default function CaliberDetailPage({
  params,
}: {
  params: Promise<{ caliber: string }>;
}) {
  const { caliber: caliberSlug } = use(params);

  if (!validCalibers.includes(caliberSlug.toLowerCase())) {
    notFound();
  }

  const caliberId = resolveCaliberId(caliberSlug);
  if (!caliberId) notFound();

  const { isConnected } = useAuth();
  const { data: calibers = [], isLoading: loading } = useMarketData();

  const data = useMemo(() => {
    const match = calibers.find((c) => c.caliber === caliberId);
    if (match) return buildCaliberDetail(caliberId, match);
    return null;
  }, [calibers, caliberId]);

  if (loading) {
    return (
      <div className="px-4 py-6 lg:py-10">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-8 lg:flex-row lg:gap-10">
            <div className="flex-1 min-w-0">
              <div className="h-8 w-48 rounded shimmer" />
              <div className="mt-4 h-6 w-32 rounded shimmer" />
              <div className="mt-8 h-[300px] w-full rounded-xl shimmer lg:h-[400px]" />
              <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-20 rounded-lg shimmer" />
                ))}
              </div>
            </div>
            <div className="hidden lg:block lg:w-[360px]">
              <div className="h-[400px] rounded-xl shimmer" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    notFound();
  }

  return (
    <div className="px-4 py-6 lg:py-10">
      <div className="mx-auto max-w-7xl">
        {/* Two-column layout: content left 65%, action panel right 35% */}
        <div className="flex flex-col gap-8 lg:flex-row lg:gap-10">
          {/* Left column */}
          <div className="flex-1 min-w-0">
            <CaliberHeader data={data} />

            {/* Price chart */}
            <div className="mt-8">
              <PriceChart caliberId={caliberId} currentPrice={data.price} />
            </div>

            {/* Token stats */}
            <div className="mt-8">
              <TokenStats data={data} />
            </div>

            {/* Activity feed */}
            <div className="mt-8">
              <ActivityFeed />
            </div>
          </div>

          {/* Right column -- desktop only (sticky action panel) */}
          <div className="hidden lg:block lg:w-[360px] lg:flex-shrink-0">
            <ActionPanelDesktop data={data} walletConnected={isConnected} />
          </div>
        </div>
      </div>

      {/* Mobile bottom sheet action panel */}
      <ActionPanelMobile data={data} walletConnected={isConnected} />
    </div>
  );
}
