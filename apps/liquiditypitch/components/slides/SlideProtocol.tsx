import { SlideLayout } from "../SlideLayout";
import { StaggerContainer, StaggerItem } from "../StaggerContainer";
import { PROTOCOL_POINTS } from "@/lib/slideData";

export function SlideProtocol() {
  return (
    <SlideLayout>
      <h2 className="mb-2 font-display text-2xl font-bold uppercase tracking-tight text-text sm:text-4xl lg:text-5xl">
        The Protocol, Briefly
      </h2>
      <p className="mb-4 text-sm text-text-muted sm:mb-6 sm:text-base lg:mb-10 lg:text-lg">
        A brand new commodity, native to Avalanche.
      </p>

      <StaggerContainer
        preset="firing-sequence"
        className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:gap-8"
      >
        {PROTOCOL_POINTS.map((point) => (
          <StaggerItem key={point.title} preset="firing-sequence">
            <div className="card-hover flex h-full flex-col items-center rounded-none border border-surface-elevated bg-surface p-6 sm:p-8 lg:p-10">
              <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-surface-elevated text-5xl font-bold text-brass">
                {point.icon}
              </div>
              <h3 className="mb-4 font-display text-2xl font-bold uppercase tracking-tight text-brass sm:text-3xl">
                {point.title}
              </h3>
              <p className="text-center text-base leading-relaxed text-text-secondary sm:text-lg">
                {point.detail}
              </p>
            </div>
          </StaggerItem>
        ))}
      </StaggerContainer>
    </SlideLayout>
  );
}
