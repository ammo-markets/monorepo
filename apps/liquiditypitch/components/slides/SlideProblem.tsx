import { SlideLayout } from "../SlideLayout";
import { StaggerContainer, StaggerItem } from "../StaggerContainer";
import { PROBLEM_HOOK, PROBLEM_POINTS } from "@/lib/slideData";

export function SlideProblem() {
  return (
    <SlideLayout>
      <h2 className="mb-2 font-display text-2xl font-bold uppercase tracking-tight text-text sm:text-4xl lg:text-5xl">
        Why We Need You
      </h2>
      <p className="mb-4 text-sm text-text-muted sm:mb-6 sm:text-base lg:mb-10 lg:text-lg">
        {PROBLEM_HOOK}
      </p>

      <StaggerContainer
        preset="magazine-load"
        className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6"
      >
        {PROBLEM_POINTS.map((point) => (
          <StaggerItem key={point.icon}>
            <div className="card-hover flex h-full flex-col rounded-none border border-surface-elevated bg-surface p-4 sm:p-6 lg:p-8">
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-surface-elevated text-4xl font-bold text-brass">
                {point.icon}
              </div>
              <h3 className="mb-3 text-xl font-semibold text-text">
                {point.headline}
              </h3>
              <p className="text-base leading-relaxed text-text-secondary">
                {point.detail}
              </p>
            </div>
          </StaggerItem>
        ))}
      </StaggerContainer>
    </SlideLayout>
  );
}
