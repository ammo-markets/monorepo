"use client";

import { motion } from "framer-motion";
import { SlideLayout } from "../SlideLayout";
import { MARKET_STATS } from "@/lib/slideData";

const TIERS = [
  {
    label: "TAM",
    name: MARKET_STATS.tam,
    value: MARKET_STATS.tamValue,
    detail: MARKET_STATS.tamDetail,
    targetWidth: "100%",
    opacity: "opacity-30",
    delay: 0,
    duration: 0.6,
  },
  {
    label: "SAM",
    name: MARKET_STATS.sam,
    value: MARKET_STATS.samValue,
    detail: `${MARKET_STATS.samDetail} (${MARKET_STATS.samPercent})`,
    targetWidth: "75%",
    opacity: "opacity-50",
    delay: 0.2,
    duration: 0.5,
  },
  {
    label: "SOM",
    name: MARKET_STATS.som,
    value: MARKET_STATS.somValue,
    detail: `${MARKET_STATS.somDetail} (${MARKET_STATS.somPercent})`,
    targetWidth: "50%",
    opacity: "opacity-100",
    delay: 0.4,
    duration: 0.4,
  },
];

export function SlideMarket() {
  return (
    <SlideLayout>
      <h2 className="mb-2 font-display text-2xl font-bold uppercase tracking-tight text-text sm:text-4xl lg:text-5xl">
        Market Opportunity
      </h2>
      <p className="mb-4 text-sm text-text-muted sm:mb-6 sm:text-base lg:mb-10 lg:text-lg">
        Global small arms ammunition — a massive, underserved commodity market
      </p>

      <div className="mb-6 flex flex-1 flex-col items-center justify-center gap-4">
        {TIERS.map((tier) => (
          <motion.div
            key={tier.label}
            initial={{ width: "0%", opacity: 0 }}
            animate={{ width: tier.targetWidth, opacity: 1 }}
            transition={{
              width: {
                duration: tier.duration,
                delay: tier.delay,
                ease: "easeOut",
              },
              opacity: { duration: 0.3, delay: tier.delay },
            }}
            className={`rounded-none border border-brass bg-brass ${tier.opacity} flex items-center justify-between px-3 py-3 sm:px-6 sm:py-4 lg:px-8 lg:py-5`}
          >
            <div>
              <span className="text-sm font-bold text-background">
                {tier.label}
              </span>
              <span className="ml-3 hidden text-sm text-background/80 sm:inline">
                {tier.detail}
              </span>
            </div>
            <span className="font-display text-lg font-bold uppercase text-background sm:text-2xl lg:text-3xl">
              {tier.value}
            </span>
          </motion.div>
        ))}
      </div>

      <p className="mb-6 text-center text-base text-text-muted">
        {MARKET_STATS.globalDimension}
      </p>

      <div className="flex items-center justify-center gap-4 sm:gap-8 lg:gap-12">
        <div className="text-center">
          <p className="font-display text-2xl font-bold uppercase text-brass sm:text-3xl lg:text-4xl">
            {MARKET_STATS.gunOwnership}
          </p>
          <p className="mt-1 text-sm text-text-muted">
            of US households own firearms (Gallup)
          </p>
        </div>
        <div className="text-center">
          <p className="font-display text-2xl font-bold uppercase text-brass sm:text-3xl lg:text-4xl">
            {MARKET_STATS.regularBuyers}
          </p>
          <p className="mt-1 text-sm text-text-muted">
            of gun owners fire rounds annually (NSSF)
          </p>
        </div>
      </div>
    </SlideLayout>
  );
}
