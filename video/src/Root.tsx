import { Composition } from "remotion";
import { Launch } from "./Launch";
import { EndCard } from "./scenes/EndScreen";
import { FPS, VIDEO_W, VIDEO_H, TOTAL_FRAMES, SCENES } from "./theme";

export type LaunchProps = {
  // Path(s) under public/clips for each gameplay slot. null = render a styled
  // placeholder. Drop your game clips into public/clips/, then update this
  // array to reference them, e.g. ["clips/round1.mp4", null, "clips/win.mp4", null].
  clips: (string | null)[];
};

export const RemotionRoot = () => {
  return (
    <>
      <Composition
        id="Launch"
        component={Launch}
        durationInFrames={TOTAL_FRAMES}
        fps={FPS}
        width={VIDEO_W}
        height={VIDEO_H}
        defaultProps={{
          clips: [
            "clips/create.mp4",  // slot 1 — CREATE A MATCH
            "clips/lockin.mp4",  // slot 2 — LOCK IN YOUR MOVE
            "clips/goal.mp4",    // slot 3 — GOAL.
            "clips/claim.mp4",   // slot 4 — WINNER TAKES THE POT
          ],
        } satisfies LaunchProps}
      />
      <Composition
        id="EndCard"
        component={EndCard}
        durationInFrames={SCENES.endScreen}
        fps={FPS}
        width={VIDEO_W}
        height={VIDEO_H}
      />
    </>
  );
};
