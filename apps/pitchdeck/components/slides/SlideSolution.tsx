import { SlideLayout } from "../SlideLayout";

const STEPS = [
  {
    step: "1",
    icon: "USDC",
    title: "Deposit USDC",
    description:
      "Users deposit USDC stablecoins to initiate a mint request for any supported caliber token.",
  },
  {
    step: "2",
    icon: "AX",
    title: "Receive Ammo Tokens",
    description:
      "After admin verification and procurement, ERC-20 ammo tokens are minted to the user's wallet. 1 token = 1 round.",
  },
  {
    step: "3",
    icon: "PKG",
    title: "Redeem for Physical",
    description:
      "Verified US residents in allowed states can burn tokens and receive physical ammunition shipped to their door.",
  },
];

export function SlideSolution() {
  return (
    <SlideLayout>
      <h2 className="mb-2 text-5xl font-bold text-text">The Solution</h2>
      <p className="mb-10 text-lg text-text-muted">
        Tokenized ammunition -- global price exposure, optional physical
        delivery
      </p>

      <div className="mb-10 grid flex-1 grid-cols-3 gap-8">
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

      <div className="flex items-center justify-center gap-8">
        <div className="rounded-lg border border-brass/30 bg-surface px-6 py-3 text-center">
          <p className="text-sm text-text-muted">Global access</p>
          <p className="font-semibold text-brass">
            Anyone worldwide can get price exposure
          </p>
        </div>
        <div className="rounded-lg border border-brass/30 bg-surface px-6 py-3 text-center">
          <p className="text-sm text-text-muted">Physical delivery</p>
          <p className="font-semibold text-brass">
            Only verified US residents can redeem
          </p>
        </div>
      </div>
    </SlideLayout>
  );
}
