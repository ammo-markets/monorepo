import { Check } from "lucide-react";
import {
  caliberIcons,
  upcomingCaliberIcons,
} from "@/features/shared/caliber-icons";
import type { CaliberDetailData } from "@/lib/types";
import type { Caliber } from "@ammo-exchange/shared";
import { UPCOMING_CALIBERS } from "@ammo-exchange/shared";

export function StepSelectCaliber({
  selected,
  allCalibers,
  onSelect,
  onNext,
}: {
  selected: Caliber | null;
  allCalibers: CaliberDetailData[];
  onSelect: (id: Caliber) => void;
  onNext: () => void;
}) {
  return (
    <div>
      <h2
        className="mb-1 font-display text-2xl font-bold uppercase"
        style={{ color: "var(--text-primary)" }}
      >
        Choose Your Caliber
      </h2>
      <p className="mb-6 text-sm" style={{ color: "var(--text-secondary)" }}>
        Select the ammunition type you want to mint tokens for.
      </p>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {allCalibers.map((cal) => {
          const isSelected = selected === cal.id;
          const Icon = caliberIcons[cal.id];

          return (
            <button
              key={cal.id}
              type="button"
              onClick={() => onSelect(cal.id)}
              className={`group relative flex flex-col gap-3 p-4 text-left transition-none ${
                isSelected
                  ? "bg-brass-muted border-2 border-brass"
                  : "bg-ax-secondary border-2 border-border-default hover:border-border-hover"
              }`}
            >
              {/* Selected check */}
              {isSelected && (
                <span
                  className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full"
                  style={{ backgroundColor: "var(--brass)" }}
                >
                  <Check
                    size={12}
                    strokeWidth={3}
                    style={{ color: "var(--bg-primary)" }}
                  />
                </span>
              )}

              <div className="flex items-center gap-3">
                <Icon size={40} />
                <div>
                  <div
                    className="text-sm font-bold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {cal.symbol}
                  </div>
                  <div
                    className="text-xs"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {cal.name}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span
                  className="font-mono text-sm font-bold uppercase tracking-widest tabular-nums"
                  style={{ color: "var(--text-primary)" }}
                >
                  ${cal.price.toFixed(4)}
                  <span
                    className="text-xs font-normal"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {" "}
                    /round
                  </span>
                </span>
              </div>
            </button>
          );
        })}

        {UPCOMING_CALIBERS.map((upcoming) => {
          const Icon = upcomingCaliberIcons[upcoming.iconKey];

          return (
            <div
              key={upcoming.id}
              aria-disabled="true"
              title={`${upcoming.displayName} — coming soon`}
              className="group relative flex cursor-not-allowed flex-col gap-3 border-2 border-dashed p-4 text-left opacity-60"
              style={{
                backgroundColor: "var(--bg-secondary)",
                borderColor: "var(--border-default)",
              }}
            >
              <span
                className="absolute right-3 top-3 rounded-sm px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-widest"
                style={{
                  color: "var(--text-muted)",
                  border: "1px solid var(--border-default)",
                }}
              >
                Soon
              </span>

              <div className="flex items-center gap-3">
                <Icon size={40} />
                <div>
                  <div
                    className="text-sm font-bold"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {upcoming.displayName}
                  </div>
                  <div
                    className="text-xs"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Coming soon
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span
                  className="font-mono text-sm font-bold uppercase tracking-widest tabular-nums"
                  style={{ color: "var(--text-muted)" }}
                >
                  — / round
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Next button */}
      <button
        type="button"
        disabled={!selected}
        onClick={onNext}
        className={`mt-6 flex w-full items-center justify-center py-3.5 text-sm font-bold transition-none ${
          selected
            ? "bg-brass text-ax-primary cursor-pointer hover:bg-brass-hover"
            : "bg-ax-tertiary text-text-muted cursor-not-allowed opacity-50"
        }`}
      >
        Next
      </button>
    </div>
  );
}
