import { AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { loadFont as loadChakra } from "@remotion/google-fonts/ChakraPetch";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";
import { COLORS } from "../theme";

const { fontFamily: display } = loadChakra("normal", { weights: ["600", "700"], subsets: ["latin"] });
const { fontFamily: mono } = loadMono("normal", { weights: ["500", "700"], subsets: ["latin"] });

/** Final ten seconds: logo, URL, X handle, CTA. Holds for screenshots/clippers. */
export const EndScreen: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 18, stiffness: 80 } });
  return <EndCardBody enter={enter} frame={frame} fps={fps} />;
};

/** Standalone <Still>-friendly composition. Renders the final still frame. */
export const EndCard: React.FC = () => {
  return <EndCardBody enter={1} frame={60} fps={30} />;
};

const EndCardBody: React.FC<{ enter: number; frame: number; fps: number }> = ({ enter, frame, fps }) => {
  // Logo lifts in then holds. URL stays static — it's a CTA people need to
  // read/screenshot, so no scaling, no pulse.
  void frame; void fps;
  const lineGrow = interpolate(enter, [0, 1], [0, 1]);

  return (
    <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 60%, ${COLORS.panel} 0%, ${COLORS.abyss} 70%)`, alignItems: "center", justifyContent: "center", gap: 36 }}>
      {/* gold rule across the top quarter */}
      <div style={{ position: "absolute", top: "20%", height: 2, width: "60%", background: COLORS.gold, transform: `scaleX(${lineGrow})`, transformOrigin: "left", opacity: 0.5 }} />

      <Img
        src={staticFile("panenka_lockup.png")}
        style={{
          height: 220, width: "auto", objectFit: "contain",
          opacity: enter,
          transform: `translateY(${(1 - enter) * 40}px)`,
          filter: `drop-shadow(0 0 50px ${COLORS.gold}66)`,
        }}
      />

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18, opacity: enter }}>
        <div
          style={{
            fontFamily: display,
            fontWeight: 700,
            fontSize: 72,
            color: COLORS.fg,
            letterSpacing: 6,
          }}
        >
          PLAYPANENKA.FUN
        </div>
        <div
          style={{
            fontFamily: mono,
            fontWeight: 700,
            fontSize: 30,
            color: COLORS.cyan,
            letterSpacing: 4,
          }}
        >
          FOLLOW @play_panenka
        </div>
      </div>

      <div style={{ position: "absolute", bottom: 80, display: "flex", gap: 36, alignItems: "center", opacity: enter * 0.8 }}>
        <Pill text="1V1 ON-CHAIN" color={COLORS.gold} />
        <Pill text="STAKE OKB · WIN POT" color={COLORS.cyan} />
        <Pill text="X CUP · WC26" color={COLORS.magenta} />
      </div>

      {/* gold rule across the bottom */}
      <div style={{ position: "absolute", bottom: "20%", height: 2, width: "60%", background: COLORS.gold, transform: `scaleX(${lineGrow})`, transformOrigin: "right", opacity: 0.5 }} />
    </AbsoluteFill>
  );
};

const Pill: React.FC<{ text: string; color: string }> = ({ text, color }) => (
  <div
    style={{
      fontFamily: mono,
      fontWeight: 700,
      fontSize: 18,
      letterSpacing: 4,
      color,
      padding: "12px 22px",
      border: `1.5px solid ${color}`,
      background: `${color}11`,
      clipPath: "polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)",
    }}
  >
    {text}
  </div>
);
