import { SlideLayout } from "../SlideLayout";
import { FEE_TABLE, REVENUE_PROJECTION } from "@/lib/slideData";

export function SlideRevenue() {
  return (
    <SlideLayout>
      <h2 className="mb-2 text-5xl font-bold text-text">Revenue Model</h2>
      <p className="mb-10 text-lg text-text-muted">
        Protocol fees on every mint and redeem, plus wholesale procurement
        margins
      </p>

      <div className="grid grid-cols-2 gap-8">
        {/* Fee table */}
        <div className="rounded-xl border border-surface-elevated bg-surface p-6">
          <h3 className="mb-4 text-xl font-semibold text-brass">
            Fee Structure
          </h3>
          <div className="space-y-4">
            {FEE_TABLE.map((fee) => (
              <div
                key={fee.label}
                className="flex items-start justify-between border-b border-surface-elevated pb-3 last:border-0"
              >
                <div>
                  <p className="font-semibold text-text">{fee.label}</p>
                  <p className="text-sm text-text-muted">{fee.description}</p>
                </div>
                <span className="ml-4 shrink-0 text-2xl font-bold text-brass">
                  {fee.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue projection */}
        <div className="flex flex-col gap-6">
          <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-brass/30 bg-surface p-8 text-center">
            <p className="mb-2 text-sm font-semibold text-text-muted">
              Revenue Projection
            </p>
            <p className="text-2xl text-text-secondary">
              <span className="font-bold text-brass">
                {REVENUE_PROJECTION.som}
              </span>{" "}
              SOM{" "}
              <span className="text-text-muted">&times;</span>{" "}
              <span className="font-bold text-brass">
                {REVENUE_PROJECTION.feeRate}
              </span>{" "}
              fees
            </p>
            <p className="mt-4 text-5xl font-bold text-brass">
              {REVENUE_PROJECTION.arr}
            </p>
            <p className="mt-2 text-sm text-text-muted">
              {REVENUE_PROJECTION.label}
            </p>
          </div>

          <div className="rounded-xl border border-brass/30 bg-surface p-6 text-center">
            <p className="text-3xl font-bold text-brass">3% round-trip</p>
            <p className="mt-2 text-sm text-text-muted">
              1.5% mint + 1.5% redeem &middot; Max 5% hard cap on-chain
            </p>
          </div>
        </div>
      </div>
    </SlideLayout>
  );
}
