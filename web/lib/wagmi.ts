import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { http } from "viem";
import { activeChain } from "./chain";

export const wagmiConfig = getDefaultConfig({
  appName: "X Cup Penalty Shootout",
  projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID || "demo",
  chains: [activeChain],
  transports: { [activeChain.id]: http() },
  ssr: true,
});
