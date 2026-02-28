"use client";

import { useState, useEffect } from "react";
import { Settings2 } from "lucide-react";
import { Drawer as DrawerPrimitive } from "vaul";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { SlippagePicker } from "./slippage-picker";
import { DeadlinePicker } from "./deadline-picker";

export interface OrderSettingsMenuProps {
  slippageBps?: number;
  onSlippageChange?: (bps: number) => void;
  expiryHours: number;
  onExpiryChange: (hours: number) => void;
}

export function OrderSettingsMenu({
  slippageBps,
  onSlippageChange,
  expiryHours,
  onExpiryChange,
}: OrderSettingsMenuProps) {
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const summary = [
    slippageBps !== undefined ? `Slippage ${slippageBps / 100}%` : null,
    `Expiry ${expiryHours === 0 ? "None" : `${expiryHours}h`}`,
  ]
    .filter(Boolean)
    .join(" · ");

  const trigger = (
    <button
      type="button"
      className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide transition-none hover:opacity-80"
      style={{ color: "var(--text-muted)" }}
    >
      <Settings2 size={14} />
      {summary}
    </button>
  );

  const content = (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between pb-2" style={{ borderBottom: "1px solid var(--border-default)" }}>
        <h3 className="text-sm font-semibold uppercase tracking-wide" style={{ color: "var(--text-primary)" }}>
          Advanced Settings
        </h3>
      </div>
      {slippageBps !== undefined && onSlippageChange !== undefined && (
        <SlippagePicker
          slippageBps={slippageBps}
          onSlippageChange={onSlippageChange}
        />
      )}
      <DeadlinePicker
        deadlineHours={expiryHours}
        onDeadlineChange={onExpiryChange}
      />
    </div>
  );

  if (isMobile) {
    return (
      <DrawerPrimitive.Root open={open} onOpenChange={setOpen}>
        <DrawerPrimitive.Trigger asChild>
          <span onClick={() => setOpen(true)}>{trigger}</span>
        </DrawerPrimitive.Trigger>
        <DrawerPrimitive.Portal>
          <DrawerPrimitive.Overlay
            className="fixed inset-0 z-50"
            style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
          />
          <DrawerPrimitive.Content
            className="fixed inset-x-0 bottom-0 z-50 flex flex-col rounded-t-2xl"
            style={{ backgroundColor: "var(--bg-primary)", maxHeight: "90vh" }}
          >
            <div
              className="mx-auto mt-3 mb-1 h-1 w-10 rounded-full"
              style={{ backgroundColor: "var(--border-hover)" }}
            />
            <div className="overflow-y-auto px-4 pb-8 pt-4">
              {content}
            </div>
          </DrawerPrimitive.Content>
        </DrawerPrimitive.Portal>
      </DrawerPrimitive.Root>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <span onClick={() => setOpen(true)}>{trigger}</span>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-80 p-5 rounded-xl shadow-xl" style={{ backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border-default)" }}>
        {content}
      </PopoverContent>
    </Popover>
  );
}
