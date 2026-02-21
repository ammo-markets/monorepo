import type { ReactNode } from "react";

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
      id="how-it-works"
      className="border-b border-border-default bg-ax-primary"
    >
      <div className="mx-auto w-full max-w-7xl border-x border-border-default">
        {/* Section Header */}
        <div className="px-8 py-12 border-b border-border-default bg-ax-secondary/30">
          <h2 className="font-display text-4xl lg:text-5xl font-bold uppercase tracking-tight text-text-primary">
            How It Works
          </h2>
          <div className="mt-4 h-1 w-16 bg-brass" />
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-border-default">
          {steps.map((step) => {
            const Illustration = step.illustration;
            return (
              <div
                key={step.number}
                className="relative p-8 flex flex-col group hover:bg-ax-secondary/50 transition-colors"
              >
                {/* Step number */}
                <div className="mb-12 font-mono text-5xl font-bold tracking-tighter text-border-hover group-hover:text-brass transition-colors">
                  // {step.number}
                </div>

                <div className="mb-8 flex items-center justify-start opacity-70 group-hover:opacity-100 transition-opacity">
                  <Illustration />
                </div>

                <h3 className="mb-4 font-display text-2xl font-bold uppercase text-text-primary">
                  {step.title}
                </h3>

                <p className="text-sm leading-relaxed text-text-secondary font-sans">
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
