import { SlideLayout } from "../SlideLayout";

const MILESTONES = [
  { label: "Smart Contracts", value: "13", detail: "Deployed on Fuji testnet" },
  { label: "Caliber Tokens", value: "4", detail: "9mm, 5.56, .22 LR, .308" },
  {
    label: "Full Flow",
    value: "Live",
    detail: "Mint, redeem, admin finalization",
  },
  {
    label: "Web Dashboard",
    value: "Live",
    detail: "Next.js 15 with wallet integration",
  },
];

const ACHIEVEMENTS = [
  "Complete smart contract suite with role-based access control",
  "USDC integration for stablecoin payments",
  "Admin dashboard for order management and finalization",
  "Event-driven worker for on-chain monitoring",
  "Full TypeScript monorepo with shared types",
  "Investor pitch deck with static export",
];

export function SlideTraction() {
  return (
    <SlideLayout>
      <h2 className="mb-2 text-5xl font-bold text-text">Traction & Demo</h2>
      <p className="mb-10 text-lg text-text-muted">
        Live on Avalanche Fuji testnet -- fully functional protocol
      </p>

      <div className="mb-8 grid grid-cols-4 gap-6">
        {MILESTONES.map((m) => (
          <div
            key={m.label}
            className="rounded-xl border border-surface-elevated bg-surface p-6 text-center"
          >
            <p className="text-3xl font-bold text-brass">{m.value}</p>
            <p className="mt-1 font-semibold text-text">{m.label}</p>
            <p className="mt-1 text-sm text-text-muted">{m.detail}</p>
          </div>
        ))}
      </div>

      <div className="mb-8 rounded-xl border border-surface-elevated bg-surface p-6">
        <h3 className="mb-4 text-lg font-semibold text-brass">
          Development Milestones
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {ACHIEVEMENTS.map((item) => (
            <div key={item} className="flex items-start gap-2">
              <span className="mt-0.5 text-green">&#10003;</span>
              <p className="text-sm text-text-secondary">{item}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-center">
        <div className="rounded-xl border-2 border-brass bg-surface px-10 py-4 text-center">
          <p className="text-xl font-bold text-brass">Try the Live Demo</p>
          <p className="mt-1 text-sm text-text-muted">
            Avalanche Fuji Testnet &middot; Coming Soon
          </p>
        </div>
      </div>
    </SlideLayout>
  );
}
