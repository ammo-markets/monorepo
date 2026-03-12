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
  isEmbedded?: boolean;
  onStepClick?: (step: number) => void;
}

export function MintProgress({
  currentStep,
  isEmbedded,
  onStepClick,
}: MintProgressProps) {
  const displaySteps = isEmbedded ? steps.slice(1) : steps;
  const adjustedStep = isEmbedded ? currentStep - 1 : currentStep;

  return (
    <nav aria-label="Mint progress" className="mb-8 md:mb-10">
      {/* Grid: columns = step, connector, step, connector, step */}
      <ol
        className="grid items-center"
        style={{
          gridTemplateColumns: displaySteps
            .map((_, i) => (i < displaySteps.length - 1 ? "auto 1fr" : "auto"))
            .join(" "),
        }}
      >
        {displaySteps.map((step, i) => {
          const isCompleted = i < adjustedStep;
          const isCurrent = i === adjustedStep;

          return (
            <li key={step.label} className="contents">
              {/* Step circle + label */}
              <div
                className={`flex flex-col items-center gap-2${isCompleted && onStepClick ? " cursor-pointer" : ""}`}
                onClick={
                  isCompleted && onStepClick ? () => onStepClick(i) : undefined
                }
              >
                <div
                  className="relative flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all duration-300"
                  style={{
                    backgroundColor: isCompleted
                      ? "var(--brass)"
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
                    <span
                      className="absolute h-2.5 w-2.5 rounded-full animate-pulse"
                      style={{ backgroundColor: "var(--brass)" }}
                    />
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
              {i < displaySteps.length - 1 && (
                <div
                  className="mx-2 h-[2px] rounded-full transition-colors duration-300"
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
