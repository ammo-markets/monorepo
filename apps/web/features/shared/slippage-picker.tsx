import { Info, TrendingDown } from "lucide-react";

const PRESETS = [
  { label: "0.5%", bps: 50 },
  { label: "1%", bps: 100 },
  { label: "2%", bps: 200 },
  { label: "5%", bps: 500 },
] as const;

export function SlippagePicker({
  slippageBps,
  onSlippageChange,
}: {
  slippageBps: number;
  onSlippageChange: (bps: number) => void;
}) {
  return (
    <div className="mt-5">
      {/* Label row */}
      <div className="mb-2.5 flex items-center gap-1.5">
        <TrendingDown
          size={14}
          className="shrink-0"
          style={{ color: "var(--text-muted)" }}
        />
        <span
          className="text-xs font-medium uppercase tracking-wide"
          style={{ color: "var(--text-muted)" }}
        >
          Slippage Tolerance
        </span>
        <div className="group relative ml-0.5">
          <Info
            size={12}
            className="cursor-help"
            style={{ color: "var(--text-muted)", opacity: 0.6 }}
          />
          <div
            className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 w-56 -translate-x-1/2 px-3 py-2 text-xs leading-relaxed opacity-0 transition-opacity group-hover:opacity-100"
            style={{
              backgroundColor: "var(--bg-tertiary)",
              border: "1px solid var(--border-default)",
              color: "var(--text-secondary)",
            }}
          >
            Maximum price deviation you&apos;ll accept. If the price moves more
            than this during your transaction, it will revert.
          </div>
        </div>
      </div>

      {/* Preset chips */}
      <div className="flex gap-2">
        {PRESETS.map((preset) => {
          const active = slippageBps === preset.bps;
          return (
            <button
              key={preset.bps}
              type="button"
              onClick={() => onSlippageChange(preset.bps)}
              className={`flex-1 py-2 text-sm font-medium transition-none ${
                active
                  ? "bg-brass-muted border border-brass-border text-brass"
                  : "bg-ax-secondary border border-border-default text-text-secondary hover:border-border-hover"
              }`}
            >
              {preset.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
