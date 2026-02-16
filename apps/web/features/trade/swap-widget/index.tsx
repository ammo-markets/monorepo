"use client";

import type { ReactNode } from "react";
import { useState, useEffect } from "react";
import { Drawer } from "vaul";
import { ArrowDownUp } from "lucide-react";
import type { TokenId } from "./swap-types";
import { SwapWidgetContent } from "./swap-widget-content";

/* ── Exported Modal Trigger + Widget ── */

interface SwapWidgetProps {
  defaultOpen?: boolean;
  initialPayToken?: TokenId;
  initialReceiveToken?: TokenId;
  trigger?: ReactNode;
}

export function SwapWidget({ defaultOpen = false, trigger }: SwapWidgetProps) {
  const [open, setOpen] = useState(defaultOpen);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  /* Default trigger button if none provided */
  const triggerElement = trigger || (
    <button
      type="button"
      onClick={handleOpen}
      className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-150 bg-transparent border border-border-hover text-text-primary hover:border-brass-border hover:text-brass"
    >
      <ArrowDownUp size={16} />
      Trade
    </button>
  );

  if (isMobile) {
    return (
      <Drawer.Root open={open} onOpenChange={setOpen}>
        <Drawer.Trigger asChild>
          <span onClick={handleOpen}>{triggerElement}</span>
        </Drawer.Trigger>
        <Drawer.Portal>
          <Drawer.Overlay
            className="fixed inset-0 z-50"
            style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
          />
          <Drawer.Content
            className="fixed inset-x-0 bottom-0 z-50 flex flex-col rounded-t-2xl"
            style={{ backgroundColor: "var(--bg-primary)", maxHeight: "90vh" }}
          >
            <div
              className="mx-auto mt-3 mb-1 h-1 w-10 rounded-full"
              style={{ backgroundColor: "var(--border-hover)" }}
            />
            <div className="overflow-y-auto px-0 pb-8">
              <SwapWidgetContent onClose={handleClose} />
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    );
  }

  return (
    <>
      <span onClick={handleOpen}>{triggerElement}</span>

      {/* Desktop overlay modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0"
            style={{
              backgroundColor: "rgba(0,0,0,0.6)",
              backdropFilter: "blur(4px)",
            }}
            onClick={handleClose}
            aria-hidden="true"
          />
          {/* Widget */}
          <div className="relative z-10 w-full max-w-[420px] mx-4">
            <SwapWidgetContent onClose={handleClose} />
          </div>
        </div>
      )}
    </>
  );
}
