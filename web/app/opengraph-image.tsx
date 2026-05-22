import { ImageResponse } from "next/og";

export const alt = "X Cup - 1v1 on-chain penalty shootout on X Layer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background:
            "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(0,229,255,0.18), transparent 60%), linear-gradient(180deg, #050714, #080B1E)",
          color: "#E8ECFF",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 30, letterSpacing: 6, color: "#FFC940" }}>
          PANENKA / X CUP / WORLD CUP 2026
        </div>
        <div style={{ display: "flex", fontSize: 130, fontWeight: 800, lineHeight: 1, letterSpacing: -4, marginTop: 28 }}>
          OUTGUESS.
        </div>
        <div style={{ display: "flex", fontSize: 130, fontWeight: 800, lineHeight: 1, letterSpacing: -4, color: "#00E5FF" }}>
          WIN THE POT.
        </div>
        <div style={{ display: "flex", fontSize: 36, color: "#9099C2", marginTop: 40, maxWidth: 940 }}>
          A 1v1 on-chain penalty shootout. Stake OKB, read your opponent, winner takes all on X Layer.
        </div>
      </div>
    ),
    { ...size }
  );
}
