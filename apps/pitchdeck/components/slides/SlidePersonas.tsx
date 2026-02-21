import { SlideLayout } from "../SlideLayout";
import { StaggerContainer, StaggerItem } from "../StaggerContainer";
import { PERSONA_DATA } from "@/lib/slideData";

export function SlidePersonas() {
  return (
    <SlideLayout>
      <h2 className="mb-2 font-display text-2xl font-bold uppercase tracking-tight text-text sm:text-4xl lg:text-5xl">
        Who Trades This
      </h2>
      <p className="mb-4 text-sm text-text-muted sm:mb-6 sm:text-base lg:mb-10 lg:text-lg">
        Three beachhead users who need ammunition price exposure today
      </p>

      <StaggerContainer
        preset="magazine-load"
        className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-8"
      >
        {PERSONA_DATA.map((persona) => (
          <StaggerItem key={persona.title}>
            <div className="card-hover flex h-full flex-col rounded-none border border-surface-elevated bg-surface p-4 sm:p-6 lg:p-8">
              <h3 className="mb-4 font-display text-2xl font-bold uppercase tracking-tight text-brass">
                {persona.title}
              </h3>
              <p className="mb-6 text-base leading-relaxed text-text-secondary">
                {persona.description}
              </p>
              <div className="mt-auto rounded-none border border-brass/30 bg-surface-elevated px-4 py-3">
                <p className="text-sm font-semibold text-brass">Motivation</p>
                <p className="mt-1 text-sm text-text-secondary">
                  {persona.motivation}
                </p>
              </div>
            </div>
          </StaggerItem>
        ))}
      </StaggerContainer>
    </SlideLayout>
  );
}
