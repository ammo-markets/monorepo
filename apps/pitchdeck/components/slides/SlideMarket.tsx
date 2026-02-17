import { SlideLayout } from "../SlideLayout";
import { MARKET_STATS } from "@/lib/slideData";

const TIERS = [
  {
    label: "TAM",
    name: MARKET_STATS.tam,
    value: MARKET_STATS.tamValue,
    detail: "US ammunition market (annual)",
    width: "w-full",
    opacity: "opacity-30",
  },
  {
    label: "SAM",
    name: MARKET_STATS.sam,
    value: MARKET_STATS.samValue,
    detail: `Online / accessible segment (${MARKET_STATS.samPercent})`,
    width: "w-3/4",
    opacity: "opacity-50",
  },
  {
    label: "SOM",
    name: MARKET_STATS.som,
    value: MARKET_STATS.somValue,
    detail: `Initial target (${MARKET_STATS.somPercent})`,
    width: "w-1/2",
    opacity: "opacity-100",
  },
];

export function SlideMarket() {
  return (
    <SlideLayout>
      <h2 className="mb-2 text-5xl font-bold text-text">Market Opportunity</h2>
      <p className="mb-10 text-lg text-text-muted">
        US ammunition -- a massive, underserved commodity market
      </p>

      <div className="mb-6 flex flex-1 flex-col items-center justify-center gap-4">
        {TIERS.map((tier) => (
          <div
            key={tier.label}
            className={`${tier.width} rounded-xl border border-brass bg-brass ${tier.opacity} flex items-center justify-between px-8 py-5`}
          >
            <div>
              <span className="text-sm font-bold text-background">
                {tier.label}
              </span>
              <span className="ml-3 text-sm text-background/80">
                {tier.detail}
              </span>
            </div>
            <span className="text-3xl font-bold text-background">
              {tier.value}
            </span>
          </div>
        ))}
      </div>

      <p className="mb-6 text-center text-base text-text-muted">
        {MARKET_STATS.globalDimension}
      </p>

      <div className="flex items-center justify-center gap-12">
        <div className="text-center">
          <p className="text-4xl font-bold text-brass">
            {MARKET_STATS.gunOwnership}
          </p>
          <p className="mt-1 text-sm text-text-muted">
            US households own firearms
          </p>
        </div>
        <div className="text-center">
          <p className="text-4xl font-bold text-brass">
            {MARKET_STATS.regularBuyers}
          </p>
          <p className="mt-1 text-sm text-text-muted">
            of gun owners buy ammo regularly
          </p>
        </div>
      </div>
    </SlideLayout>
  );
}
