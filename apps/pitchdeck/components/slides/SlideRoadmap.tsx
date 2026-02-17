import { SlideLayout } from "../SlideLayout";
import { ROADMAP_PHASES } from "@/lib/slideData";

export function SlideRoadmap() {
  return (
    <SlideLayout>
      <h2 className="mb-2 text-5xl font-bold text-text">Roadmap</h2>
      <p className="mb-10 text-lg text-text-muted">
        Four-phase plan from testnet to institutional scale
      </p>

      <div className="grid flex-1 grid-cols-4 gap-6">
        {ROADMAP_PHASES.map((phase) => (
          <div
            key={phase.phase}
            className={`flex flex-col rounded-xl border p-6 ${
              phase.current
                ? "border-brass bg-brass/10"
                : "border-surface-elevated bg-surface"
            }`}
          >
            <div className="mb-3 flex items-center justify-between">
              <span
                className={`text-sm font-bold ${phase.current ? "text-brass" : "text-text-muted"}`}
              >
                Phase {phase.phase}
              </span>
              {phase.current && (
                <span className="rounded-full bg-brass px-2 py-0.5 text-xs font-bold text-background">
                  CURRENT
                </span>
              )}
            </div>
            <h3
              className={`mb-1 text-xl font-bold ${phase.current ? "text-brass" : "text-text"}`}
            >
              {phase.name}
            </h3>
            <p className="mb-1 text-sm text-text-muted">{phase.timeline}</p>
            <p className="mb-4 text-sm text-text-secondary">
              {phase.description}
            </p>
            <ul className="mt-auto space-y-2">
              {phase.items.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2 text-sm text-text-secondary"
                >
                  <span
                    className={`mt-1 ${phase.current ? "text-brass" : "text-text-muted"}`}
                  >
                    &bull;
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </SlideLayout>
  );
}
