export function HeaderSkeleton() {
  return (
    <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <div className="mb-3 h-7 w-28 rounded shimmer" />
        <div className="mb-2 h-10 w-40 rounded shimmer" />
        <div className="h-5 w-32 rounded shimmer" />
      </div>
      <div className="h-10 w-44 rounded-lg shimmer" />
    </div>
  );
}

export function PortfolioHeroSkeleton() {
  return (
    <div>
      {/* Title shimmer */}
      <div className="mb-6 h-4 w-24 rounded shimmer" />

      {/* Chart + legend row */}
      <div className="flex flex-col items-center gap-8 sm:flex-row sm:items-start sm:gap-10">
        {/* Donut placeholder */}
        <div className="flex h-[180px] w-[180px] shrink-0 items-center justify-center sm:h-[200px] sm:w-[200px]">
          <div className="h-[170px] w-[170px] rounded-full shimmer sm:h-[170px] sm:w-[170px]" />
        </div>

        {/* Legend shimmer */}
        <div className="flex w-full flex-col gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="h-2.5 w-2.5 shrink-0 rounded-sm shimmer" />
              <div className="h-4 w-10 rounded shimmer" />
              <div className="h-2 flex-1 rounded-full shimmer" />
              <div className="h-4 w-8 rounded shimmer" />
              <div className="h-4 w-16 rounded shimmer" />
            </div>
          ))}
        </div>
      </div>

      {/* Card grid shimmer */}
      <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-xl p-4"
            style={{
              backgroundColor: "var(--bg-secondary)",
              border: "1px solid var(--border-default)",
            }}
          >
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 rounded shimmer" />
              <div className="h-4 w-10 rounded shimmer" />
            </div>
            <div className="mt-3 space-y-2">
              <div className="h-3 w-20 rounded shimmer" />
              <div className="h-5 w-16 rounded shimmer" />
            </div>
            <div className="mt-3 flex gap-2">
              <div className="h-7 flex-1 rounded-md shimmer" />
              <div className="h-7 flex-1 rounded-md shimmer" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function HoldingsTableSkeleton() {
  return (
    <div
      className="overflow-hidden rounded-xl"
      style={{
        backgroundColor: "var(--bg-secondary)",
        border: "1px solid var(--border-default)",
      }}
    >
      {[1, 2].map((i) => (
        <div
          key={i}
          className="flex items-center gap-4 px-6 py-5"
          style={{
            borderBottom: i < 2 ? "1px solid var(--border-default)" : "none",
          }}
        >
          <div className="h-6 w-6 rounded shimmer" />
          <div className="h-5 w-32 rounded shimmer" />
          <div className="ml-auto flex gap-8">
            {[1, 2, 3].map((j) => (
              <div key={j} className="h-5 w-16 rounded shimmer" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function ActiveOrdersSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {[1, 2].map((i) => (
        <div
          key={i}
          className="h-16 rounded-xl shimmer"
          style={{ border: "1px solid var(--border-default)" }}
        />
      ))}
    </div>
  );
}

export function OrdersTableSkeleton() {
  return (
    <div
      className="overflow-hidden rounded-xl"
      style={{
        backgroundColor: "var(--bg-secondary)",
        border: "1px solid var(--border-default)",
      }}
    >
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="flex items-center gap-4 px-6 py-5"
          style={{
            borderBottom: i < 3 ? "1px solid var(--border-default)" : "none",
          }}
        >
          <div className="h-5 w-28 rounded shimmer" />
          <div className="h-5 w-14 rounded-full shimmer" />
          <div className="h-5 w-10 rounded shimmer" />
          <div className="ml-auto flex gap-6">
            {[1, 2, 3].map((j) => (
              <div key={j} className="h-5 w-20 rounded shimmer" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
