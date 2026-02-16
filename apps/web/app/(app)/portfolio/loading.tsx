export default function PortfolioLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 lg:px-8 lg:py-10">
      {/* Header */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="mb-3 h-7 w-28 rounded shimmer" />
          <div className="mb-2 h-10 w-40 rounded shimmer" />
          <div className="h-5 w-32 rounded shimmer" />
        </div>
        <div className="h-10 w-44 rounded-lg shimmer" />
      </div>

      {/* Holdings table */}
      <section className="mt-10">
        <div className="mb-4 h-6 w-24 rounded shimmer" />
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
                borderBottom:
                  i < 2 ? "1px solid var(--border-default)" : "none",
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
      </section>

      {/* Orders table */}
      <section className="mt-10">
        <div className="mb-4 h-6 w-20 rounded shimmer" />
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
                borderBottom:
                  i < 3 ? "1px solid var(--border-default)" : "none",
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
      </section>
    </div>
  );
}
