import { SlideLayout } from "../SlideLayout";
import { StaggerContainer, StaggerItem } from "../StaggerContainer";
import { FEE_TABLE, REVENUE_PROJECTION } from "@/lib/slideData";

export function SlideRevenue() {
  return (
    <SlideLayout>
      <h2 className="mb-2 font-display text-5xl font-bold uppercase tracking-tight text-text">
        Revenue Model
      </h2>
      <p className="mb-10 text-lg text-text-muted">
        Protocol fees on every mint and redeem, plus wholesale procurement
        margins
      </p>

      <StaggerContainer
        preset="magazine-load"
        className="grid grid-cols-2 gap-8"
      >
        <StaggerItem>
          <div className="card-hover rounded-none border border-surface-elevated bg-surface p-6">
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
                  <span className="ml-4 shrink-0 font-display text-2xl font-bold uppercase text-brass">
                    {fee.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </StaggerItem>

        <StaggerItem>
          <div className="flex h-full flex-col gap-6">
            <div className="card-hover flex flex-1 flex-col items-center justify-center rounded-none border border-brass/30 bg-surface p-8 text-center">
              <p className="mb-2 text-sm font-semibold text-text-muted">
                Revenue Projection
              </p>
              <p className="text-2xl text-text-secondary">
                <span className="font-bold text-brass">
                  {REVENUE_PROJECTION.som}
                </span>{" "}
                SOM <span className="text-text-muted">&times;</span>{" "}
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

            <div className="card-hover rounded-none border border-brass/30 bg-surface p-6 text-center">
              <p className="font-display text-3xl font-bold uppercase text-brass">
                3% round-trip
              </p>
              <p className="mt-2 text-sm text-text-muted">
                1.5% mint + 1.5% redeem &middot; Max 5% hard cap on-chain
              </p>
            </div>
          </div>
        </StaggerItem>
      </StaggerContainer>
    </SlideLayout>
  );
}
