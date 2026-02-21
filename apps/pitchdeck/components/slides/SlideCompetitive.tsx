"use client";

import { motion } from "framer-motion";
import { SlideLayout } from "../SlideLayout";
import { COMPETITIVE_DATA } from "@/lib/slideData";

function Check() {
  return <span className="text-lg text-green">&#10003;</span>;
}

function Cross() {
  return <span className="text-lg text-red">&#10007;</span>;
}

const COLUMNS = [
  { key: "priceExposure" as const, label: "Price Exposure" },
  { key: "globalAccess" as const, label: "Global Access" },
  { key: "blockchain" as const, label: "Blockchain" },
  { key: "storageFree" as const, label: "Storage-Free" },
];

export function SlideCompetitive() {
  const competitors = COMPETITIVE_DATA.filter(
    (e) => e.name !== "Ammo Exchange",
  );
  const us = COMPETITIVE_DATA.find((e) => e.name === "Ammo Exchange")!;

  return (
    <SlideLayout>
      <h2 className="mb-2 font-display text-2xl font-bold uppercase tracking-tight text-text sm:text-4xl lg:text-5xl">
        Competitive Landscape
      </h2>
      <p className="mb-4 text-sm text-text-muted sm:mb-6 sm:text-base lg:mb-10 lg:text-lg">
        Positioned as &ldquo;PAXG for Ammunition&rdquo; -- tokenized commodity
        exposure
      </p>

      <div className="flex-1 overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="border-b border-surface-elevated">
              <th className="px-4 py-3 text-left text-sm font-semibold text-text-muted">
                Platform
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-text-muted">
                Type
              </th>
              {COLUMNS.map((col) => (
                <th
                  key={col.key}
                  className="px-4 py-3 text-center text-sm font-semibold text-text-muted"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Competitor rows — firing-sequence stagger */}
            {competitors.map((entry, i) => (
              <motion.tr
                key={entry.name}
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  duration: 0.35,
                  delay: i * 0.05,
                  ease: "easeOut",
                }}
                className="border-b border-surface-elevated"
              >
                <td className="px-4 py-4 text-base font-semibold text-text">
                  {entry.name}
                </td>
                <td className="px-4 py-4 text-sm text-text-secondary">
                  {entry.type}
                </td>
                {COLUMNS.map((col) => (
                  <td key={col.key} className="px-4 py-4 text-center">
                    {entry[col.key] ? <Check /> : <Cross />}
                  </td>
                ))}
              </motion.tr>
            ))}

            {/* Golden row — Ammo Exchange */}
            <motion.tr
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.4,
                delay: competitors.length * 0.05 + 0.5,
                ease: "easeOut",
              }}
              className="border-b border-surface-elevated bg-surface"
              style={{
                boxShadow: "0 0 20px rgba(198,164,78,0.15)",
              }}
            >
              <td className="px-4 py-4 text-base font-semibold text-brass">
                {us.name}
              </td>
              <td className="px-4 py-4 text-sm text-text-secondary">
                {us.type}
              </td>
              {COLUMNS.map((col) => (
                <td key={col.key} className="px-4 py-4 text-center">
                  {us[col.key] ? <Check /> : <Cross />}
                </td>
              ))}
            </motion.tr>
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-center text-sm font-semibold text-brass sm:mt-6 sm:text-base lg:mt-8 lg:text-lg">
        The only platform offering global ammo price exposure without touching a
        single bullet.
      </p>
    </SlideLayout>
  );
}
