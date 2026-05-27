import { AbsoluteFill, staticFile, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Audio } from "@remotion/media";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { COLORS, SCENES, TRANSITION_FRAMES } from "./theme";
import { Opener } from "./scenes/Opener";
import { Hook } from "./scenes/Hook";
import { Concept } from "./scenes/Concept";
import { Gameplay } from "./scenes/Gameplay";
import { EndScreen } from "./scenes/EndScreen";
import type { LaunchProps } from "./Root";

const sceneTransition = (
  <TransitionSeries.Transition
    presentation={fade()}
    timing={linearTiming({ durationInFrames: TRANSITION_FRAMES })}
  />
);

export const Launch: React.FC<LaunchProps> = ({ clips }) => {
  const frame = useCurrentFrame();
  const { durationInFrames, fps } = useVideoConfig();
  const musicVolume =
    interpolate(frame, [0, 0.5 * fps], [0, 0.85], { extrapolateRight: "clamp" }) *
    interpolate(frame, [durationInFrames - 1 * fps, durationInFrames], [1, 0], { extrapolateLeft: "clamp" });

  return (
    <AbsoluteFill style={{ background: COLORS.bg }}>
      <Audio src={staticFile("launch_music.mp3")} volume={musicVolume} />
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={SCENES.opener}>
          <Opener />
        </TransitionSeries.Sequence>
        {sceneTransition}
        <TransitionSeries.Sequence durationInFrames={SCENES.hook}>
          <Hook />
        </TransitionSeries.Sequence>
        {sceneTransition}
        <TransitionSeries.Sequence durationInFrames={SCENES.concept}>
          <Concept />
        </TransitionSeries.Sequence>
        {sceneTransition}
        <TransitionSeries.Sequence durationInFrames={SCENES.gameplay}>
          <Gameplay clips={clips} />
        </TransitionSeries.Sequence>
        {sceneTransition}
        <TransitionSeries.Sequence durationInFrames={SCENES.endScreen}>
          <EndScreen />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
