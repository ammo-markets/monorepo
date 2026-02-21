"use client";

import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

interface ConnectDialogContextValue {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

const ConnectDialogContext = createContext<ConnectDialogContextValue | null>(
  null,
);

export function ConnectDialogProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <ConnectDialogContext
      value={{
        isOpen,
        open: () => setIsOpen(true),
        close: () => setIsOpen(false),
      }}
    >
      {children}
    </ConnectDialogContext>
  );
}

export function useConnectDialog(): ConnectDialogContextValue {
  const ctx = useContext(ConnectDialogContext);
  if (!ctx) {
    throw new Error(
      "useConnectDialog must be used within a ConnectDialogProvider",
    );
  }
  return ctx;
}
