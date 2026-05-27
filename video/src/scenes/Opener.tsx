import { AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";
import { COLORS } from "../theme";

const { fontFamily: mono } = loadMono("normal", { weights: ["500", "700"], subsets: ["latin"] });

export const Opener: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoScale = spring({ frame, fps, config: { damping: 12, stiffness: 80 } });
  const logoOpacity = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: "clamp" });

  // Wordmark slides up after the logo lands.
  const wordmarkY = interpolate(
    spring({ frame: frame - 20, fps, config: { damping: 18, stiffness: 100 } }),
    [0, 1], [40, 0]
  );
  const wordmarkOp = interpolate(frame, [20, 36], [0, 1], { extrapolateRight: "clamp" });

  // Subtle radial glow that pulses through the scene.
  const glow = 0.25 + Math.sin(frame / 12) * 0.06;

  // Scene-end fade is handled by the TransitionSeries crossfade; no local
  // fade-out needed (would double up with the crossfade).
  void fps;

  return (
    <AbsoluteFill style={{ background: COLORS.bg, alignItems: "center", justifyContent: "center" }}>
      {/* radial gold glow */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(circle at 50% 50%, ${COLORS.gold}${Math.round(glow * 32).toString(16).padStart(2, "0")} 0%, transparent 55%)`,
        }}
      />
      {/* subtle stadium pitch lines */}
      <div style={{ position: "absolute", inset: 0, opacity: 0.06 }}>
        <PitchLines />
      </div>

      <Img
        src={staticFile("panenka.png")}
        style={{
          width: 540, height: 540, objectFit: "contain",
          opacity: logoOpacity,
          transform: `scale(${0.6 + logoScale * 0.5})`,
          filter: `drop-shadow(0 0 60px ${COLORS.gold}88)`,
        }}
      />

      <div
        style={{
          position: "absolute",
          bottom: 110,
          fontFamily: mono,
          fontWeight: 700,
          fontSize: 32,
          letterSpacing: 14,
          color: COLORS.fgSoft,
          opacity: wordmarkOp,
          transform: `translateY(${wordmarkY}px)`,
        }}
      >
        SEASON 01 · BUILT ON X LAYER
      </div>
    </AbsoluteFill>
  );
};

const PitchLines: React.FC = () => (
  <svg width="100%" height="100%" viewBox="0 0 1920 1080" preserveAspectRatio="none">
    <g stroke={COLORS.gold} strokeWidth="1.5" fill="none">
      <rect x="80" y="80" width="1760" height="920" />
      <line x1="960" y1="80" x2="960" y2="1000" />
      <circle cx="960" cy="540" r="160" />
      <rect x="80" y="320" width="320" height="440" />
      <rect x="1520" y="320" width="320" height="440" />
    </g>
  </svg>
);
