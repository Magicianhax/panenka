import { AbsoluteFill, Series, staticFile, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { Video } from "@remotion/media";
import { loadFont as loadChakra } from "@remotion/google-fonts/ChakraPetch";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";
import { COLORS } from "../theme";

const { fontFamily: display } = loadChakra("normal", { weights: ["700"], subsets: ["latin"] });
const { fontFamily: mono } = loadMono("normal", { weights: ["500", "700"], subsets: ["latin"] });

// 25s ÷ 4 slots = 6.25s per slot = 187 frames @ 30fps. Round to 188 + 3*187.
const SLOT_FRAMES = [188, 187, 188, 187];

const SLOT_META: { caption: string; color: string }[] = [
  { caption: "CREATE A MATCH",        color: COLORS.cyan },
  { caption: "LOCK IN YOUR MOVE",     color: COLORS.gold },
  { caption: "GOAL.",                  color: COLORS.gold },
  { caption: "WINNER TAKES THE POT",  color: COLORS.magenta },
];

export const Gameplay: React.FC<{ clips: (string | null)[] }> = ({ clips }) => {
  return (
    <AbsoluteFill style={{ background: COLORS.bg }}>
      <Series>
        {SLOT_FRAMES.map((dur, i) => (
          <Series.Sequence key={i} durationInFrames={dur}>
            <Slot clip={clips[i] ?? null} meta={SLOT_META[i]} index={i} />
          </Series.Sequence>
        ))}
      </Series>
    </AbsoluteFill>
  );
};

const Slot: React.FC<{ clip: string | null; meta: { caption: string; color: string }; index: number }> = ({ clip, meta, index }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 18, stiffness: 100 } });
  const fadeOut = interpolate(frame, [durationInFrames - 8, durationInFrames], [1, 0], { extrapolateLeft: "clamp" });
  const op = enter * fadeOut;

  return (
    <AbsoluteFill style={{ background: COLORS.bg }}>
      {/* The clip area. objectFit "contain" so non-16:9 recordings (e.g. 1900×900
          ultrawide) aren't cropped at the edges — narrow navy letterbox bars on
          top/bottom blend with the scene background. */}
      {clip ? (
        <Video src={staticFile(clip)} muted style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain", background: COLORS.bg }} />
      ) : (
        <Placeholder index={index} />
      )}

      {/* Bottom-left lower-third with slot caption */}
      <div
        style={{
          position: "absolute",
          left: 80, bottom: 90,
          display: "flex", flexDirection: "column", gap: 12,
          opacity: op,
          transform: `translateX(${(1 - enter) * -40}px)`,
        }}
      >
        <div style={{ fontFamily: mono, fontSize: 18, letterSpacing: 6, color: COLORS.fgMuted }}>
          R0{index + 1} · PANENKA
        </div>
        <div
          style={{
            fontFamily: display,
            fontWeight: 700,
            fontSize: 88,
            color: meta.color,
            letterSpacing: -2,
            lineHeight: 1,
            textShadow: `0 0 40px ${meta.color}66`,
          }}
        >
          {meta.caption}
        </div>
      </div>

      {/* Top-right brand watermark */}
      <div
        style={{
          position: "absolute",
          top: 60, right: 80,
          fontFamily: display,
          fontWeight: 700,
          fontSize: 22,
          letterSpacing: 8,
          color: COLORS.fgSoft,
          opacity: op * 0.85,
          borderLeft: `2px solid ${COLORS.gold}`,
          paddingLeft: 14,
        }}
      >
        PANENKA<br />
        <span style={{ fontFamily: mono, fontSize: 14, letterSpacing: 4, color: COLORS.fgMuted }}>
          @play_panenka
        </span>
      </div>
    </AbsoluteFill>
  );
};

const Placeholder: React.FC<{ index: number }> = ({ index }) => (
  <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
    <div
      style={{
        width: 1600, height: 800,
        border: `3px dashed ${COLORS.line}`,
        background: `linear-gradient(180deg, ${COLORS.panel} 0%, ${COLORS.abyss} 100%)`,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        gap: 24,
      }}
    >
      <div style={{ fontFamily: display, fontWeight: 700, fontSize: 28, letterSpacing: 8, color: COLORS.gold }}>
        CLIP SLOT {index + 1}
      </div>
      <div style={{ fontFamily: mono, fontSize: 18, color: COLORS.fgMuted, letterSpacing: 2 }}>
        drop a file in /public/clips/, then set clips[{index}] in Root.tsx
      </div>
    </div>
  </AbsoluteFill>
);
