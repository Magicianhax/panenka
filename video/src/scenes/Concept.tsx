import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { loadFont as loadChakra } from "@remotion/google-fonts/ChakraPetch";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";
import { COLORS } from "../theme";

const { fontFamily: display } = loadChakra("normal", { weights: ["700"], subsets: ["latin"] });
const { fontFamily: mono } = loadMono("normal", { weights: ["500"], subsets: ["latin"] });

/** "Read your rival." + 3×3 grid breakdown of the mind-game. */
export const Concept: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 18, stiffness: 90 } });
  // Scene-end fade is handled by the TransitionSeries crossfade.

  return (
    <AbsoluteFill style={{ background: COLORS.bg, alignItems: "center", justifyContent: "center" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 100 }}>
        {/* Left: the headline */}
        <div style={{ maxWidth: 700, transform: `translateX(${(1 - enter) * -60}px)`, opacity: enter }}>
          <div style={{ fontFamily: mono, fontSize: 18, letterSpacing: 6, color: COLORS.gold, marginBottom: 16 }}>
            ✦ THE WHOLE GAME ✦
          </div>
          <div
            style={{
              fontFamily: display,
              fontWeight: 700,
              fontSize: 110,
              color: COLORS.fg,
              lineHeight: 0.95,
              letterSpacing: -3,
            }}
          >
            READ YOUR<br />RIVAL.
          </div>
          <div style={{ fontFamily: mono, fontSize: 22, color: COLORS.fgMuted, marginTop: 28, lineHeight: 1.5 }}>
            commit-reveal moves on-chain.<br />
            no oracle. no luck. no refs.
          </div>
        </div>

        {/* Right: the scoring grid */}
        <ScoreGrid intro={enter} />
      </div>
    </AbsoluteFill>
  );
};

const ScoreGrid: React.FC<{ intro: number }> = ({ intro }) => {
  const CELL = 110;
  const labels = ["L", "M", "R"];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, opacity: intro }}>
      <div style={{ display: "flex", gap: 8, paddingLeft: CELL + 8, fontFamily: mono, fontSize: 16, color: COLORS.fgMuted, letterSpacing: 4 }}>
        {labels.map((l) => <div key={l} style={{ width: CELL, textAlign: "center" }}>DIVE {l}</div>)}
      </div>
      {labels.map((row, r) => (
        <div key={row} style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div style={{ width: CELL, fontFamily: mono, fontSize: 16, color: COLORS.fgMuted, letterSpacing: 4, textAlign: "right", paddingRight: 8 }}>
            SHOOT {row}
          </div>
          {labels.map((_, c) => {
            const goal = r !== c;
            return (
              <div
                key={c}
                style={{
                  width: CELL, height: CELL,
                  background: goal ? `${COLORS.gold}22` : `${COLORS.magenta}22`,
                  border: `2px solid ${goal ? COLORS.gold : COLORS.magenta}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: display, fontWeight: 700, fontSize: 26,
                  letterSpacing: 2,
                  color: goal ? COLORS.gold : COLORS.magenta,
                  clipPath: "polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)",
                }}
              >
                {goal ? "GOAL" : "SAVE"}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};
