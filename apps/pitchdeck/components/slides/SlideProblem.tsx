import { SlideLayout } from "../SlideLayout";
import { PROBLEM_STATS } from "@/lib/slideData";

export function SlideProblem() {
  return (
    <SlideLayout>
      <h2 className="mb-2 text-5xl font-bold text-text">The Problem</h2>
      <p className="mb-10 text-lg text-text-muted">
        A massive commodity market with zero financial infrastructure
      </p>

      <div className="grid flex-1 grid-cols-2 gap-6">
        {PROBLEM_STATS.map((stat) => (
          <div
            key={stat.icon}
            className="flex flex-col rounded-xl border border-surface-elevated bg-surface p-8"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-surface-elevated text-2xl font-bold text-brass">
              {stat.icon}
            </div>
            <h3 className="mb-3 text-xl font-semibold text-text">
              {stat.headline}
            </h3>
            <p className="text-base leading-relaxed text-text-secondary">
              {stat.detail}
            </p>
          </div>
        ))}
      </div>
    </SlideLayout>
  );
}
