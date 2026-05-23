import type { Metadata, Viewport } from "next";
import { Chakra_Petch, Sora, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { Providers } from "./providers";
import { Footer } from "@/components/layout/Footer";
import "flag-icons/css/flag-icons.min.css";
import "./globals.css";

const display = Chakra_Petch({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

const body = Sora({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-mono",
  display: "swap",
});

// Set NEXT_PUBLIC_SITE_URL to your production domain so OG/Twitter preview
// images resolve to absolute URLs (otherwise they fall back to localhost).
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "PANENKA — Penalty Shootout on X Layer",
  description: "PANENKA — a 1v1 on-chain penalty shootout. Outguess your opponent, stake OKB, winner takes the pot. X Cup · WC26 on X Layer.",
  openGraph: { title: "PANENKA — Penalty Shootout", description: "Outguess. Win the pot. 1v1 on-chain penalty shootout on X Layer." },
  twitter: { card: "summary_large_image", site: "@play_panenka", creator: "@play_panenka" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#050714",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body className="min-h-dvh">
        <Providers>
          {children}
          <Footer />
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
