"use client";

import { useEffect, useRef, useState } from "react";
import { useProtocolStats } from "@/hooks/use-protocol-stats";

function useCountUp(target: string, duration = 1200) {
  const [display, setDisplay] = useState(target);
  const ref = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    setDisplay(target);
    hasAnimated.current = false;

    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const chars = target.split("");
          const numericPositions = chars
            .map((c, i) => (/\d/.test(c) ? i : -1))
            .filter((i) => i !== -1);

          const startTime = performance.now();
          function animate(now: number) {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - (1 - progress) ** 3;

            const result = chars.map((c, i) => {
              if (!numericPositions.includes(i)) return c;
              const idx = numericPositions.indexOf(i);
              const charProgress = Math.min(
                (eased * numericPositions.length - idx * 0.3) / 0.7,
                1,
              );
              if (charProgress >= 1) return c;
              if (charProgress <= 0) return "0";
              const num = Number.parseInt(c);
              return String(Math.round(num * charProgress));
            });

            setDisplay(result.join(""));
            if (progress < 1) requestAnimationFrame(animate);
          }
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration]);

  return { ref, display };
}

function StatItem({ value, label }: { value: string; label: string }) {
  const { ref, display } = useCountUp(value);

  return (
    <div ref={ref} className="flex flex-col items-center gap-1.5 py-4">
      <span
        className="font-mono text-2xl font-semibold tabular-nums sm:text-3xl"
        style={{ color: "var(--brass)" }}
      >
        {display}
      </span>
      <span
        className="text-[11px] font-medium uppercase tracking-[0.08em]"
        style={{ color: "var(--text-secondary)" }}
      >
        {label}
      </span>
    </div>
  );
}

function formatCompact(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
}

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M+`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K+`;
  if (n > 0) return `${n}+`;
  return "0";
}

export function ProtocolStats() {
  const { data: protocolStats } = useProtocolStats();

  const volume = protocolStats
    ? formatCompact(Number(protocolStats.totalVolumeUsd))
    : "--";
  const users = protocolStats
    ? formatCount(Number(protocolStats.registeredUsers))
    : "--";
  const rounds = protocolStats
    ? formatCount(Number(protocolStats.roundsTokenized))
    : "--";

  return (
    <section
      className="px-4 py-12 lg:py-16"
      style={{
        backgroundColor: "var(--bg-tertiary)",
        borderTop: "1px solid var(--brass-border)",
      }}
    >
      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-3 md:gap-8">
        <StatItem value={volume} label="Trading Volume" />
        <StatItem value={users} label="Registered Users" />
        <StatItem value={rounds} label="Rounds Tokenized" />
      </div>
    </section>
  );
}
