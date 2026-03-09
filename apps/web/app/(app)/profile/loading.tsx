export default function ProfileLoading() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      {/* Heading */}
      <div className="mb-2 h-8 w-28 rounded shimmer" />
      <div className="mb-8 h-5 w-48 rounded shimmer" />

      <div className="flex flex-col gap-6">
        {/* Wallet section */}
        <div
          className="rounded-xl p-5"
          style={{
            backgroundColor: "var(--bg-secondary)",
            border: "1px solid var(--border-default)",
          }}
        >
          <div className="mb-3 h-4 w-20 rounded shimmer" />
          <div className="h-5 w-full max-w-sm rounded shimmer" />
        </div>

        {/* Address section */}
        <div
          className="rounded-xl p-5"
          style={{
            backgroundColor: "var(--bg-secondary)",
            border: "1px solid var(--border-default)",
          }}
        >
          <div className="mb-3 h-4 w-44 rounded shimmer" />
          <div className="space-y-2">
            <div className="h-5 w-40 rounded shimmer" />
            <div className="h-5 w-52 rounded shimmer" />
            <div className="h-5 w-36 rounded shimmer" />
          </div>
        </div>
      </div>
    </div>
  );
}
