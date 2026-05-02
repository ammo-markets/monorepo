"use client";

import { motion } from "framer-motion";
import { SlideLayout } from "../SlideLayout";
import { StaggerContainer, StaggerItem } from "../StaggerContainer";
import {
  AMMOSQUARED_FOOTER,
  AMMOSQUARED_HEADLINE,
  AMMOSQUARED_PILLARS,
  AMMOSQUARED_SUB,
} from "@/lib/slideData";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

export function SlideAmmoSquared() {
  return (
    <SlideLayout>
      <h2 className="mb-2 font-display text-2xl font-bold uppercase tracking-tight text-text sm:text-4xl lg:text-5xl">
        {AMMOSQUARED_HEADLINE}
      </h2>
      <p className="mb-4 text-sm text-text-muted sm:mb-6 sm:text-base lg:mb-10 lg:text-lg">
        {AMMOSQUARED_SUB}
      </p>

      <StaggerContainer
        preset="firing-sequence"
        className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:gap-10"
      >
        {AMMOSQUARED_PILLARS.map((pillar) => (
          <StaggerItem key={pillar.title} preset="firing-sequence">
            <div className="card-hover flex h-full flex-col rounded-none border border-surface-elevated bg-surface p-6 sm:p-8 lg:p-10">
              <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-surface-elevated text-5xl font-bold text-brass sm:h-28 sm:w-28 sm:text-6xl">
                {pillar.icon}
              </div>
              <h3 className="mb-4 font-display text-3xl font-bold uppercase tracking-tight text-brass sm:text-4xl lg:text-5xl">
                {pillar.title}
              </h3>
              <p className="text-base leading-relaxed text-text-secondary sm:text-lg lg:text-xl">
                {pillar.detail}
              </p>
            </div>
          </StaggerItem>
        ))}
      </StaggerContainer>

      <motion.p
        variants={fadeUp}
        initial="hidden"
        animate="show"
        transition={{ delay: 0.4 }}
        className="mt-6 border-t border-surface-elevated pt-4 text-center text-sm italic text-text-secondary sm:mt-8 sm:pt-6 sm:text-base lg:mt-10 lg:text-lg"
      >
        {AMMOSQUARED_FOOTER}
      </motion.p>
    </SlideLayout>
  );
}
