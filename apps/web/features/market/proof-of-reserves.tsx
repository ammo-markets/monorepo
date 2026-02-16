"use client";

import { CheckCircle2 } from "lucide-react";

export function ProofOfReserves() {
  return (
    <div
      className="rounded-xl p-5 lg:p-6"
      style={{
        backgroundColor: "var(--bg-tertiary)",
        borderLeft: "4px solid var(--brass)",
      }}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {/* Left: icon + text */}
        <div className="flex items-start gap-3">
          {/* Shield icon */}
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="mt-0.5 flex-shrink-0"
            aria-hidden="true"
          >
            <path
              d="M12 2L3 7V12C3 17.25 6.75 21.25 12 22.5C17.25 21.25 21 17.25 21 12V7L12 2Z"
              stroke="var(--brass)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            <path
              d="M9 12L11 14L15 10"
              stroke="var(--brass)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div>
            <p
              className="text-sm font-medium"
              style={{ color: "var(--text-primary)" }}
            >
              All tokens are backed 1:1 by physical ammunition in insured,
              audited storage.
            </p>
            <a
              href="#"
              className="mt-1 inline-flex items-center gap-1 text-xs font-medium transition-colors duration-150 hover:opacity-80"
              style={{ color: "var(--blue)" }}
            >
              {"View latest attestation \u2192"}
            </a>
          </div>
        </div>

        {/* Right: stats */}
        <div
          className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs"
          style={{ color: "var(--text-secondary)" }}
        >
          <span>
            Total warehouse:{" "}
            <span
              className="font-mono font-medium"
              style={{ color: "var(--text-primary)" }}
            >
              5,580,000 rounds
            </span>
          </span>
          <span
            className="hidden h-3 w-px lg:block"
            style={{ backgroundColor: "var(--border-hover)" }}
            aria-hidden="true"
          />
          <span>
            Total supply:{" "}
            <span
              className="font-mono font-medium"
              style={{ color: "var(--text-primary)" }}
            >
              5,580,000 tokens
            </span>
          </span>
          <span
            className="hidden h-3 w-px lg:block"
            style={{ backgroundColor: "var(--border-hover)" }}
            aria-hidden="true"
          />
          <span className="flex items-center gap-1">
            <CheckCircle2 size={14} style={{ color: "var(--green)" }} />
            <span className="font-medium" style={{ color: "var(--green)" }}>
              Fully backed
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}
