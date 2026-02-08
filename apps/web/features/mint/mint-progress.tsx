"use client";

import { Check } from "lucide-react";

const steps = [
  { label: "Select Caliber", shortLabel: "Caliber" },
  { label: "Amount", shortLabel: "Amount" },
  { label: "Review", shortLabel: "Review" },
  { label: "Confirmation", shortLabel: "Done" },
];

interface MintProgressProps {
  currentStep: number; // 0-indexed
}

export function MintProgress({ currentStep }: MintProgressProps) {
  return (
    <nav aria-label="Mint progress" className="mb-8 md:mb-10">
      <ol className="flex items-center justify-between">
        {steps.map((step, i) => {
          const isCompleted = i < currentStep;
          const isCurrent = i === currentStep;
          const isFuture = i > currentStep;

          return (
            <li key={step.label} className="flex flex-1 items-center">
              {/* Step circle + label */}
              <div className="flex flex-col items-center gap-2">
                <div
                  className="relative flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all duration-300"
                  style={{
                    backgroundColor: isCompleted
                      ? "var(--brass)"
                      : isCurrent
                        ? "transparent"
                        : "transparent",
                    border: isCompleted
                      ? "2px solid var(--brass)"
                      : isCurrent
                        ? "2px solid var(--brass)"
                        : "2px solid var(--border-hover)",
                    color: isCompleted
                      ? "var(--bg-primary)"
                      : isCurrent
                        ? "var(--brass)"
                        : "var(--text-muted)",
                  }}
                >
                  {isCompleted ? (
                    <Check size={14} strokeWidth={3} />
                  ) : isCurrent ? (
                    <>
                      <span
                        className="absolute h-2.5 w-2.5 rounded-full animate-pulse"
                        style={{ backgroundColor: "var(--brass)" }}
                      />
                    </>
                  ) : (
                    <span className="font-mono">{i + 1}</span>
                  )}
                </div>
                <span
                  className="text-[11px] font-medium tracking-wide"
                  style={{
                    color:
                      isCompleted || isCurrent
                        ? "var(--text-primary)"
                        : "var(--text-muted)",
                  }}
                >
                  <span className="hidden sm:inline">{step.label}</span>
                  <span className="sm:hidden">{step.shortLabel}</span>
                </span>
              </div>

              {/* Connector line */}
              {i < steps.length - 1 && (
                <div
                  className="mx-2 h-[2px] flex-1 rounded-full transition-colors duration-300"
                  style={{
                    backgroundColor: isCompleted
                      ? "var(--brass)"
                      : "var(--border-hover)",
                  }}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
