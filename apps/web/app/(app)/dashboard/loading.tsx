export default function DashboardLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 lg:px-8 lg:py-10">
      {/* Heading */}
      <div className="mb-8">
        <div className="mb-2 h-8 w-48 rounded shimmer" />
        <div className="h-5 w-72 rounded shimmer" />
      </div>

      {/* Stats cards */}
      <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-xl p-5"
            style={{
              backgroundColor: "var(--bg-secondary)",
              border: "1px solid var(--border-default)",
            }}
          >
            <div className="mb-3 h-4 w-24 rounded shimmer" />
            <div className="h-8 w-32 rounded shimmer" />
          </div>
        ))}
      </div>

      {/* Orders list */}
      <div
        className="overflow-hidden rounded-xl"
        style={{
          backgroundColor: "var(--bg-secondary)",
          border: "1px solid var(--border-default)",
        }}
      >
        <div
          className="px-6 py-4"
          style={{ borderBottom: "1px solid var(--border-default)" }}
        >
          <div className="h-5 w-32 rounded shimmer" />
        </div>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex items-center gap-4 px-6 py-5"
            style={{
              borderBottom: i < 3 ? "1px solid var(--border-default)" : "none",
            }}
          >
            <div className="h-5 w-24 rounded shimmer" />
            <div className="h-5 w-16 rounded-full shimmer" />
            <div className="ml-auto flex gap-6">
              <div className="h-5 w-20 rounded shimmer" />
              <div className="h-5 w-16 rounded shimmer" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
