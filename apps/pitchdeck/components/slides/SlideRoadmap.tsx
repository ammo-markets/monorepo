"use client";

import { motion } from "framer-motion";
import { SlideLayout } from "../SlideLayout";
import { StaggerContainer, StaggerItem } from "../StaggerContainer";
import { ROADMAP_PHASES } from "@/lib/slideData";

export function SlideRoadmap() {
  return (
    <SlideLayout>
      <h2 className="mb-2 font-display text-5xl font-bold uppercase tracking-tight text-text">
        Roadmap
      </h2>
      <p className="mb-10 text-lg text-text-muted">
        Four-phase plan from testnet to institutional scale
      </p>

      <div className="relative flex-1">
        <StaggerContainer
          preset="firing-sequence"
          className="grid grid-cols-4 gap-6"
        >
          {ROADMAP_PHASES.map((phase) => (
            <StaggerItem key={phase.phase} preset="firing-sequence">
              <div
                className={`card-hover flex h-full flex-col rounded-none border p-6 ${
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
                    <span className="badge-pulse rounded-full bg-brass px-2 py-0.5 text-xs font-bold text-background">
                      CURRENT
                    </span>
                  )}
                </div>
                <h3
                  className={`mb-1 text-xl font-bold ${phase.current ? "text-brass" : "text-text"}`}
                >
                  {phase.name}
                </h3>
                <p className="mb-4 text-sm text-text-muted">{phase.timeline}</p>
                <p className="mt-auto text-sm leading-relaxed text-text-secondary">
                  {phase.outcome}
                </p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* Timeline connector line */}
        <motion.div
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="absolute bottom-0 left-0 h-px bg-brass/30"
        />
      </div>
    </SlideLayout>
  );
}
