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
      role="tablist"
      aria-label="Time range"
    >
      {ranges.map((range) => {
        const isActive = selected === range;
        return (
          <button
            key={range}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onSelect(range)}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all duration-150 ${
              isActive
                ? "bg-brass text-ax-primary"
                : "bg-transparent text-text-secondary hover:bg-ax-tertiary hover:text-text-primary"
            }`}
          >
            {range}
          </button>
        );
      })}
    </div>
  );
}
