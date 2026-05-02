import { SlideLayout } from "../SlideLayout";
import { StaggerContainer, StaggerItem } from "../StaggerContainer";
import { RETURN_POINTS } from "@/lib/slideData";

export function SlideReturns() {
  return (
    <SlideLayout>
      <h2 className="mb-2 font-display text-2xl font-bold uppercase tracking-tight text-text sm:text-4xl lg:text-5xl">
        What You Get Back
      </h2>
      <p className="mb-4 text-sm text-text-muted sm:mb-6 sm:text-base lg:mb-10 lg:text-lg">
        Three return streams: trading fees, farming upside, and a hard downside
        floor.
      </p>

      <StaggerContainer
        preset="firing-sequence"
        className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6 lg:gap-8"
      >
        {RETURN_POINTS.map((point) => (
          <StaggerItem key={point.title} preset="firing-sequence">
            <div className="card-hover flex h-full flex-col rounded-none border border-surface-elevated bg-surface p-4 sm:p-6 lg:p-8">
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-surface-elevated text-4xl font-bold text-brass">
                {point.icon}
              </div>
              <h3 className="mb-3 font-display text-2xl font-bold uppercase tracking-tight text-brass">
                {point.title}
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
