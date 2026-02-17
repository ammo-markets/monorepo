import { SlideLayout } from "../SlideLayout";

const ASK_ITEMS = [
  {
    title: "Strategic Partners",
    detail: "FFL distributors, ammunition manufacturers, warehouse operators",
  },
  {
    title: "Early Investors",
    detail: "Seed funding for mainnet launch, legal, and inventory",
  },
  {
    title: "Industry Advisors",
    detail: "Firearms regulation experts, DeFi protocol designers, commodity traders",
  },
];

export function SlideAsk() {
  return (
    <SlideLayout className="items-center justify-center text-center">
      <h2 className="mb-2 text-5xl font-bold text-text">The Ask</h2>
      <p className="mb-10 text-lg text-text-muted">
        We are seeking partners to bring ammunition on-chain
      </p>

      <div className="grid grid-cols-3 gap-8">
        {ASK_ITEMS.map((item) => (
          <div
            key={item.title}
            className="rounded-xl border border-brass/30 bg-surface p-8"
          >
            <h3 className="mb-3 text-xl font-bold text-brass">{item.title}</h3>
            <p className="text-base leading-relaxed text-text-secondary">
              {item.detail}
            </p>
          </div>
        ))}
      </div>
    </SlideLayout>
  );
}
