import { SlideLayout } from "../SlideLayout";
import { StaggerContainer, StaggerItem } from "../StaggerContainer";
import { WHY_NOW_HOOK, WHY_NOW_POINTS } from "@/lib/slideData";

export function SlideWhyNow() {
  return (
    <SlideLayout>
      <h2 className="mb-2 font-display text-5xl font-bold uppercase tracking-tight text-text">
        Why Now
      </h2>
      <p className="mb-10 text-lg text-text-muted">{WHY_NOW_HOOK}</p>

      <StaggerContainer
        preset="magazine-load"
        className="grid flex-1 grid-cols-2 gap-6"
      >
        {WHY_NOW_POINTS.map((point) => (
          <StaggerItem key={point.stat}>
            <div className="card-hover flex flex-col items-center justify-center rounded-none border border-surface-elevated bg-surface p-8 text-center">
              <p className="text-5xl font-bold text-brass">{point.stat}</p>
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
