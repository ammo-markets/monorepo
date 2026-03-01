export default function TradeLoading() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8 lg:py-10">
      {/* Heading */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-2 h-8 w-32 rounded shimmer" />
        <div className="mx-auto h-5 w-56 rounded shimmer" />
      </div>

      {/* Tabs */}
      <div className="mx-auto mb-6 flex w-fit gap-2">
        <div className="h-9 w-20 rounded-lg shimmer" />
        <div className="h-9 w-20 rounded-lg shimmer" />
      </div>

      {/* Form area */}
      <div
        className="rounded-xl p-6"
        style={{
          backgroundColor: "var(--bg-secondary)",
          border: "1px solid var(--border-default)",
        }}
      >
        <div className="mb-4 h-5 w-24 rounded shimmer" />
        <div className="mb-6 h-12 w-full rounded-lg shimmer" />
        <div className="mb-4 h-5 w-20 rounded shimmer" />
        <div className="mb-6 h-12 w-full rounded-lg shimmer" />
        <div className="h-12 w-full rounded-lg shimmer" />
      </div>
    </div>
  );
}
