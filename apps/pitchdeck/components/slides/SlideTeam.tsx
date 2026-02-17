import { SlideLayout } from "../SlideLayout";
import { TEAM_MEMBERS } from "@/lib/slideData";

export function SlideTeam() {
  return (
    <SlideLayout>
      <h2 className="mb-2 text-5xl font-bold text-text">Team</h2>
      <p className="mb-10 text-lg text-text-muted">
        Building at the intersection of DeFi, commodities, and compliance
      </p>

      <div className="grid flex-1 grid-cols-4 gap-6">
        {TEAM_MEMBERS.map((member) => (
          <div
            key={member.role}
            className="flex flex-col items-center rounded-xl border border-surface-elevated bg-surface p-8 text-center"
          >
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-surface-elevated text-2xl font-bold text-brass">
              {member.initials}
            </div>
            <h3 className="mb-1 text-lg font-semibold text-text">
              {member.name}
            </h3>
            <p className="mb-3 text-sm font-medium text-brass">
              {member.role}
            </p>
            <p className="text-sm leading-relaxed text-text-secondary">
              {member.bio}
            </p>
          </div>
        ))}
      </div>
    </SlideLayout>
  );
}
