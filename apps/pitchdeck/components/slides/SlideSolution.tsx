import { SlideLayout } from "../SlideLayout";
import { StaggerContainer, StaggerItem } from "../StaggerContainer";

const STEPS = [
  {
    step: "1",
    icon: "💵",
    title: "Users Pay Us",
    description:
      "Deposit USDC to purchase ammunition tokens for any supported caliber and type.",
  },
  {
    step: "2",
    icon: "🪙",
    title: "We Mint Tokens",
    description:
      "ERC-20 tokens are minted by caliber + type. 1 token = 1 round, fully backed.",
  },
  {
    step: "3",
    icon: "📦",
    title: "We Buy the Underlying",
    description:
      "Physical ammunition is purchased and stored via our AmmoSquared partnership.",
  },
  {
    step: "4",
    icon: "🔥",
    title: "Redeem for Physical",
    description:
      "Verified US residents burn tokens and receive physical ammunition shipped to their door.",
  },
];

export function SlideSolution() {
  return (
    <SlideLayout>
      <h2 className="mb-2 font-display text-2xl font-bold uppercase tracking-tight text-text sm:text-4xl lg:text-5xl">
        How It Works
      </h2>
      <p className="mb-4 text-sm text-text-muted sm:mb-6 sm:text-base lg:mb-10 lg:text-lg">
        Works like Tether USD or PAX Gold — redeem tokens for the underlying
        asset at any time.
      </p>

      <StaggerContainer
        preset="firing-sequence"
        className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4 lg:gap-8"
      >
        {STEPS.map((step) => (
          <StaggerItem key={step.step} preset="firing-sequence">
            <div className="card-hover flex h-full flex-col items-center rounded-none border border-surface-elevated bg-surface p-4 text-center sm:p-6 lg:p-8">
              <div className="mb-4 flex h-40 w-40 items-center justify-center rounded-full bg-surface-elevated text-7xl font-bold text-brass">
                {step.icon}
              </div>
              <h3 className="mb-3 text-xl font-semibold text-text">
                {step.title}
              </h3>
              <p className="text-base leading-relaxed text-text-secondary">
                {step.description}
              </p>
            </div>
          </StaggerItem>
        ))}
      </StaggerContainer>
    </SlideLayout>
  );
}
