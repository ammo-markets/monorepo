import { SlideLayout } from "../SlideLayout";
import { WHY_NOW_HOOK, WHY_NOW_POINTS } from "@/lib/slideData";

export function SlideWhyNow() {
  return (
    <SlideLayout>
      <h2 className="mb-2 text-5xl font-bold text-text">Why Now</h2>
      <p className="mb-10 text-lg text-text-muted">{WHY_NOW_HOOK}</p>

      <div className="grid flex-1 grid-cols-2 gap-6">
        {WHY_NOW_POINTS.map((point) => (
          <div
            key={point.stat}
            className="flex flex-col items-center justify-center rounded-xl border border-surface-elevated bg-surface p-8 text-center"
          >
            <p className="text-5xl font-bold text-brass">{point.stat}</p>
            <p className="mt-3 text-base text-text-secondary">{point.label}</p>
          </div>
        ))}
      </div>
    </SlideLayout>
  );
}
