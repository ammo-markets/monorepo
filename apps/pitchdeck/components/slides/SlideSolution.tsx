import { SlideLayout } from "../SlideLayout";

const STEPS = [
  {
    step: "1",
    icon: "USDC",
    title: "Deposit USDC",
    description: "Deposit stablecoins to mint any supported caliber token.",
  },
  {
    step: "2",
    icon: "AX",
    title: "Receive Ammo Tokens",
    description:
      "ERC-20 tokens are minted to your wallet. 1 token = 1 round.",
  },
  {
    step: "3",
    icon: "PKG",
    title: "Redeem for Physical",
    description:
      "Verified US residents burn tokens and receive ammo shipped to their door.",
  },
];

export function SlideSolution() {
  return (
    <SlideLayout>
      <h2 className="mb-2 text-5xl font-bold text-text">The Solution</h2>
      <p className="mb-10 text-lg text-text-muted">
        Anyone on earth can trade ammo prices. Only verified Americans take
        delivery.
      </p>

      <div className="grid flex-1 grid-cols-3 gap-8">
        {STEPS.map((step) => (
          <div
            key={step.step}
            className="flex flex-col items-center rounded-xl border border-surface-elevated bg-surface p-8 text-center"
          >
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-surface-elevated text-xl font-bold text-brass">
              {step.icon}
            </div>
            <h3 className="mb-3 text-xl font-semibold text-text">
              {step.title}
            </h3>
            <p className="text-base leading-relaxed text-text-secondary">
              {step.description}
            </p>
          </div>
        ))}
      </div>
    </SlideLayout>
  );
}
