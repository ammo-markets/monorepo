import { darkTheme } from "@rainbow-me/rainbowkit";
import type { Theme } from "@rainbow-me/rainbowkit";

const base = darkTheme();

export const ammoTheme: Theme = {
  ...base,
  colors: {
    ...base.colors,
    accentColor: "var(--brass)",
    accentColorForeground: "var(--bg-primary)",
    modalBackground: "var(--bg-secondary)",
    modalBorder: "var(--border-default)",
    modalText: "var(--text-primary)",
    modalTextDim: "var(--text-muted)",
    modalTextSecondary: "var(--text-secondary)",
    connectButtonBackground: "var(--bg-secondary)",
    connectButtonText: "var(--text-primary)",
    connectButtonInnerBackground: "var(--bg-tertiary)",
    generalBorder: "var(--border-default)",
    generalBorderDim: "var(--border-default)",
    menuItemBackground: "var(--bg-tertiary)",
    selectedOptionBorder: "var(--brass)",
    error: "var(--red)",
    connectionIndicator: "var(--green)",
    standby: "var(--amber)",
    modalBackdrop: "var(--bg-glass)",
    closeButton: "var(--text-secondary)",
    closeButtonBackground: "var(--bg-tertiary)",
    profileForeground: "var(--bg-tertiary)",
    profileAction: "var(--bg-secondary)",
    profileActionHover: "var(--bg-tertiary)",
    actionButtonBorder: "var(--border-default)",
    actionButtonSecondaryBackground: "var(--bg-tertiary)",
    connectButtonBackgroundError: "var(--red)",
    connectButtonTextError: "var(--text-primary)",
    downloadBottomCardBackground: "var(--bg-primary)",
    downloadTopCardBackground: "var(--bg-tertiary)",
    actionButtonBorderMobile: "var(--border-default)",
  },
  fonts: {
    body: "var(--font-manrope), ui-sans-serif, system-ui, sans-serif",
  },
  radii: {
    actionButton: "var(--radius-xl)",
    connectButton: "var(--radius-xl)",
    menuButton: "var(--radius-xl)",
    modal: "var(--radius-2xl)",
    modalMobile: "var(--radius-2xl)",
  },
  shadows: {
    connectButton: "none",
    dialog: "none",
    profileDetailsAction: "none",
    selectedOption: "none",
    selectedWallet: "none",
    walletLogo: "none",
  },
  blurs: {
    modalOverlay: "none",
  },
};
