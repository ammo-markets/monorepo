import { SlideLayout } from "../SlideLayout";
import { StaggerContainer, StaggerItem } from "../StaggerContainer";

const CAPABILITIES = [
  {
    label: "Caliber Tokens",
    value: "4",
    detail: "9mm, 5.56, .22 LR, .308",
    isLive: false,
  },
  {
    label: "Protocol Flow",
    value: "Live",
    detail: "Mint, redeem, admin finalization",
    isLive: true,
  },
  {
    label: "Web Dashboard",
    value: "Live",
    detail: "Next.js 15 + wallet integration",
    isLive: true,
  },
  {
    label: "Testnet",
    value: "Live",
    detail: "Deployed on testnet",
    isLive: true,
  },
];

export function SlideTraction() {
  return (
    <SlideLayout>
      <h2 className="mb-2 text-5xl font-bold text-text">
        Built &amp; Ready
      </h2>
      <p className="mb-10 text-lg text-text-muted">
        Live on testnet -- fully functional protocol
      </p>

      <StaggerContainer preset="firing-sequence" className="mb-8 grid flex-1 grid-cols-4 gap-6">
        {CAPABILITIES.map((cap) => (
          <StaggerItem key={cap.label} preset="firing-sequence">
            <div className="card-hover flex h-full flex-col items-center justify-center rounded-xl border border-surface-elevated bg-surface p-6 text-center">
              <p className={`text-3xl font-bold text-brass ${cap.isLive ? "live-dot" : ""}`}>
                {cap.value}
              </p>
              <p className="mt-1 font-semibold text-text">{cap.label}</p>
              <p className="mt-1 text-sm text-text-muted">{cap.detail}</p>
            </div>
          </StaggerItem>
        ))}
      </StaggerContainer>

      <div className="flex justify-center">
        <div className="card-hover rounded-xl border-2 border-brass bg-surface px-10 py-4 text-center">
          <p className="text-xl font-bold text-brass">Try the Live Demo</p>
          <p className="mt-1 text-sm text-text-muted">
            Testnet Demo &middot; Coming Soon
          </p>
        </div>
      </div>
    </SlideLayout>
  );
}
