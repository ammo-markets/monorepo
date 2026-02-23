import type { ReactNode } from "react";
import { ArrowLeft, AlertTriangle, Loader2 } from "lucide-react";

export function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mb-5 flex items-center gap-1.5 text-sm font-medium transition-none text-text-secondary hover:text-text-primary"
    >
      <ArrowLeft size={16} />
      Back
    </button>
  );
}

export function PrimaryButton({
  disabled,
  onClick,
  children,
  icon,
}: {
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`mt-6 flex w-full items-center justify-center gap-2 py-3.5 text-sm font-bold transition-none ${
        disabled
          ? "bg-ax-tertiary text-text-muted cursor-not-allowed opacity-50"
          : "bg-brass text-ax-primary cursor-pointer hover:bg-brass-hover"
      }`}
    >
      {icon}
      {children}
    </button>
  );
}

export function GhostButton({
  onClick,
  children,
}: {
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-center py-3.5 text-sm font-bold transition-none bg-transparent text-text-primary border border-border-hover hover:bg-ax-tertiary hover:border-brass-border"
    >
      {children}
    </button>
  );
}

export function WrongNetworkBanner({ onSwitch }: { onSwitch: () => void }) {
  return (
    <div
      className="mb-6 flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
      style={{
        backgroundColor: "rgba(231, 76, 60, 0.1)",
        border: "1px solid rgba(231, 76, 60, 0.3)",
      }}
    >
      <div className="flex items-center gap-3">
        <AlertTriangle size={18} style={{ color: "var(--red)" }} />
        <span className="text-sm font-medium" style={{ color: "var(--red)" }}>
          Please switch to Avalanche to continue
        </span>
      </div>
      <button
        type="button"
        onClick={onSwitch}
        className="rounded-lg px-4 py-2 font-mono text-sm font-bold uppercase tracking-widest transition-none"
        style={{
          backgroundColor: "var(--red)",
          color: "#fff",
        }}
      >
        Switch Network
      </button>
    </div>
  );
}

export function SpinnerButton({
  label,
  size = "default",
}: {
  label: string;
  size?: "default" | "large";
}) {
  return (
    <button
      type="button"
      disabled
      className={`flex w-full items-center justify-center gap-2 ${
        size === "large" ? "py-4 text-base" : "py-3.5 text-sm"
      } font-bold`}
      style={{
        backgroundColor: "var(--bg-tertiary)",
        color: "var(--text-muted)",
        cursor: "not-allowed",
      }}
    >
      <Loader2 size={16} className="animate-spin" />
      {label}
    </button>
  );
}
