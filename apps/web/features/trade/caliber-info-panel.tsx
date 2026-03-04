"use client";

import { formatUnits } from "viem";
import { CALIBER_SPECS, CALIBERS } from "@ammo-exchange/shared";
import type { Caliber } from "@ammo-exchange/shared";
import type { MarketCaliberFromAPI } from "@/lib/types";
import { caliberIcons } from "@/features/shared/caliber-icons";

interface TokenBalances {
  usdc: bigint | undefined;
  tokens: Record<Caliber, bigint | undefined>;
  isLoading: boolean;
}

interface CaliberInfoPanelProps {
  selectedCaliber: Caliber | null;
  onSelectCaliber: (cal: Caliber) => void;
  marketData: MarketCaliberFromAPI[];
  balances?: TokenBalances;
  mode?: "mint" | "redeem";
  isConnected?: boolean;
}

function formatBalance(
  value: bigint | undefined,
  decimals: number,
  isLoading: boolean,
): string {
  if (isLoading) return "...";
  if (value === undefined) return "--";
  const formatted = formatUnits(value, decimals);
  // Show up to 2 decimal places, strip trailing zeros
  const num = parseFloat(formatted);
  return num.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

export function CaliberInfoPanel({
  selectedCaliber,
  onSelectCaliber,
  marketData,
  balances,
  mode,
  isConnected,
}: CaliberInfoPanelProps) {
  return (
    <div>
      {!selectedCaliber && (
        <p
          className="mb-3 text-center text-sm"
          style={{ color: "var(--text-muted)" }}
        >
          Select a caliber to begin
        </p>
      )}

      {/* USDC balance above grid in mint mode */}
      {balances && mode === "mint" && isConnected && (
        <p
          className="mb-3 text-center text-sm font-medium"
          style={{ color: "var(--text-secondary)" }}
        >
          Available: {formatBalance(balances.usdc, 6, balances.isLoading)} USDC
        </p>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {CALIBERS.map((cal) => {
          const spec = CALIBER_SPECS[cal];
          const market = marketData.find((m) => m.caliber === cal);
          const isSelected = selectedCaliber === cal;
          const Icon = caliberIcons[cal];

          return (
            <button
              key={cal}
              type="button"
              aria-label={`Select ${cal} - ${spec.name}`}
              aria-pressed={isSelected}
              onClick={() => onSelectCaliber(cal)}
              className={`group flex flex-col gap-2 rounded-xl p-3 text-left transition-all duration-150 ${
                isSelected
                  ? "bg-brass-muted border-[1.5px] border-brass"
                  : "bg-ax-secondary border-[1.5px] border-border-default hover:border-border-hover"
              }`}
            >
              {/* Icon + Symbol */}
              <div className="flex items-center gap-2">
                <Icon size={28} />
                <div>
                  <div
                    className="text-sm font-bold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {cal}
                  </div>
                  <div
                    className="text-[11px]"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {spec.name}
                  </div>
                </div>
              </div>

              {/* Price */}
              <div
                className="font-mono text-sm font-semibold tabular-nums"
                style={{ color: "var(--text-primary)" }}
              >
                ${market?.pricePerRound?.toFixed(4) ?? "--"}
                <span
                  className="text-[10px] font-normal"
                  style={{ color: "var(--text-muted)" }}
                >
                  {" "}
                  /rd
                </span>
              </div>

              {/* Balance — per-card in redeem mode only */}
              {balances && mode === "redeem" && isConnected && (
                <div
                  className="text-[11px] font-medium"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Your balance:{" "}
                  {`${formatBalance(balances.tokens[cal], 18, balances.isLoading)} ${cal}`}
                </div>
              )}

              {/* Specs line */}
              <div
                className="text-[10px] leading-tight"
                style={{ color: "var(--text-muted)" }}
              >
                {spec.grainWeight}gr |{" "}
                {spec.caseType === "standard" ? "Std" : "Brass"} | Min{" "}
                {spec.minMintRounds} rds
              </div>

              {/* Selection hint */}
              {!isSelected && (
                <div
                  className="text-[10px] font-medium"
                  style={{ color: "var(--text-muted)" }}
                >
                  Tap to select
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
