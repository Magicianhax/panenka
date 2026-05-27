import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { loadFont } from "@remotion/google-fonts/ChakraPetch";
import { COLORS } from "../theme";

const { fontFamily: display } = loadFont("normal", { weights: ["700"], subsets: ["latin"] });

/** Three big lines, each held for ~2.5s, kinetic typography. */
export const Hook: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: COLORS.bg, alignItems: "center", justifyContent: "center" }}>
      <FieldGrid />
      <Sequence from={0} durationInFrames={90} layout="none">
        <BigLine text="TWO PLAYERS" color={COLORS.fg} />
      </Sequence>
      <Sequence from={90} durationInFrames={90} layout="none">
        <BigLine text="FIVE ROUNDS" color={COLORS.cyan} />
      </Sequence>
      <Sequence from={180} durationInFrames={120} layout="none">
        <BigLine text="ONE POT" color={COLORS.gold} accent />
      </Sequence>
    </AbsoluteFill>
  );
};

const BigLine: React.FC<{ text: string; color: string; accent?: boolean }> = ({ text, color, accent }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 14, stiffness: 110 } });
  const exit = interpolate(frame, [60, 88], [1, 0], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
  const op = enter * exit;
  const slide = interpolate(enter, [0, 1], [80, 0]);

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <div
        style={{
          fontFamily: display,
          fontWeight: 700,
          fontSize: accent ? 260 : 220,
          letterSpacing: -4,
          color,
          opacity: op,
          transform: `translateY(${slide}px)`,
          textShadow: accent ? `0 0 80px ${color}aa` : "none",
          lineHeight: 0.95,
        }}
      >
        {text}<span style={{ color: COLORS.fg, opacity: 0.6 }}>.</span>
      </div>
      {accent && (
        <div
          style={{
            position: "absolute",
            top: "calc(50% + 160px)",
            fontFamily: display,
            fontWeight: 700,
            fontSize: 26,
            letterSpacing: 14,
            color: COLORS.fgMuted,
            opacity: op * 0.9,
          }}
        >
          WINNER TAKES IT
        </div>
      )}
    </AbsoluteFill>
  );
};

const FieldGrid: React.FC = () => (
  <svg style={{ position: "absolute", inset: 0, opacity: 0.04 }} viewBox="0 0 1920 1080" preserveAspectRatio="none">
    <defs>
      <pattern id="g" width="80" height="80" patternUnits="userSpaceOnUse">
        <path d="M 80 0 L 0 0 0 80" fill="none" stroke={COLORS.fg} strokeWidth="1" />
      </pattern>
    </defs>
    <rect width="1920" height="1080" fill="url(#g)" />
  </svg>
);
