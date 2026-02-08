"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/ammo/navbar";
import { Footer } from "@/components/ammo/footer";
import { CaliberHeader } from "@/components/ammo/caliber-header";
import { PriceChart } from "@/components/ammo/price-chart";
import { TokenStats } from "@/components/ammo/token-stats";
import { ActivityFeed } from "@/components/ammo/activity-feed";
import {
  ActionPanelDesktop,
  ActionPanelMobile,
} from "@/components/ammo/action-panel";
import { caliberDetails, type CaliberId } from "@/lib/mock-data";

const validCalibers = ["9mm", "556", "22lr", "308"];

function resolveCaliberId(slug: string): CaliberId | null {
  const map: Record<string, CaliberId> = {
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

  const data = caliberDetails[caliberId];
  if (!data) notFound();

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 px-4 py-6 lg:py-10">
        <div className="mx-auto max-w-7xl">
          {/* Two-column layout: content left 65%, action panel right 35% */}
          <div className="flex flex-col gap-8 lg:flex-row lg:gap-10">
            {/* Left column */}
            <div className="flex-1 min-w-0">
              <CaliberHeader data={data} />

              {/* Price chart */}
              <div className="mt-8">
                <PriceChart caliberId={caliberId} />
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

            {/* Right column — desktop only (sticky action panel) */}
            <div className="hidden lg:block lg:w-[360px] lg:flex-shrink-0">
              <ActionPanelDesktop data={data} walletConnected={false} />
            </div>
          </div>
        </div>
      </main>

      {/* Mobile bottom sheet action panel */}
      <ActionPanelMobile data={data} walletConnected={false} />

      {/* Spacer for mobile bottom bar */}
      <div className="h-16 lg:hidden" />

      <Footer />
    </div>
  );
}
