"use client";

import { RainbowKitProvider, darkTheme, type Theme } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { WagmiProvider } from "wagmi";
import { wagmiConfig } from "@/lib/wagmi";
import { ToastProvider } from "@/components/ui/Toast";
import { SoundController } from "@/components/ui/Sound";
import "@rainbow-me/rainbowkit/styles.css";

// X Cup Arena — cyan accent, sharp corners, void panels, Chakra Petch.
const base = darkTheme({
  accentColor: "#00E5FF",
  accentColorForeground: "#050714",
  borderRadius: "none",
  fontStack: "system",
  overlayBlur: "small",
});

const arenaTheme: Theme = {
  ...base,
  colors: {
    ...base.colors,
    accentColor: "#00E5FF",
    accentColorForeground: "#050714",
    actionButtonSecondaryBackground: "#1A2147",
    closeButton: "#9099C2",
    closeButtonBackground: "#121833",
    connectButtonBackground: "#121833",
    connectButtonBackgroundError: "#FF3D5A",
    connectButtonInnerBackground: "#1A2147",
    connectButtonText: "#E8ECFF",
    connectButtonTextError: "#FFFFFF",
    modalBackground: "#080B1E",
    modalBorder: "#2E3877",
    modalText: "#E8ECFF",
    modalTextSecondary: "#9099C2",
    profileForeground: "#0A0F22",
    generalBorder: "#2E3877",
    menuItemBackground: "#121833",
  },
  fonts: {
    body: "var(--font-display), 'Chakra Petch', system-ui, sans-serif",
  },
  shadows: {
    ...base.shadows,
    connectButton: "0 0 16px -4px rgba(0,229,255,0.4)",
  },
};

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={arenaTheme} modalSize="compact">
          <ToastProvider>{children}</ToastProvider>
          <SoundController />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
