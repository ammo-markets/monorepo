import { SlideLayout } from "../SlideLayout";
import { StaggerContainer, StaggerItem } from "../StaggerContainer";
import { WHY_NOW_HOOK, WHY_NOW_POINTS } from "@/lib/slideData";

export function SlideWhyNow() {
  return (
    <SlideLayout>
      <h2 className="mb-2 font-display text-2xl font-bold uppercase tracking-tight text-text sm:text-4xl lg:text-5xl">
        Why Now
      </h2>
      <p className="mb-4 text-sm text-text-muted sm:mb-6 sm:text-base lg:mb-10 lg:text-lg">
        {WHY_NOW_HOOK}
      </p>

      <StaggerContainer
        preset="magazine-load"
        className="grid flex-1 grid-cols-2 gap-3 sm:gap-6"
      >
        {WHY_NOW_POINTS.map((point) => (
          <StaggerItem key={point.stat}>
            <div className="card-hover flex flex-col items-center justify-center rounded-none border border-surface-elevated bg-surface p-4 text-center sm:p-6 lg:p-8">
              <p className="text-2xl font-bold text-brass sm:text-4xl lg:text-5xl">
                {point.stat}
              </p>
              <p className="mt-3 text-base text-text-secondary">
                {point.label}
              </p>
            </div>
          </StaggerItem>
        ))}
      </StaggerContainer>
    </SlideLayout>
  );
}
