// Mirrors web/app/globals.css — keep in sync if brand colors change.
export const COLORS = {
  abyss: "#020410",
  bg: "#050714",
  panel: "#0a0f24",
  line: "#1a2542",
  fg: "#F2EFE6",
  fgSoft: "#8b94b2",
  fgMuted: "#6c7596",
  gold: "#FFC940",
  cyan: "#00E5FF",
  magenta: "#FF1F8B",
} as const;

export const FPS = 30;
export const VIDEO_W = 1920;
export const VIDEO_H = 1080;

// Scene durations in frames (30 fps).
export const SCENES = {
  opener: 4 * FPS,    // 4s
  hook: 10 * FPS,     // 10s
  concept: 7 * FPS,   // 7s
  gameplay: 25 * FPS, // 25s  (4 × 6.25s slots inside)
  endScreen: 5 * FPS, // 5s   (static — long enough to read URL)
} as const;

// Crossfade duration between every adjacent scene.
export const TRANSITION_FRAMES = 15; // 0.5s at 30fps
export const NUM_TRANSITIONS = 4;    // 5 scenes → 4 boundaries

// Each transition overlaps the two scenes it joins, so the total is shorter
// than the simple sum by (transitions × overlap).
export const TOTAL_FRAMES =
  SCENES.opener + SCENES.hook + SCENES.concept + SCENES.gameplay + SCENES.endScreen
  - NUM_TRANSITIONS * TRANSITION_FRAMES;
