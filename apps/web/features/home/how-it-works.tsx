import type { ReactNode } from "react";
function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <div className="mb-12 text-center lg:mb-16">
      <h2
        className="text-xs font-semibold uppercase tracking-[0.08em]"
        style={{ color: "var(--text-secondary)" }}
      >
        {children}
      </h2>
      <div
        className="mx-auto mt-3 h-px w-12"
        style={{ backgroundColor: "var(--brass)" }}
        aria-hidden="true"
      />
    </div>
  );
}

/** Mint illustration — USDC coin transforming into ammo tokens */
function MintIllustration() {
  return (
    <svg
      width="80"
      height="80"
      viewBox="0 0 80 80"
      fill="none"
      aria-hidden="true"
    >
      {/* USDC circle */}
      <circle
        cx="28"
        cy="40"
        r="16"
        stroke="#3498DB"
        strokeWidth="1.5"
        opacity="0.6"
      />
      <text
        x="28"
        y="44"
        textAnchor="middle"
        fill="#3498DB"
        fontSize="10"
        fontFamily="monospace"
        opacity="0.8"
      >
        $
      </text>
      {/* Arrow */}
      <path
        d="M48 40H58"
        stroke="#C6A44E"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.6"
      />
      <path
        d="M55 37L58 40L55 43"
        stroke="#C6A44E"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.6"
      />
      {/* Token */}
      <rect
        x="62"
        y="30"
        width="14"
        height="20"
        rx="2"
        stroke="#C6A44E"
        strokeWidth="1.5"
        opacity="0.8"
      />
      <circle
        cx="69"
        cy="43"
        r="3"
        stroke="#C6A44E"
        strokeWidth="1"
        opacity="0.5"
      />
    </svg>
  );
}

/** Trade illustration — two tokens with swap arrows */
function TradeIllustration() {
  return (
    <svg
      width="80"
      height="80"
      viewBox="0 0 80 80"
      fill="none"
      aria-hidden="true"
    >
      {/* Token A */}
      <rect
        x="12"
        y="28"
        width="14"
        height="24"
        rx="2"
        stroke="#C6A44E"
        strokeWidth="1.5"
        opacity="0.7"
      />
      <circle
        cx="19"
        cy="44"
        r="3"
        stroke="#C6A44E"
        strokeWidth="1"
        opacity="0.4"
      />
      {/* Swap arrows */}
      <path
        d="M32 35H48"
        stroke="#C6A44E"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.5"
      />
      <path
        d="M45 32L48 35L45 38"
        stroke="#C6A44E"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.5"
      />
      <path
        d="M48 45H32"
        stroke="#C6A44E"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.5"
      />
      <path
        d="M35 42L32 45L35 48"
        stroke="#C6A44E"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.5"
      />
      {/* Token B */}
      <rect
        x="54"
        y="28"
        width="14"
        height="24"
        rx="2"
        stroke="#6B8E4E"
        strokeWidth="1.5"
        opacity="0.7"
      />
      <circle
        cx="61"
        cy="44"
        r="3"
        stroke="#6B8E4E"
        strokeWidth="1"
        opacity="0.4"
      />
    </svg>
  );
}

/** Redeem illustration — token dissolving into shipping box */
function RedeemIllustration() {
  return (
    <svg
      width="80"
      height="80"
      viewBox="0 0 80 80"
      fill="none"
      aria-hidden="true"
    >
      {/* Dissolving token (dashed) */}
      <rect
        x="12"
        y="28"
        width="14"
        height="24"
        rx="2"
        stroke="#C6A44E"
        strokeWidth="1.5"
        strokeDasharray="3 2"
        opacity="0.4"
      />
      {/* Arrow */}
      <path
        d="M32 40H46"
        stroke="#C6A44E"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.5"
      />
      <path
        d="M43 37L46 40L43 43"
        stroke="#C6A44E"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.5"
      />
      {/* Shipping box */}
      <rect
        x="50"
        y="30"
        width="20"
        height="18"
        rx="1.5"
        stroke="#E8E8ED"
        strokeWidth="1.5"
        opacity="0.6"
      />
      <line
        x1="50"
        y1="38"
        x2="70"
        y2="38"
        stroke="#E8E8ED"
        strokeWidth="1"
        opacity="0.3"
      />
      <line
        x1="60"
        y1="30"
        x2="60"
        y2="38"
        stroke="#E8E8ED"
        strokeWidth="1"
        opacity="0.3"
      />
      {/* Box flaps open */}
      <path d="M50 30L55 25" stroke="#E8E8ED" strokeWidth="1" opacity="0.3" />
      <path d="M70 30L65 25" stroke="#E8E8ED" strokeWidth="1" opacity="0.3" />
    </svg>
  );
}

const steps = [
  {
    number: "01",
    title: "Mint",
    description:
      "Deposit USDC. We purchase ammo and store it in insured facilities. You receive tokens representing your rounds.",
    illustration: MintIllustration,
  },
  {
    number: "02",
    title: "Trade",
    description:
      "Trade tokens on decentralized exchanges. Speculate on ammo price movements. No KYC required for trading.",
    illustration: TradeIllustration,
  },
  {
    number: "03",
    title: "Redeem",
    description:
      "Burn your tokens. We ship physical ammunition to your door via UPS Ground. U.S. addresses only, age verified.",
    illustration: RedeemIllustration,
  },
];

export function HowItWorks() {
  return (
    <section
      className="py-24 px-4 lg:py-32"
      style={{ backgroundColor: "var(--bg-primary)" }}
    >
      <div className="mx-auto max-w-5xl">
        <SectionTitle>How It Works</SectionTitle>

        <div className="relative grid gap-8 md:grid-cols-3 md:gap-6 lg:gap-12">
          {/* Connecting line on desktop */}
          <div
            className="pointer-events-none absolute left-[16.67%] right-[16.67%] top-[52px] hidden h-px md:block"
            style={{ backgroundColor: "var(--border-default)" }}
            aria-hidden="true"
          />

          {steps.map((step) => {
            const Illustration = step.illustration;
            return (
              <div key={step.number} className="relative text-center">
                {/* Step number — large, behind illustration */}
                <span
                  className="pointer-events-none absolute -top-2 left-1/2 -translate-x-1/2 font-mono text-6xl font-bold tabular-nums select-none lg:text-7xl"
                  style={{ color: "var(--brass)", opacity: 0.07 }}
                  aria-hidden="true"
                >
                  {step.number}
                </span>

                {/* Illustration */}
                <div className="relative mx-auto mb-6 flex h-24 w-24 items-center justify-center">
                  <Illustration />
                </div>

                {/* Title */}
                <h3
                  className="mb-3 text-base font-semibold tracking-tight"
                  style={{ color: "var(--text-primary)" }}
                >
                  {step.title}
                </h3>

                {/* Description */}
                <p
                  className="mx-auto max-w-xs text-sm leading-relaxed"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
