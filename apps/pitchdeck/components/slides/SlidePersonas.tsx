import { SlideLayout } from "../SlideLayout";
import { StaggerContainer, StaggerItem } from "../StaggerContainer";
import { PERSONA_DATA } from "@/lib/slideData";

export function SlidePersonas() {
  return (
    <SlideLayout>
      <h2 className="mb-2 font-display text-5xl font-bold uppercase tracking-tight text-text">
        Who Trades This
      </h2>
      <p className="mb-10 text-lg text-text-muted">
        Three beachhead users who need ammunition price exposure today
      </p>

      <StaggerContainer
        preset="magazine-load"
        className="grid flex-1 grid-cols-3 gap-8"
      >
        {PERSONA_DATA.map((persona) => (
          <StaggerItem key={persona.title}>
            <div className="card-hover flex h-full flex-col rounded-none border border-surface-elevated bg-surface p-8">
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
