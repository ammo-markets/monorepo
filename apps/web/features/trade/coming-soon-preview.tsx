"use client";

import {
  CALIBER_SPECS,
  LAUNCH_CALIBERS,
} from "@ammo-exchange/shared";
import type { Caliber, UpcomingCaliberSpec } from "@ammo-exchange/shared";
import { upcomingCaliberIcons } from "@/features/shared/caliber-icons";

interface ComingSoonPreviewProps {
  upcoming: UpcomingCaliberSpec;
  currentLiveCaliber: Caliber | null;
  onBackToLive: (caliber: Caliber) => void;
}

export function ComingSoonPreview({
  upcoming,
  currentLiveCaliber,
  onBackToLive,
}: ComingSoonPreviewProps) {
  const Icon = upcomingCaliberIcons[upcoming.iconKey];
  const targetLive: Caliber = currentLiveCaliber ?? LAUNCH_CALIBERS[0]!;
  const liveSpec = CALIBER_SPECS[targetLive];

  return (
    <div className="flex min-h-[420px] flex-col items-center justify-center gap-6 px-4 py-12">
      <Icon size={64} />

      <p
        className="font-display text-xs font-bold tracking-wide"
        style={{ color: "var(--text-muted)" }}
      >
        {upcoming.displayName}
      </p>

      <div className="flex items-center gap-3">
        <span
          aria-hidden
          className="h-px w-10"
          style={{ backgroundColor: "var(--border-default)" }}
        />
        <span
          className="text-xl font-bold uppercase tracking-[0.3em]"
          style={{ color: "var(--text-primary)" }}
        >
          Coming Soon
        </span>
        <span
          aria-hidden
          className="h-px w-10"
          style={{ backgroundColor: "var(--border-default)" }}
        />
      </div>

      <button
        type="button"
        onClick={() => onBackToLive(targetLive)}
        className="bg-brass-muted text-brass border-brass-border mt-4 flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors hover:opacity-90"
      >
        ← Trade {liveSpec.tokenSymbol} {liveSpec.name}
      </button>
    </div>
  );
}
