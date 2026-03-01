export default function MarketLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 lg:px-8 lg:py-10">
      {/* Heading */}
      <div className="mb-8">
        <div className="mb-2 h-8 w-40 rounded shimmer" />
        <div className="h-5 w-64 rounded shimmer" />
      </div>

      {/* Time selector */}
      <div className="mb-6 flex gap-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-8 w-14 rounded-md shimmer" />
        ))}
      </div>

      {/* Table */}
      <div
        className="overflow-hidden rounded-xl"
        style={{
          backgroundColor: "var(--bg-secondary)",
          border: "1px solid var(--border-default)",
        }}
      >
        {/* Header row */}
        <div
          className="flex items-center gap-4 px-6 py-3"
          style={{ borderBottom: "1px solid var(--border-default)" }}
        >
          <div className="h-4 w-20 rounded shimmer" />
          <div className="ml-auto flex gap-8">
            {[1, 2, 3].map((j) => (
              <div key={j} className="h-4 w-16 rounded shimmer" />
            ))}
          </div>
        </div>
        {/* Data rows */}
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="flex items-center gap-4 px-6 py-5"
            style={{
              borderBottom: i < 4 ? "1px solid var(--border-default)" : "none",
            }}
          >
            <div className="h-6 w-6 rounded shimmer" />
            <div className="h-5 w-28 rounded shimmer" />
            <div className="ml-auto flex gap-8">
              {[1, 2, 3].map((j) => (
                <div key={j} className="h-5 w-20 rounded shimmer" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
