import Link from "next/link";

export function AmmoLogo({ size = "default" }: { size?: "small" | "default" }) {
  const markSize = size === "small" ? 28 : 36;
  const textClass =
    size === "small"
      ? "text-sm tracking-[0.08em]"
      : "text-base tracking-[0.08em]";

  return (
    <Link
      href="/"
      className="flex items-center gap-2.5"
      aria-label="Ammo Markets Home"
    >
      {/* Geometric mark: bullet casing cross-section with exchange/rotation primer */}
      <svg
        className="text-brass shrink-0"
        width={markSize}
        height={markSize}
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Outer casing silhouette */}
        <rect
          x="4"
          y="2"
          width="28"
          height="32"
          rx="3"
          stroke="currentColor"
          strokeWidth="1.5"
          fill="none"
        />
        {/* Casing shoulder taper */}
        <line
          x1="4"
          y1="10"
          x2="32"
          y2="10"
          stroke="currentColor"
          strokeWidth="1"
          opacity="0.4"
        />
        {/* Primer circle — doubles as exchange symbol */}
        <circle
          cx="18"
          cy="24"
          r="6.5"
          stroke="currentColor"
          strokeWidth="1.5"
          fill="none"
        />
        {/* Exchange arrows inside primer */}
        <path
          d="M15 22.5L18 20L21 22.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <path
          d="M21 25.5L18 28L15 25.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
      {/* Wordmark */}
      <span className={`${textClass} font-semibold leading-none select-none`}>
        <span style={{ color: "var(--brass)" }}>AMMO</span>
        <span className="ml-1 text-text-primary">MARKETS</span>
      </span>
    </Link>
  );
}
