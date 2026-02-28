import { Clock, Info } from "lucide-react";

const PRESETS = [
  { label: "24h", value: 24 },
  { label: "36h", value: 36 },
  { label: "48h", value: 48 },
  { label: "None", value: 0 },
] as const;

export function DeadlinePicker({
  deadlineHours,
  onDeadlineChange,
}: {
  deadlineHours: number;
  onDeadlineChange: (hours: number) => void;
}) {
  return (
    <div className="mt-5">
      {/* Label row */}
      <div className="mb-2.5 flex items-center gap-1.5">
        <Clock
          size={14}
          className="shrink-0"
          style={{ color: "var(--text-muted)" }}
        />
        <span
          className="text-xs font-medium uppercase tracking-wide"
          style={{ color: "var(--text-muted)" }}
        >
          Order Expiry
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
            How long the order stays open. After the deadline, you can cancel
            and get your funds back. &quot;None&quot; means only the admin can
            finalize or cancel.
          </div>
        </div>
      </div>

      {/* Preset chips */}
      <div className="flex gap-2">
        {PRESETS.map((preset) => {
          const active = deadlineHours === preset.value;
          return (
            <button
              key={preset.value}
              type="button"
              onClick={() => onDeadlineChange(preset.value)}
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
