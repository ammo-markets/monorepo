"use client";

const ranges = ["24H", "7D", "30D", "90D", "1Y", "ALL"] as const;
export type TimeRange = (typeof ranges)[number];

interface TimeRangeSelectorProps {
  selected: TimeRange;
  onSelect: (range: TimeRange) => void;
}

export function TimeRangeSelector({
  selected,
  onSelect,
}: TimeRangeSelectorProps) {
  return (
    <div
      className="flex items-center rounded-lg p-1"
      style={{
        backgroundColor: "var(--bg-secondary)",
        border: "1px solid var(--border-default)",
      }}
      role="group"
      aria-label="Time range"
    >
      {ranges.map((range) => {
        const isActive = selected === range;
        return (
          <button
            key={range}
            type="button"
            onClick={() => onSelect(range)}
            className="rounded-md px-3 py-1.5 text-xs font-medium transition-all duration-150"
            style={{
              backgroundColor: isActive ? "var(--brass)" : "transparent",
              color: isActive ? "var(--bg-primary)" : "var(--text-secondary)",
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                e.currentTarget.style.color = "var(--text-primary)";
                e.currentTarget.style.backgroundColor = "var(--bg-tertiary)";
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                e.currentTarget.style.color = "var(--text-secondary)";
                e.currentTarget.style.backgroundColor = "transparent";
              }
            }}
            aria-pressed={isActive}
          >
            {range}
          </button>
        );
      })}
    </div>
  );
}
