import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "PANENKA — Penalty Shootout",
    short_name: "PANENKA",
    description: "1v1 on-chain penalty shootout. Outguess your opponent, stake OKB, winner takes the pot. On X Layer.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#050714",
    theme_color: "#050714",
    icons: [
      { src: "/brand/panenka.png", sizes: "1254x1254", type: "image/png", purpose: "any" },
    ],
  };
}
