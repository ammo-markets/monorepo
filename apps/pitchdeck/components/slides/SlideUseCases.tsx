import { SlideLayout } from "../SlideLayout";
import { StaggerContainer, StaggerItem } from "../StaggerContainer";
import { USE_CASE_DATA } from "@/lib/slideData";

export function SlideUseCases() {
  return (
    <SlideLayout>
      <h2 className="mb-2 font-display text-2xl font-bold uppercase tracking-tight text-text sm:text-4xl lg:text-5xl">
        DeFi Composability
      </h2>
      <p className="mb-4 text-sm text-text-muted sm:mb-6 sm:text-base lg:mb-10 lg:text-lg">
        Once tokenized, ammo tokens work within the DeFi ecosystem like any
        other token — with limitless potential.
      </p>

      <StaggerContainer
        preset="magazine-load"
        className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4 lg:gap-8"
      >
        {USE_CASE_DATA.map((useCase) => (
          <StaggerItem key={useCase.title}>
            <div className="card-hover flex h-full flex-col rounded-none border border-surface-elevated bg-surface p-4 sm:p-6 lg:p-8">
              <h3 className="mb-4 font-display text-2xl font-bold uppercase tracking-tight text-brass">
                {useCase.title}
              </h3>
              <p className="text-base leading-relaxed text-text-secondary">
                {useCase.description}
              </p>
            </div>
          </StaggerItem>
        ))}
      </StaggerContainer>
    </SlideLayout>
  );
}
